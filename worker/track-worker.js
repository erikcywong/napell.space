/**
 * track-worker.js — napell.space visitor telemetry collector (Cloudflare Worker)
 *
 * WHAT IT DOES
 *   POST /api/track   — receives beacons from js/main.js (pageview, outbound click)
 *                       and js/auth.js (login attempts on the Costs section).
 *                       Enriches each event with the visitor's real IP, country,
 *                       city, region, ASN and user agent (client JS cannot see these).
 *   GET  /api/stats   — ?key=STATS_KEY&day=YYYY-MM-DD&format=json|text
 *                       returns the aggregated day (or today, HKT) on the fly.
 *   GET  /api/test    — ?key=STATS_KEY  sends a test email (use this once after
 *                       deploying: FormSubmit emails an activation link first).
 *   Cron "0 0 * * *"  — 08:00 HKT daily: aggregates the previous HKT day and
 *                       emails the report to MAIL_TO.
 *
 * BINDINGS / SETTINGS (dashboard → Workers → Settings)
 *   KV namespace   : binding name TRACK
 *   Variables      : MAIL_TO  = erik.wong@napell.bio
 *                    STATS_KEY = <random secret of your own>
 *   Secret (optional): RESEND_KEY — if set, mail goes via Resend;
 *                    otherwise FormSubmit.co (free, no signup, but the very
 *                    first send triggers an activation email — click it once).
 *   Route          : napell.space/api/*   (zone: napell.space)
 *   Cron Triggers  : 0 0 * * *
 *
 * STORAGE LAYOUT (KV, TTL 8 days — enough for the daily cron, self-cleaning)
 *   e:<hktdate>:<ms>-<rand>  pageview / outbound events
 *   l:<hktdate>:<ms>-<rand>  login events
 * HKT date = UTC+8, so the report day matches Hong Kong calendar days.
 *
 * FREE-TIER NOTE: KV allows 1,000 writes/day — one write per beacon. Fine for
 * an investor site; if traffic grows, move events to D1.
 */

const MAIL_FROM = 'napell.space telemetry <onboarding@resend.dev>';
const HKT = 8 * 3600 * 1000;

function hktDate(ms) {
  return new Date(ms + HKT).toISOString().slice(0, 10);
}

function clamp(v, n) {
  return typeof v === 'string' ? v.slice(0, n) : undefined;
}

function rand() {
  return Math.random().toString(36).slice(2, 10);
}

/* ─── Ingest ─── */

async function handleTrack(req, env, ctx) {
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response('bad json', { status: 400 });
  }
  if (!body || typeof body !== 'object') return new Response('bad body', { status: 400 });

  const now = Date.now();
  const cf = req.cf || {};
  const ev = {
    ts: now,
    ip: req.headers.get('cf-connecting-ip') || 'unknown',
    ua: clamp(req.headers.get('user-agent'), 180) || '',
    city: clamp(cf.city, 60) || '',
    region: clamp(cf.region, 60) || '',
    country: clamp(cf.country, 8) || '',
    asn: cf.asn ? String(cf.asn) + (cf.asOrganization ? ' ' + clamp(cf.asOrganization, 60) : '') : '',
    t: body.t === 'login' ? 'login' : body.t === 'out' ? 'out' : 'pv',
    p: clamp(body.p, 220),
    r: clamp(body.r, 320),
    u: clamp(body.u, 220),
    sid: clamp(body.sid, 48) || 'nosid',
    lang: clamp(body.lang, 8) || '',
    user: clamp(body.user, 60),
    ok: !!body.ok
  };

  const date = hktDate(now);
  const prefix = ev.t === 'login' ? 'l' : 'e';
  const key = `${prefix}:${date}:${now}-${rand()}`;
  await env.TRACK.put(key, JSON.stringify(ev), { expirationTtl: 8 * 86400 });

  // Admin logins are rare — alert immediately, don't wait for the daily digest
  if (ev.t === 'login') {
    ctx.waitUntil(sendMail(env,
      `[napell.space] Costs login ${ev.ok ? 'SUCCESS' : 'FAILED'} — ${ev.user || '?'}`,
      loginAlertText(ev)));
  }
  return new Response('ok');
}

/* ─── Aggregation ─── */

async function loadDay(env, date) {
  const rec = { date, pv: 0, out: 0, ips: {}, paths: {}, refs: {}, outUrls: {}, sessions: {}, logins: [], regs: [] };
  for (const prefix of ['e', 'l', 'r']) {
    let cursor;
    do {
      const page = await env.TRACK.list({ prefix: `${prefix}:${date}:`, cursor });
      cursor = page.list_complete ? undefined : page.cursor;
      for (const k of page.keys) {
        let ev;
        try { ev = JSON.parse(await env.TRACK.get(k.name)); } catch (e) { continue; }
        if (!ev) continue;
        if (prefix === 'l') { rec.logins.push(ev); continue; }
        if (prefix === 'r') { rec.regs.push(ev); continue; }
        if (ev.t === 'out') {
          rec.out += 1;
          rec.outUrls[ev.u || '?'] = (rec.outUrls[ev.u || '?'] || 0) + 1;
          continue;
        }
        rec.pv += 1;
        const ip = ev.ip || 'unknown';
        if (!rec.ips[ip]) {
          rec.ips[ip] = { views: 0, first: ev.ts, last: ev.ts, city: ev.city, region: ev.region, country: ev.country, asn: ev.asn, ua: ev.ua, sids: new Set() };
        }
        const o = rec.ips[ip];
        o.views += 1;
        o.first = Math.min(o.first, ev.ts);
        o.last = Math.max(o.last, ev.ts);
        if (ev.city) o.city = ev.city;
        if (ev.country) o.country = ev.country;
        o.sids.add(ev.sid);
        rec.paths[ev.p || '?'] = (rec.paths[ev.p || '?'] || 0) + 1;
        if (ev.r) rec.refs[ev.r] = (rec.refs[ev.r] || 0) + 1;
        if (!rec.sessions[ev.sid]) rec.sessions[ev.sid] = { ip, trail: [] };
        if (ev.p && rec.sessions[ev.sid].trail[rec.sessions[ev.sid].trail.length - 1] !== ev.p) {
          rec.sessions[ev.sid].trail.push(ev.p);
        }
      }
    } while (cursor);
  }
  rec.logins.sort((a, b) => a.ts - b.ts);
  return rec;
}

function topObj(obj, n) {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);
}

function hhmm(ts) {
  return new Date(ts + HKT).toISOString().slice(11, 16);
}

function locationLabel(v) {
  return [v.city, v.region, v.country].filter(Boolean).join(', ') || 'unknown';
}

function buildReportText(rec) {
  const lines = [];
  lines.push(`napell.space daily report — ${rec.date} (HKT)`);
  lines.push(`Page views: ${rec.pv} · Unique IPs: ${Object.keys(rec.ips).length} · Sessions: ${Object.keys(rec.sessions).length} · Outbound clicks: ${rec.out} · Login events: ${rec.logins.length} · New registrations: ${rec.regs.length}`);
  lines.push('');

  lines.push('== VISITORS ==');
  const ips = Object.entries(rec.ips).sort((a, b) => b[1].views - a[1].views);
  for (const [ip, v] of ips) {
    lines.push(`${ip} · ${locationLabel(v)}${v.asn ? ' · ' + v.asn : ''} · ${v.views} views · ${hhmm(v.first)}–${hhmm(v.last)} · ${v.ua}`);
    for (const sid of v.sids) {
      const s = rec.sessions[sid];
      if (s && s.trail.length) lines.push(`     trail: ${s.trail.slice(0, 12).join(' → ')}${s.trail.length > 12 ? ' → …' : ''}`);
    }
  }
  if (!ips.length) lines.push('(no page views)');

  lines.push('', '== REFERRERS ==');
  const refs = topObj(rec.refs, 15);
  if (refs.length) for (const [r, n] of refs) lines.push(`${n}  ${r}`);
  else lines.push('(none recorded)');

  lines.push('', '== PAGES ==');
  for (const [p, n] of topObj(rec.paths, 20)) lines.push(`${n}  ${p}`);

  lines.push('', '== OUTBOUND CLICKS ==');
  const outs = topObj(rec.outUrls, 15);
  if (outs.length) for (const [u, n] of outs) lines.push(`${n}  ${u}`);
  else lines.push('(none)');

  lines.push('', '== COSTS LOGINS ==');
  if (rec.logins.length) {
    for (const l of rec.logins) {
      lines.push(`${hhmm(l.ts)}  ${l.user || '?'}  ${l.ok ? 'SUCCESS' : 'FAILED'}  ${l.ip} (${locationLabel(l)})`);
    }
  } else {
    lines.push('(none)');
  }

  lines.push('', '== NEW REGISTRATIONS ==');
  if (rec.regs.length) {
    for (const r of rec.regs) {
      lines.push(`${hhmm(r.ts)}  ${r.type}: ${r.id}  ${r.name || ''}  ${r.ip} (${locationLabel(r)})`);
    }
  } else {
    lines.push('(none)');
  }
  lines.push('', '— sent by the napell.space telemetry worker. Illustrative data; this mailbox receives one digest per day plus instant login alerts.');
  return lines.join('\n');
}

/* ─── Mail ─── */

async function sendMail(env, subject, text) {
  const to = env.MAIL_TO || 'erik.wong@napell.bio';
  try {
    if (env.RESEND_KEY) {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + env.RESEND_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: MAIL_FROM, to: [to], subject, text })
      });
      return r.ok;
    }
    // FormSubmit: free, no signup. First-ever send makes FormSubmit email an
    // activation link to `to` — click it once and all later sends go through.
    // FormSubmit requires a Referer header (it must look like a web-page form),
    // so we present ourselves as the site.
    const r = await fetch(`https://formsubmit.co/ajax/${to}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Referer': 'https://www.napell.space/' },
      body: JSON.stringify({ _subject: subject, _template: 'box', Report: text })
    });
    sendMail.lastStatus = r.status;
    sendMail.lastBody = await r.text().catch(() => '');
    return r.ok;
  } catch (e) {
    sendMail.lastStatus = 'exception: ' + (e && e.message);
    return false;
  }
}

function loginAlertText(ev) {
  return [
    `Costs section login ${ev.ok ? 'SUCCESS' : 'FAILED'}`,
    ``,
    `time     : ${new Date(ev.ts + HKT).toISOString().replace('T', ' ').slice(0, 19)} HKT`,
    `user     : ${ev.user || '?'}`,
    `ip       : ${ev.ip}`,
    `location : ${locationLabel(ev)}`,
    `network  : ${ev.asn || 'n/a'}`,
    `agent    : ${ev.ua || 'n/a'}`,
    `page     : costs / riyadh admin gate`
  ].join('\n');
}

/* ─── Auth: registration & login for the Costs section ───
   Registers visitors by email / mobile / WeChat ID + password.
   Records live in KV (no TTL) as u:<type>:<id>; every registration
   triggers an instant email to the owner and is included in the daily
   digest. Legacy admin accounts (erik.wong / James) stay client-side. */

const AUTH_TYPES = ['email', 'mobile', 'wechat'];

function corsHeaders(req) {
  const origin = req.headers.get('origin') || '';
  const allow = /(^|\.)napell\.space$/.test((origin || '').replace(/^https?:\/\//, '').split('/')[0]) ? origin : '*';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

async function sha256hex(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function jsonCORS(obj, req, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(req) }
  });
}

function normId(type, id) {
  const v = (id || '').trim();
  if (!v) return '';
  return type === 'email' ? v.toLowerCase() : v.replace(/\s+/g, '');
}

function enrich(req) {
  const cf = req.cf || {};
  return {
    ip: req.headers.get('cf-connecting-ip') || 'unknown',
    ua: clamp(req.headers.get('user-agent'), 180) || '',
    city: clamp(cf.city, 60) || '',
    region: clamp(cf.region, 60) || '',
    country: clamp(cf.country, 8) || '',
    asn: cf.asn ? String(cf.asn) + (cf.asOrganization ? ' ' + clamp(cf.asOrganization, 60) : '') : ''
  };
}

async function handleRegister(req, env, ctx) {
  let body;
  try { body = await req.json(); } catch (e) { return jsonCORS({ ok: false, error: 'bad json' }, req, 400); }
  const type = AUTH_TYPES.includes(body.type) ? body.type : '';
  const id = normId(type, body.id);
  const name = clamp(body.name, 60) || '';
  const pass = typeof body.pass === 'string' ? body.pass : '';
  if (!type || !id || !pass) return jsonCORS({ ok: false, error: 'missing fields' }, req, 400);
  if (pass.length < 6 || pass.length > 72) return jsonCORS({ ok: false, error: 'bad password length' }, req, 400);

  // Rough per-IP daily rate limit: max 20 registrations / logins per day per IP
  const now = Date.now();
  const date = hktDate(now);
  const rlKey = `rl:${date}:${req.headers.get('cf-connecting-ip') || 'unknown'}`;
  const count = parseInt((await env.TRACK.get(rlKey)) || '0', 10);
  if (count >= 20) return jsonCORS({ ok: false, error: 'rate limited' }, req, 429);
  ctx.waitUntil(env.TRACK.put(rlKey, String(count + 1), { expirationTtl: 2 * 86400 }));

  const key = `u:${type}:${id}`;
  const existing = await env.TRACK.get(key);
  if (existing) return jsonCORS({ ok: false, error: 'exists' }, req, 200);

  const salt = rand() + rand();
  const rec = {
    type, id, name,
    salt,
    hash: await sha256hex(salt + ':' + pass),
    created: now,
    lastLogin: null,
    ips: [],
    ...enrich(req)
  };
  await env.TRACK.put(key, JSON.stringify(rec));
  // Registration event for the daily digest (30-day TTL)
  const regEv = { ts: now, t: 'reg', type, id, name, ...enrich(req) };
  await env.TRACK.put(`r:${date}:${now}-${rand()}`, JSON.stringify(regEv), { expirationTtl: 30 * 86400 });

  // Instant email to the owner
  ctx.waitUntil(sendMail(env,
    `[napell.space] New registration — ${type}: ${id}`,
    [
      `New Costs registration`,
      ``,
      `method   : ${type}`,
      `account  : ${id}`,
      `name     : ${name || '(not given)'}`,
      `time     : ${new Date(now + HKT).toISOString().replace('T', ' ').slice(0, 19)} HKT`,
      `ip       : ${regEv.ip}`,
      `location : ${locationLabel(regEv)}`,
      `network  : ${regEv.asn || 'n/a'}`,
      `agent    : ${regEv.ua || 'n/a'}`,
      ``
    ].join('\n')));

  return jsonCORS({ ok: true, type, name }, req);
}

async function handleLogin(req, env, ctx) {
  let body;
  try { body = await req.json(); } catch (e) { return jsonCORS({ ok: false, error: 'bad json' }, req, 400); }
  const pass = typeof body.pass === 'string' ? body.pass : '';
  const id = (body.id || '').trim().toLowerCase();
  if (!id || !pass) return jsonCORS({ ok: false }, req);

  const now = Date.now();
  const date = hktDate(now);
  const rlKey = `rl:${date}:${req.headers.get('cf-connecting-ip') || 'unknown'}`;
  const count = parseInt((await env.TRACK.get(rlKey)) || '0', 10);
  if (count >= 20) return jsonCORS({ ok: false, error: 'rate limited' }, req, 429);
  ctx.waitUntil(env.TRACK.put(rlKey, String(count + 1), { expirationTtl: 2 * 86400 }));

  let hit = null, hitType = '';
  for (const t of AUTH_TYPES) {
    const raw = await env.TRACK.get(`u:${t}:${id}`);
    if (raw) { hit = JSON.parse(raw); hitType = t; break; }
  }
  if (!hit) return jsonCORS({ ok: false }, req);
  const ok = (await sha256hex(hit.salt + ':' + pass)) === hit.hash;
  if (ok) {
    hit.lastLogin = now;
    const e = enrich(req);
    hit.ips = [...new Set([...(hit.ips || []), e.ip])].slice(-10);
    hit.lastCity = e.city; hit.lastCountry = e.country;
    await env.TRACK.put(`u:${hitType}:${id}`, JSON.stringify(hit));
    // Login event — joins the daily report and the instant TRACK alert
    await env.TRACK.put(`l:${date}:${now}-${rand()}`,
      JSON.stringify({ ts: now, t: 'login', user: id, ok: true, ...e }), { expirationTtl: 8 * 86400 });
  }
  return jsonCORS({ ok, name: ok ? hit.name || '' : '' }, req);
}

async function handleUsers(env, url) {
  const users = [];
  let cursor;
  do {
    const page = await env.TRACK.list({ prefix: 'u:', cursor });
    cursor = page.list_complete ? undefined : page.cursor;
    for (const k of page.keys) {
      try {
        const rec = JSON.parse(await env.TRACK.get(k.name));
        users.push({ type: rec.type, id: rec.id, name: rec.name, created: rec.created, lastLogin: rec.lastLogin, ips: rec.ips, lastCity: rec.lastCity, lastCountry: rec.lastCountry });
      } catch (e) { /* skip */ }
    }
  } while (cursor);
  if (url.searchParams.get('format') === 'text') {
    const lines = users.map((u) =>
      `${u.type.padEnd(7)} ${u.id}  ${u.name || ''}  created ${new Date(u.created + HKT).toISOString().slice(0, 10)}  lastLogin ${u.lastLogin ? new Date(u.lastLogin + HKT).toISOString().replace('T', ' ').slice(0, 16) : 'never'}  ${[u.lastCity, u.lastCountry].filter(Boolean).join(', ')}`);
    return new Response(lines.join('\n') || '(no users yet)', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  return json(users);
}

/* ─── QR-gated site access (Option C: sliding TTL + leave-kill with grace) ───
   www.napell.space/* is served by this worker from the SITE KV mirror.
   Entry only via one-time QR tokens: /access?t=TOKEN burns the token and
   sets a signed session cookie (60-min sliding idle window). Leaving the
   site (pagehide without an internal link click) schedules the session's
   death after a 45s grace — a reload cancels the pending kill. */

const SITE_TTL = 60 * 60 * 1000;   // sliding idle window
const SITE_GRACE = 45 * 1000;      // grace before a "leave" becomes final

/* Gate page — branded, tri-lingual (EN / 中文 / العربية, RTL aware).
   Layout: language pills → brand → confidential status → request channels.
   kind: 'private' | 'used' | 'ended' | 'invalid' */
function gatePage(kind) {
  return new Response(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Private access — napell.space</title>
<style>
  * { box-sizing:border-box; }
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
         background:#000; color:#e7e9ea; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans Arabic",sans-serif; }
  .frame { position:relative; max-width:440px; width:calc(100% - 48px); margin:32px 0; padding:38px 30px 30px;
           border:1px solid #282c30; outline:1px solid #1a1d20; outline-offset:5px; text-align:center; }
  .langs { position:absolute; top:12px; right:14px; display:flex; gap:6px; }
  .langs button { background:none; border:1px solid #2f3336; color:#71767b; font-size:11px; padding:3px 9px;
                  border-radius:999px; cursor:pointer; font-family:inherit; }
  .langs button.on { border-color:#1d9bf0; color:#1d9bf0; }
  .lock { width:50px; height:50px; margin:6px auto 18px; border:1px solid #2f3336; border-radius:14px;
          display:flex; align-items:center; justify-content:center; color:#1d9bf0; }
  .brand h1 { font-size:26px; letter-spacing:.14em; margin:0; font-weight:700; }
  .brand .sub { font-size:11px; letter-spacing:.26em; color:#71767b; margin-top:5px; }
  .rule { width:64px; height:2px; background:#1d9bf0; margin:22px auto; }
  .status .tag { font-size:13px; letter-spacing:.24em; color:#1d9bf0; font-weight:700; }
  .status h2 { font-size:19px; margin:8px 0 8px; font-weight:600; }
  .status p { font-size:13.5px; color:#71767b; line-height:1.65; margin:0 auto; max-width:330px; }
  .req { margin-top:26px; padding-top:22px; border-top:1px solid #282c30; }
  .req .hd { font-size:13px; font-weight:600; margin-bottom:4px; }
  .req .sub { font-size:12px; color:#71767b; margin-bottom:14px; }
  .ch { display:flex; flex-direction:column; gap:8px; }
  .ch a, .ch button { display:flex; align-items:center; gap:11px; padding:10px 14px; text-decoration:none;
        border:1px solid #2f3336; border-radius:10px; color:#e7e9ea; font-size:13.5px; font-family:inherit;
        background:none; cursor:pointer; text-align:start; }
  .ch a:hover, .ch button:hover { border-color:#1d9bf0; }
  .ch .ic { width:20px; height:20px; flex:0 0 20px; color:#1d9bf0; }
  .ch .t { flex:1; }
  .ch .t b { display:block; font-size:13.5px; font-weight:600; }
  .ch .t span { display:block; font-size:11.5px; color:#71767b; margin-top:1px; direction:ltr; }
  .foot { margin-top:24px; font-size:10.5px; letter-spacing:.28em; color:#1d9bf0; text-transform:uppercase; }
  .copied { color:#00ba7c !important; }
  html[dir="rtl"] .langs { right:auto; left:14px; }
  html[dir="rtl"] .ch a, html[dir="rtl"] .ch button { text-align:end; }
</style></head><body>
<div class="frame">
  <div class="langs">
    <button data-l="en" class="on">EN</button><button data-l="zh">中文</button><button data-l="ar">ع</button>
  </div>
  <div class="lock"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
  <div class="brand"><h1>NAPELL</h1><div class="sub">SEEDLINGS · AEROPONIC COFFEE</div></div>
  <div class="rule"></div>
  <div class="status"><div class="tag" id="g-tag"></div><h2 id="g-title"></h2><p id="g-msg"></p></div>
  <div class="req">
    <div class="hd" id="g-rhd"></div>
    <div class="sub" id="g-rsub"></div>
    <div class="ch">
      <a id="c-wa" target="_blank" rel="noopener">
        <svg class="ic" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4l.9 2.1c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.3.8 1.4 1.8 2.2 1.2 1.1 2.3 1.4 2.6 1.6.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.4 0 .1 0 .7-.2 1.3z"/></svg>
        <span class="t"><b>WhatsApp</b><span id="c-wa-n">+852 9318 8252</span></span>
      </a>
      <button id="c-wx" type="button">
        <svg class="ic" viewBox="0 0 24 24" fill="currentColor"><path d="M8.7 4C4.9 4 1.8 6.6 1.8 9.9c0 1.8 1 3.4 2.5 4.5l-.6 2 2.2-1.1c.6.2 1.3.3 2 .3h.4a5.5 5.5 0 0 1-.2-1.5c0-3.1 3-5.6 6.6-5.6h.4C14.5 6 11.9 4 8.7 4zM6.4 7.3c.5 0 .8.3.8.8s-.4.8-.8.8-.9-.4-.9-.8.4-.8.9-.8zm4.6 0c.5 0 .8.3.8.8s-.3.8-.8.8-.9-.4-.9-.8.4-.8.9-.8zM15.4 9.7c-3.2 0-5.8 2.2-5.8 4.9 0 2.7 2.6 4.9 5.8 4.9.6 0 1.2-.1 1.8-.3l1.9.9-.5-1.7c1.3-.9 2.1-2.3 2.1-3.8 0-2.7-2.6-4.9-5.8-4.9zm-2 2.5c.4 0 .7.3.7.7s-.3.7-.7.7-.7-.3-.7-.7.3-.7.7-.7zm4 0c.4 0 .7.3.7.7s-.3.7-.7.7-.7-.3-.7-.7.3-.7.7-.7z"/></svg>
        <span class="t"><b id="c-wx-l">WeChat</b><span id="c-wx-n">+86 158 0022 2338</span></span>
      </button>
      <a id="c-em">
        <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>
        <span class="t"><b>Email</b><span id="c-em-n">erik.wong@napell.bio</span></span>
      </a>
    </div>
  </div>
  <div class="foot">napell.space · the space</div>
</div>
<script>
(function () {
  var K = ${JSON.stringify(kind)};
  var T = {
    en: {
      tag: "CONFIDENTIAL",
      t: { private:"A private presentation", used:"Access code already used", ended:"Session ended", invalid:"Invalid access code" },
      m: { private:"Entry is by invitation only. Each invitation opens the proposal once — access stays live for 60 minutes after entry, and closes for good after you leave.",
           used:"Each code opens the door exactly once. Please request a new one below.",
           ended:"Your access window has closed. Scan a new code to re-enter.",
           invalid:"This link is not a valid one-time access code." },
      rhd:"Request an access code", rsub:"Reach me directly — codes are issued personally.",
      wx:"WeChat", wxcp:"Tap to copy WeChat ID", copied:"Copied ✓",
      waTxt:"Hello Erik, I would like to request a one-time access code for the proposal at napell.space.",
      emSub:"Request: access code for napell.space",
      emBody:"Hello Erik,%0D%0A%0D%0AI would like to request a one-time access code for the proposal at napell.space.%0D%0A%0D%0AName: %0D%0AOrganisation: "
    },
    zh: {
      tag: "机密文件",
      t: { private:"仅限受邀者的私密提案", used:"访问码已被使用", ended:"访问会话已结束", invalid:"访问码无效" },
      m: { private:"本提案凭邀请进入。每份邀请仅可打开一次，进入后可浏览 60 分钟，离开后即刻失效。",
           used:"每个访问码只能开启一次。请在下方重新申请。",
           ended:"你的访问时限已结束。请扫描新的二维码再次进入。",
           invalid:"此链接不是有效的一次性访问码。" },
      rhd:"申请访问码", rsub:"直接联系我——访问码由本人亲自发放。",
      wx:"微信", wxcp:"点击复制微信号", copied:"已复制 ✓",
      waTxt:"Erik 你好，我想申请 napell.space 提案的一次性访问码。",
      emSub:"申请：napell.space 访问码",
      emBody:"Erik 你好：%0D%0A%0D%0A我想申请 napell.space 提案的一次性访问码。%0D%0A%0D%0A姓名： %0D%0A机构： "
    },
    ar: {
      tag: "سري للغاية",
      t: { private:"عرض خاص بدعوة فقط", used:"رمز الدخول مستخدم بالفعل", ended:"انتهت جلسة الدخول", invalid:"رمز دخول غير صالح" },
      m: { private:"الدخول بدعوة فقط. كل دعوة تفتح العرض مرة واحدة — يبقى الدخول متاحاً 60 دقيقة بعد الدخول، وينتهي نهائياً بعد مغادرتك.",
           used:"كل رمز يفتح الباب مرة واحدة فقط. يرجى طلب رمز جديد أدناه.",
           ended:"انتهت فترة دخولك. امسح رمزاً جديداً للدخول مرة أخرى.",
           invalid:"هذا الرابط ليس رمز دخول صالحاً." },
      rhd:"اطلب رمز دخول", rsub:"تواصل معي مباشرة — تُسلَّم الرموز شخصياً.",
      wx:"وي تشات", wxcp:"انقر لنسخ معرف وي تشات", copied:"تم النسخ ✓",
      waTxt:"مرحباً إريك، أود طلب رمز دخول لعرض napell.space.",
      emSub:"طلب: رمز دخول لـ napell.space",
      emBody:"مرحباً إريك،%0D%0A%0D%0Aأود طلب رمز دخول لعرض napell.space.%0D%0A%0D%0Aالاسم: %0D%0Aالجهة: "
    }
  };
  var wa = "https://wa.me/85293188252?text=" + encodeURIComponent(T.en.waTxt);
  var em = "mailto:erik.wong@napell.bio?subject=" + encodeURIComponent(T.en.emSub);
  document.getElementById("c-wa").href = wa;
  document.getElementById("c-em").href = em;
  document.getElementById("c-wx").addEventListener("click", function () {
    var n = document.getElementById("c-wx-n"), l = document.getElementById("c-wx-l"), lang = document.documentElement.lang || "en";
    function done() { var o = l.textContent; l.textContent = T[lang] ? T[lang].copied : "Copied ✓"; l.classList.add("copied");
      setTimeout(function(){ l.textContent = o; l.classList.remove("copied"); }, 1800); }
    if (navigator.clipboard) navigator.clipboard.writeText(n.textContent).then(done, done); else done();
  });
  function setL(lang) {
    var t = T[lang]; document.documentElement.lang = lang;
    document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";
    document.getElementById("g-tag").textContent = t.tag;
    document.getElementById("g-title").textContent = t.t[K];
    document.getElementById("g-msg").textContent = t.m[K];
    document.getElementById("g-rhd").textContent = t.rhd;
    document.getElementById("g-rsub").textContent = t.rsub;
    document.getElementById("c-wx-l").textContent = t.wx;
    document.querySelectorAll(".langs button").forEach(function (b) { b.classList.toggle("on", b.dataset.l === lang); });
  }
  document.querySelectorAll(".langs button").forEach(function (b) {
    b.addEventListener("click", function () { setL(b.dataset.l); });
  });
  var nav = (navigator.language || "en").toLowerCase();
  setL(nav.indexOf("zh") === 0 ? "zh" : nav.indexOf("ar") === 0 ? "ar" : "en");
})();
</script>
</body></html>`, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

async function signSession(env, sid, exp) {
  return sha256hex((env.GATE_SECRET || '') + '.' + sid + '.' + exp);
}

async function readSession(req, env) {
  const m = (req.headers.get('cookie') || '').match(/(?:^|;\s*)nsx=([0-9a-f]+)\.(\d+)\.([0-9a-f]+)/);
  if (!m) return null;
  const sid = m[1], exp = Number(m[2]), sig = m[3];
  if (!exp || Date.now() > exp) return null;
  if (sig !== (await signSession(env, sid, String(exp)))) return null;
  return { sid, exp };
}

async function sessionCookie(env, sid, exp) {
  const sig = await signSession(env, sid, String(exp));
  return `nsx=${sid}.${exp}.${sig}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${Math.floor(SITE_TTL / 1000)}`;
}

async function handleAccess(req, env, ctx) {
  const url = new URL(req.url);
  const tok = (url.searchParams.get('t') || '').trim().toLowerCase();
  if (!/^[0-9a-f]{16,64}$/.test(tok)) {
    return gatePage('invalid');
  }
  const cur = await env.SITE.get('t:' + tok);
  if (cur !== '1') {
    return gatePage('used');
  }
  ctx.waitUntil(env.SITE.put('t:' + tok, JSON.stringify({ used: Date.now(), ip: req.headers.get('cf-connecting-ip') || '' })));
  const sid = (await sha256hex(String(Date.now()) + tok + rand() + rand())).slice(0, 32);
  const exp = Date.now() + SITE_TTL;
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/',
      'Set-Cookie': await sessionCookie(env, sid, exp),
      'Cache-Control': 'no-store'
    }
  });
}

async function handleLeave(req, env) {
  const s = await readSession(req, env);
  if (s) {
    // Schedule death after the grace period; a reload cancels it.
    await env.SITE.put('x:' + s.sid, String(Date.now() + SITE_GRACE), { expirationTtl: 86400 });
  }
  return new Response(null, { status: 204 });
}

const SITE_MIME = {
  html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', js: 'application/javascript; charset=utf-8',
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', svg: 'image/svg+xml', ico: 'image/x-icon',
  txt: 'text/plain; charset=utf-8', json: 'application/json', woff2: 'font/woff2', webp: 'image/webp'
};

async function serveSite(req, env, ctx) {
  const s = await readSession(req, env);
  if (!s) return gatePage('private');
  const revoked = await env.SITE.get('x:' + s.sid);
  if (revoked && Date.now() >= Number(revoked)) {
    return gatePage('ended');
  }

  let p;
  try { p = decodeURIComponent(new URL(req.url).pathname); } catch (e) { p = '/'; }
  if (p.endsWith('/')) p += 'index.html';
  const candidates = [p];
  if (!p.includes('.')) candidates.push(p + '/index.html', p + '.html');

  let value = null, meta = null, used = p;
  for (const c of candidates) {
    const r = await env.SITE.getWithMetadata('f:' + c, { type: 'arrayBuffer' });
    if (r.value !== null) { value = r.value; meta = r.metadata || {}; used = c; break; }
  }

  const ext = (used.slice(used.lastIndexOf('.') + 1) || 'html').toLowerCase();
  const ct = (meta && meta.contentType) || SITE_MIME[ext] || 'application/octet-stream';
  const isHtml = ct.includes('html');

  const headers = {
    'Content-Type': ct,
    'Cache-Control': isHtml ? 'private, no-store' : 'public, max-age=3600',
    'Set-Cookie': await sessionCookie(env, s.sid, Date.now() + SITE_TTL)
  };
  if (value === null) {
    return new Response(isHtml ? '' : null, { status: 404, headers });
  }
  ctx.waitUntil(env.SITE.delete('x:' + s.sid)); // page view cancels a pending "leave"
  if ((req.method || 'GET') === 'HEAD') return new Response(null, { status: 200, headers });
  if (isHtml) return new Response(new TextDecoder().decode(value), { status: 200, headers });
  return new Response(value, { status: 200, headers });
}

async function handleTokens(env, url, ctx) {
  const n = Math.min(parseInt(url.searchParams.get('n') || '1', 10) || 1, 50);
  const out = [];
  for (let i = 0; i < n; i++) {
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    const t = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
    out.push('https://www.napell.space/access?t=' + t);
    ctx.waitUntil(env.SITE.put('t:' + t, '1'));
  }
  if (url.searchParams.get('format') === 'text') {
    return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  return json(out);
}

/* ─── Router ─── */

async function aggregateAndMail(env, date) {
  const rec = await loadDay(env, date);
  return sendMail(env, `[napell.space] Daily report ${date} — ${rec.pv} views, ${Object.keys(rec.ips).length} IPs`, buildReportText(rec));
}

function json(res, status = 200) {
  return new Response(JSON.stringify(res, null, 2), { status, headers: { 'Content-Type': 'application/json' } });
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const path = url.pathname;
    const isApi = url.hostname === 'api.napell.space' || path.startsWith('/api/');

    if (isApi) {
      // CORS preflight for the auth endpoints
      if (req.method === 'OPTIONS' && (path === '/api/auth/register' || path === '/api/auth/login')) {
        return new Response(null, { status: 204, headers: corsHeaders(req) });
      }

      if (path === '/api/auth/register' && req.method === 'POST') {
        return handleRegister(req, env, ctx);
      }
      if (path === '/api/auth/login' && req.method === 'POST') {
        return handleLogin(req, env, ctx);
      }
      if (path === '/api/track' && req.method === 'POST') {
        return handleTrack(req, env, ctx);
      }
      if (path === '/api/leave' && req.method === 'POST') {
        return handleLeave(req, env);
      }

      if ((path === '/api/stats' || path === '/api/test' || path === '/api/users' || path === '/api/tokens') && env.STATS_KEY && url.searchParams.get('key') === env.STATS_KEY) {
        if (path === '/api/test') {
          const ok = await sendMail(env, '[napell.space] telemetry test', 'Telemetry worker is live. If you can read this, the mail channel works — the daily report will arrive at 08:00 HKT.');
          return json({ sent: ok, status: sendMail.lastStatus, body: (sendMail.lastBody || '').slice(0, 300) });
        }
        if (path === '/api/users') {
          return handleUsers(env, url);
        }
        if (path === '/api/tokens') {
          return handleTokens(env, url, ctx);
        }
        const day = url.searchParams.get('day') || hktDate(Date.now());
        const rec = await loadDay(env, day);
        if (url.searchParams.get('format') === 'text') {
          return new Response(buildReportText(rec), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
        }
        for (const ip of Object.values(rec.ips)) ip.sids = [...ip.sids];
        return json(rec);
      }

      return new Response('not found', { status: 404 });
    }

    // ── Gated presentation site (www.napell.space) ──
    if ((req.method === 'GET' || req.method === 'HEAD')) {
      if (path === '/access') return handleAccess(req, env, ctx);
      return serveSite(req, env, ctx);
    }
    return new Response('not found', { status: 404 });
  },

  async scheduled(event, env, ctx) {
    // 00:00 UTC = 08:00 HKT — report on the HKT day that just ended
    const date = hktDate(Date.now() - 8 * 3600 * 1000 - 60 * 1000);
    ctx.waitUntil(aggregateAndMail(env, date));
  }
};
