#!/usr/bin/env node
//
// tower-sync.mjs — the same sync endpoint as tower-sync.php, for a server that
// runs Node instead of PHP. Pick one; you do not need both.
//
// RUN
//   node server/tower-sync.mjs                  # listens on 127.0.0.1:8790
//   PORT=8790 DATA_DIR=/var/lib/tower-sync node server/tower-sync.mjs
//
// Then put it behind your existing https server. With nginx:
//
//   location /tower-sync {
//       proxy_pass http://127.0.0.1:8790;
//       proxy_set_header Host $host;
//   }
//
// and keep it alive with systemd:
//
//   [Service]
//   ExecStart=/usr/bin/node /srv/tower-control/server/tower-sync.mjs
//   Environment=DATA_DIR=/var/lib/tower-sync
//   Restart=always
//
// Bind to 127.0.0.1, not 0.0.0.0: this process should only ever be reachable
// through the https server in front of it, which is what holds the certificate.
//
// No dependencies, on purpose — nothing to install, nothing to keep patched.

import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const PORT     = Number(process.env.PORT || 8790);
const HOST     = process.env.HOST || '127.0.0.1';
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'tower-sync-data');
const MAX_BYTES = 4 * 1024 * 1024;

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  'https://asafnac.github.io,null').split(',').map(s => s.trim());

const CODE_RE = /^[A-Za-z0-9_-]{16,64}$/;

const fileFor = code =>
  path.join(DATA_DIR, crypto.createHash('sha256').update(code).digest('hex') + '.json');

function send(res, status, body, origin) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Vary'] = 'Origin';
  }
  res.writeHead(status, headers);
  res.end(status === 204 ? '' : JSON.stringify(body));
}

/** Read a bounded body — an unbounded one is a way to fill a disk. */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > MAX_BYTES) { reject(new Error('too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || '';
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'OPTIONS') return send(res, 204, null, origin);

  const code = url.searchParams.get('code') || '';
  if (!CODE_RE.test(code)) return send(res, 400, { error: 'bad code' }, origin);

  const file = fileFor(code);
  await fs.mkdir(DATA_DIR, { recursive: true, mode: 0o770 });

  if (req.method === 'GET') {
    try {
      const doc = JSON.parse(await fs.readFile(file, 'utf8'));
      return send(res, 200, { save: doc.save ?? null, updatedAt: doc.updatedAt ?? null }, origin);
    } catch (e) {
      return send(res, 200, { save: null, updatedAt: null }, origin);
    }
  }

  if (req.method === 'POST') {
    let raw;
    try {
      raw = await readBody(req);
    } catch (e) {
      return send(res, 413, { error: 'too large' }, origin);
    }
    let save;
    try {
      save = JSON.parse(raw);
    } catch (e) {
      return send(res, 400, { error: 'body is not JSON' }, origin);
    }
    // A save with no log is either a bug or something else entirely. Refusing it
    // means a broken client cannot wipe a year of history with one bad POST.
    // The client guarantees the field exists from its very first load — an empty
    // array is fine and is what a new device sends.
    if (!save || typeof save !== 'object' || !Array.isArray(save.log)) {
      return send(res, 400, { error: 'not a game save' }, origin);
    }

    const doc = JSON.stringify({ save, updatedAt: new Date().toISOString() });
    // Write then rename: rename is atomic, so a reader never catches a
    // half-written save and a crash leaves the previous one intact.
    const tmp = `${file}.${crypto.randomBytes(6).toString('hex')}.tmp`;
    try {
      await fs.writeFile(tmp, doc);
      await fs.rename(tmp, file);
    } catch (e) {
      await fs.unlink(tmp).catch(() => {});
      return send(res, 500, { error: 'cannot write' }, origin);
    }
    return send(res, 200, { ok: true, updatedAt: JSON.parse(doc).updatedAt }, origin);
  }

  return send(res, 405, { error: 'method not allowed' }, origin);
});

server.listen(PORT, HOST, () => {
  console.log(`tower-sync listening on http://${HOST}:${PORT}  data: ${DATA_DIR}`);
});
