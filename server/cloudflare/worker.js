/**
 * worker.js — the sync endpoint as a Cloudflare Worker.
 *
 * Same API as server/tower-sync.php, so the game needs no change: put the
 * worker's URL in the parent screen and it behaves identically.
 *
 * DEPLOY (about three minutes, free plan, no credit card)
 *
 *   npm install -g wrangler
 *   wrangler login
 *   cd server/cloudflare
 *   wrangler kv namespace create TOWER          # prints an id
 *   # paste that id into wrangler.toml
 *   wrangler deploy
 *
 * wrangler prints a URL like https://tower-sync.<you>.workers.dev — that is
 * what goes in the game.
 *
 * WHAT IT COSTS: nothing, and not in the "free until it isn't" sense. The free
 * plan allows 100,000 requests and 1,000 KV writes a day. One child on two
 * devices generates a handful of writes a day, so this sits three orders of
 * magnitude below the limit. There is no server to keep patched, nothing to
 * renew, and no machine that can be switched off.
 *
 * ONE HONEST CAVEAT: KV is eventually consistent — a write can take up to a
 * minute to be visible everywhere. If he finished on the laptop ten seconds ago
 * and opens the tablet now, the tablet may read the previous state. Nothing is
 * lost when that happens: every sync is read-merge-write, so the next sync from
 * either device folds both together. It self-heals, which is exactly why the
 * merge was built to be order-independent.
 */

const CODE_RE = /^[A-Za-z0-9_-]{16,64}$/;
const MAX_BYTES = 4 * 1024 * 1024;

const ALLOWED_ORIGINS = [
  'https://asafnac.github.io',
  'null',                       // the game opened straight off a disk
];

function cors(origin) {
  const h = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
  if (ALLOWED_ORIGINS.includes(origin)) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Vary'] = 'Origin';
  }
  return h;
}

const reply = (status, body, origin) =>
  new Response(status === 204 ? null : JSON.stringify(body),
               { status, headers: cors(origin) });

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') return reply(204, null, origin);

    const url  = new URL(request.url);
    const code = url.searchParams.get('code') || '';
    // Strict, and not only for tidiness: this becomes a key, and a key built
    // from unvalidated input is how storage layers get surprised.
    if (!CODE_RE.test(code)) return reply(400, { error: 'bad code' }, origin);

    // Hashed, so the code itself is never stored — a dump of the namespace
    // would not hand anyone a working credential.
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code));
    const key = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');

    if (request.method === 'GET') {
      const doc = await env.TOWER.get(key, 'json');
      return reply(200, {
        save: doc?.save ?? null,
        updatedAt: doc?.updatedAt ?? null,
      }, origin);
    }

    if (request.method === 'POST') {
      const text = await request.text();
      if (text.length > MAX_BYTES) return reply(413, { error: 'too large' }, origin);

      let save;
      try {
        save = JSON.parse(text);
      } catch (e) {
        return reply(400, { error: 'body is not JSON' }, origin);
      }
      // A save with no log is either a bug or something else entirely. Refusing
      // it means a broken client cannot wipe a year of history in one request.
      // The client guarantees the field exists from its very first load — an
      // empty array is fine and is what a new device sends.
      if (!save || typeof save !== 'object' || !Array.isArray(save.log)) {
        return reply(400, { error: 'not a game save' }, origin);
      }

      const updatedAt = new Date().toISOString();
      await env.TOWER.put(key, JSON.stringify({ save, updatedAt }));
      return reply(200, { ok: true, updatedAt }, origin);
    }

    return reply(405, { error: 'method not allowed' }, origin);
  },
};
