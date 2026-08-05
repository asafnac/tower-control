#!/usr/bin/env node
//
// run.js — the same tests the browser console runs, from a terminal:
//
//     node tests/run.js
//
// The game's scripts are plain <script> files, not modules, so they are loaded
// into one vm context exactly the way a browser loads them. Running them for
// real is the point: a test suite that re-implements the curriculum would pass
// while the game was broken.
//
// It also checks something the browser cannot: that every spoken line has an
// actual mp3 sitting under audio/.

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const ROOT      = path.join(__dirname, '..');
const AUDIO_DIR = path.join(ROOT, 'audio');

let failures = 0;
const sandbox = {
  console: {
    log:     (...a) => console.log(...a),
    warn:    (...a) => console.warn(...a),
    error:   (...a) => { failures++; console.error(...a); },
    group:   (...a) => console.log(...a),
    groupEnd: () => {},
  },
  // The suite only touches PROGRESS._default() and the pure helpers, but
  // progress.js closes over localStorage, so give it a working one.
  localStorage: (() => {
    const store = new Map();
    return {
      getItem: k => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: k => store.delete(k),
    };
  })(),
};
sandbox.window = sandbox;
vm.createContext(sandbox);

// Same order as index.html. Top-level `const` from each script lands in the
// context's global lexical scope, so later scripts see earlier ones.
['js/curriculum.js', 'js/speech.js', 'js/progress.js', 'tests/tests.js'].forEach(f => {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
});

const result = vm.runInContext('runTests()', sandbox);

// ===== AUDIO COVERAGE =====
// A missing clip is silent in the browser: the console warns and the child
// hears nothing. Here it is a failed build.
const lines   = vm.runInContext('collectSpokenLines()', sandbox);
const keyOf   = t => vm.runInContext('SPEECH.key(' + JSON.stringify(t) + ')', sandbox);
const missing = [];
const expected = new Set();

lines.forEach(text => {
  const key = keyOf(text);
  expected.add(key + '.mp3');
  const file = path.join(AUDIO_DIR, key + '.mp3');
  if (!fs.existsSync(file) || fs.statSync(file).size <= 512) missing.push({ key, text });
});

const orphans = fs.existsSync(AUDIO_DIR)
  ? fs.readdirSync(AUDIO_DIR).filter(f => f.endsWith('.mp3') && !expected.has(f))
  : [];

console.log(`\naudio: ${lines.length} spoken lines, ${missing.length} without a clip, ` +
            `${orphans.length} orphan clips`);

if (missing.length) {
  console.error('\nMissing clips — run: node tools/generate-audio.js');
  missing.slice(0, 12).forEach(m => console.error(`  ${m.key}.mp3  ${m.text}`));
  if (missing.length > 12) console.error(`  ...and ${missing.length - 12} more`);
}

const ok = result.failed === 0 && missing.length === 0;
console.log(ok ? '\n✅ all good' : '\n❌ failures above');
process.exit(ok ? 0 : 1);
