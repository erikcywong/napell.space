#!/usr/bin/env node
/**
 * deploy-site.mjs — mirror the static site into Cloudflare KV (namespace napell_site).
 * The gate worker (napell-track) serves www.napell.space from this mirror.
 *
 * Usage:
 *   node tools/deploy-site.mjs <CF_API_TOKEN> <ACCOUNT_ID> <KV_NAMESPACE_ID>
 *
 * Uploads every site file (html/css/js/images/robots.txt) as f:<path> with
 * {contentType} metadata. Safe to re-run — it simply overwrites.
 *
 * Why https.request() and not fetch(): this machine's resolver is a local stub
 * (127.0.0.1) that intermittently refuses queries for api.cloudflare.com, and
 * Node's global fetch offers no hook for a custom lookup. https.request({lookup})
 * does — so when the system resolver fails we retry the name against public DNS,
 * and every file gets a few attempts before it is called a failure.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { request } from 'node:https';
import dns from 'node:dns';

const [token, accountId, nsId] = process.argv.slice(2);
if (!token || !accountId || !nsId) {
  console.error('usage: node tools/deploy-site.mjs <CF_API_TOKEN> <ACCOUNT_ID> <KV_NAMESPACE_ID>');
  process.exit(1);
}

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const INCLUDE = /\.(html|css|js|jpg|jpeg|png|svg|ico|txt|json|webp|woff2)$/i;
const SKIP_DIRS = new Set(['.git', '.workbuddy', 'tools', 'worker', 'node_modules']);

const MIME = {
  html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', js: 'application/javascript; charset=utf-8',
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', svg: 'image/svg+xml', ico: 'image/x-icon',
  txt: 'text/plain; charset=utf-8', json: 'application/json', webp: 'image/webp', woff2: 'font/woff2'
};

/* ── DNS ────────────────────────────────────────────────────────────────────
   System resolver first (it honours the corporate split-horizon setup), public
   DNS only when it fails. Results are cached for the run. */
const PUBLIC_DNS = ['1.1.1.1', '8.8.8.8', '9.9.9.9'];
const dnsCache = new Map();

function resolveHost(host) {
  return new Promise((resolve, reject) => {
    dns.lookup(host, { family: 4 }, (err, address) => {
      if (!err && address) return resolve(address);
      const saved = dns.getServers();
      let addrs = null, err2 = null;
      try {
        dns.setServers(PUBLIC_DNS);
        dns.resolve4(host, (e, a) => { err2 = e; addrs = a;
          try { dns.setServers(saved); } catch (_) {}
          if (!err2 && addrs && addrs.length) resolve(addrs[0]); else reject(err);
        });
      } catch (e) {
        try { dns.setServers(saved); } catch (_) {}
        reject(err || e);
      }
    });
  });
}

function lookupWithFallback(hostname, options, callback) {
  const all = options && options.all;
  const deliver = (ip) => all ? callback(null, [{ address: ip, family: 4 }]) : callback(null, ip, 4);
  if (dnsCache.has(hostname)) return deliver(dnsCache.get(hostname));
  resolveHost(hostname)
    .then((ip) => { dnsCache.set(hostname, ip); deliver(ip); })
    .catch(callback);
}

/* ── KV write ─────────────────────────────────────────────────────────────── */
function putKv({ path, body, contentType }) {
  const boundary = '----napell' + Math.random().toString(16).slice(2);
  const head = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="value"; filename="blob"\r\n` +
    `Content-Type: application/octet-stream\r\n\r\n`
  );
  const tail = Buffer.from(
    `\r\n--${boundary}\r\nContent-Disposition: form-data; name="metadata"; filename="blob"\r\n` +
    `Content-Type: application/json\r\n\r\n${JSON.stringify({ contentType })}\r\n--${boundary}--\r\n`
  );
  const payload = Buffer.concat([head, body, tail]);
  const url = new URL(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${nsId}/values/f:${encodeURI(path)}`
  );

  return new Promise((resolve, reject) => {
    const req = request(url, {
      method: 'PUT',
      lookup: lookupWithFallback,
      timeout: 45000,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': payload.length
      }
    }, (res) => {
      let text = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { text += c; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(res.statusCode);
        else reject(new Error(`HTTP ${res.statusCode} ${text.slice(0, 180)}`));
      });
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    req.end(payload);
  });
}

/* ── Walk the site ────────────────────────────────────────────────────────── */
function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(full, acc);
    } else if (INCLUDE.test(name)) {
      acc.push(full);
    }
  }
  return acc;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MAX_ATTEMPTS = 4;

const files = walk(ROOT);
let ok = 0, fail = 0;
for (const f of files) {
  const rel = relative(ROOT, f).split(sep).join('/');
  const path = '/' + rel;
  const ext = path.slice(path.lastIndexOf('.') + 1).toLowerCase();
  const body = readFileSync(f);
  let done = false;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS && !done; attempt++) {
    try {
      await putKv({ path, body, contentType: MIME[ext] || 'application/octet-stream' });
      ok++; done = true;
      console.log(`  ✓ ${path} (${body.length} bytes)`);
    } catch (e) {
      if (attempt === MAX_ATTEMPTS) {
        fail++;
        console.error(`  ✗ ${path}: ${e.message}`);
      } else {
        await sleep(600 * attempt);
      }
    }
  }
}
console.log(`\nDeployed ${ok} files, ${fail} failures.`);
process.exit(fail ? 1 : 0);
