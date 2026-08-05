#!/usr/bin/env node
//
// generate-audio.js — renders every spoken line in the game to an mp3.
//
// Run this whenever you add or reword anything the game says out loud:
//
//     node tools/generate-audio.js
//
// Then commit the new files under audio/.
//
// WHY THIS EXISTS
// The Google Translate TTS endpoint is blocked from https origins — from a real
// site the audio element just fires 'stalled' and never errors, so the read-aloud
// button silently does nothing. The same URL fetched server-side works fine. So
// we fetch here, once, and ship the results as static files. The game then never
// touches the network while a child is playing.
//
// Clips are named by a hash of the spoken text (js/speech.js owns that hash and
// is imported below, so the two can never drift). Rewording a line just orphans
// its old clip; --prune cleans those up.

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');
const https = require('https');

const ROOT      = path.join(__dirname, '..');
const AUDIO_DIR = path.join(ROOT, 'audio');

const SPEECH = require(path.join(ROOT, 'js', 'speech.js'));

// curriculum.js is a plain script, not a module — run it in a sandbox to get at
// its consts without having to maintain a parallel copy of the content.
function loadCurriculum() {
  const ctx = {};
  vm.createContext(ctx);
  const src = fs.readFileSync(path.join(ROOT, 'js', 'curriculum.js'), 'utf8');
  // Top-level `const` is lexically scoped and never lands on the sandbox object,
  // so hand the values out explicitly from inside the same script run.
  const out = vm.runInContext(src + '\n;({ CURRICULUM, MESSAGES, collectSpokenLines });', ctx);
  if (!out || !out.CURRICULUM || typeof out.collectSpokenLines !== 'function') {
    throw new Error('curriculum.js did not define CURRICULUM and collectSpokenLines');
  }
  return out;
}

/**
 * Every distinct line the game can ever speak.
 *
 * The enumeration lives in curriculum.js next to the content, not here: the
 * ladder prompts are assembled at runtime from templates, and a copy of that
 * assembly in this file would drift the first time a prompt was reworded — and
 * drift means a silent button, which is the one failure mode this whole
 * pipeline exists to prevent.
 */
function collectPhrases({ collectSpokenLines }) {
  const out = new Map(); // normalized -> { text, source }
  collectSpokenLines().forEach((text, i) => {
    const norm = SPEECH.normalize(text);
    if (!norm || out.has(norm)) return;
    out.set(norm, { text, source: 'line ' + (i + 1) });
  });
  return [...out.values()];
}

// Two ways in to the same voice. The plain translate.google.com host is blocked
// from some networks (it answers 403 to the CONNECT itself), while the API host
// with client=gtx is not — so try both before giving up on a line.
const TTS_HOSTS = [
  t => 'https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=he&client=gtx&q=' + encodeURIComponent(t),
  t => 'https://translate.google.com/translate_tts?ie=UTF-8&tl=he&client=tw-ob&q=' + encodeURIComponent(t),
];

function fetchFrom(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        // Without a browser UA the endpoint returns an HTML error page.
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                    + '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
      },
    }, res => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error('HTTP ' + res.statusCode));
      }
      const type = res.headers['content-type'] || '';
      if (!/audio/i.test(type)) {
        res.resume();
        return reject(new Error('not audio, got ' + type));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        // An mp3 frame starts 0xFF 0xFB/0xF3/0xF2, an ID3 tag starts "ID3".
        const ok = buf.length > 512 &&
          (buf[0] === 0xff || buf.slice(0, 3).toString() === 'ID3');
        ok ? resolve(buf) : reject(new Error('bad payload, ' + buf.length + ' bytes'));
      });
    });
    req.on('error', reject);
    req.setTimeout(20000, () => req.destroy(new Error('timeout')));
  });
}

async function fetchClip(text) {
  let last;
  for (const toUrl of TTS_HOSTS) {
    try { return await fetchFrom(toUrl(text)); } catch (err) { last = err; }
  }
  throw last;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const force = process.argv.includes('--force');
  const prune = process.argv.includes('--prune');

  fs.mkdirSync(AUDIO_DIR, { recursive: true });

  const phrases = collectPhrases(loadCurriculum());
  console.log(`${phrases.length} distinct lines to voice\n`);

  const expected = new Set();
  let made = 0, skipped = 0;
  const failed = [];

  for (const [i, p] of phrases.entries()) {
    const key  = SPEECH.key(p.text);
    const file = path.join(AUDIO_DIR, key + '.mp3');
    expected.add(key + '.mp3');

    if (!force && fs.existsSync(file) && fs.statSync(file).size > 512) {
      skipped++;
      continue;
    }

    const label = `[${String(i + 1).padStart(3)}/${phrases.length}] ${p.source}`;
    let ok = false;
    for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
      try {
        fs.writeFileSync(file, await fetchClip(SPEECH.normalize(p.text)));
        console.log(`${label}  ok  ${key}.mp3`);
        made++;
        ok = true;
      } catch (err) {
        if (attempt === 3) {
          console.error(`${label}  FAILED  ${err.message}`);
          failed.push({ ...p, key, err: err.message });
        } else {
          await sleep(1500 * attempt); // back off, the endpoint rate-limits
        }
      }
    }
    await sleep(250); // stay friendly
  }

  if (prune) {
    for (const f of fs.readdirSync(AUDIO_DIR)) {
      if (f.endsWith('.mp3') && !expected.has(f)) {
        fs.unlinkSync(path.join(AUDIO_DIR, f));
        console.log('pruned orphan', f);
      }
    }
  }

  console.log(`\ngenerated ${made}, already present ${skipped}, failed ${failed.length}`);
  if (failed.length) {
    console.error('\nMissing clips — re-run to retry just these:');
    failed.forEach(f => console.error('  ' + f.source + ': ' + f.err));
    process.exit(1);
  }
  console.log('every line has a clip.');
}

main().catch(err => { console.error(err); process.exit(1); });
