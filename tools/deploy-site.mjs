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
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

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

const files = walk(ROOT);
let ok = 0, fail = 0;
for (const f of files) {
  const rel = relative(ROOT, f).split(sep).join('/');
  const path = '/' + rel;
  const ext = path.slice(path.lastIndexOf('.') + 1).toLowerCase();
  const body = readFileSync(f);
  const fd = new FormData();
  fd.append('value', new Blob([body]));
  fd.append('metadata', JSON.stringify({ contentType: MIME[ext] || 'application/octet-stream' }));
  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${nsId}/values/f:${encodeURI(path)}`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: fd
    });
    if (res.ok) { ok++; console.log(`  ✓ ${path} (${body.length} bytes)`); }
    else { fail++; console.error(`  ✗ ${path}: ${(await res.text()).slice(0, 200)}`); }
  } catch (e) {
    fail++; console.error(`  ✗ ${path}: ${e.message}`);
  }
}
console.log(`\nDeployed ${ok} files, ${fail} failures.`);
process.exit(fail ? 1 : 0);
