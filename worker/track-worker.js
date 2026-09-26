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

    if ((path === '/api/stats' || path === '/api/test' || path === '/api/users') && env.STATS_KEY && url.searchParams.get('key') === env.STATS_KEY) {
      if (path === '/api/test') {
        const ok = await sendMail(env, '[napell.space] telemetry test', 'Telemetry worker is live. If you can read this, the mail channel works — the daily report will arrive at 08:00 HKT.');
        return json({ sent: ok, status: sendMail.lastStatus, body: (sendMail.lastBody || '').slice(0, 300) });
      }
      if (path === '/api/users') {
        return handleUsers(env, url);
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
  },

  async scheduled(event, env, ctx) {
    // 00:00 UTC = 08:00 HKT — report on the HKT day that just ended
    const date = hktDate(Date.now() - 8 * 3600 * 1000 - 60 * 1000);
    ctx.waitUntil(aggregateAndMail(env, date));
  }
};
