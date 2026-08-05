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
// sync.js reaches for the CSPRNG when it mints a code, and for fetch when it
// talks to a server. The suite exercises the first and never the second.
sandbox.crypto = { getRandomValues: a => { require('crypto').randomFillSync(a); return a; } };
// URL is a browser global that a vm context does not get for free, and sync.js
// parses server addresses with it.
sandbox.URL = URL;
sandbox.window = sandbox;
vm.createContext(sandbox);

// Same order as index.html. Top-level `const` from each script lands in the
// context's global lexical scope, so later scripts see earlier ones.
// scene3d.js only touches THREE and the DOM from inside its functions, so it
// loads cleanly here and its pure parts (body plans, palettes) can be tested
// without a GPU.
['js/curriculum.js', 'js/speech.js', 'js/scene3d.js', 'js/analytics.js', 'js/progress.js',
 'js/sync.js', 'tests/tests.js']
  .forEach(f => {
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

// ===== THE THREE.JS BUNDLE MUST CONTAIN WHAT THE SCENE ASKS FOR =====
// vendor/three.min.js is a tree-shaken slice, so reaching for a class that was
// not listed in tools/build-three.js fails at runtime as "undefined is not a
// constructor" — on the child's machine, in the middle of his reward. Catching
// it here costs one regex.
const sceneSrc  = fs.readFileSync(path.join(ROOT, 'js', 'scene3d.js'), 'utf8');
const buildSrc  = fs.readFileSync(path.join(ROOT, 'tools', 'build-three.js'), 'utf8');
const bundlePath = path.join(ROOT, 'vendor', 'three.min.js');
const used = [...new Set([...sceneSrc.matchAll(/THREE\.([A-Za-z0-9_]+)/g)].map(m => m[1]))];

const bundleMissing = [];
if (!fs.existsSync(bundlePath)) {
  bundleMissing.push('vendor/three.min.js is not built — run: node tools/build-three.js');
} else {
  const bundle = fs.readFileSync(bundlePath, 'utf8');
  used.forEach(name => {
    if (!new RegExp(`\\b${name}\\b`).test(buildSrc)) {
      bundleMissing.push(`${name} is used by scene3d.js but not exported in tools/build-three.js`);
    } else if (!new RegExp(`\\b${name}\\b`).test(bundle)) {
      bundleMissing.push(`${name} is exported but absent from vendor/three.min.js — rebuild`);
    }
  });
}

console.log(`three: ${used.length} classes used, ${bundleMissing.length} unresolved`);
bundleMissing.forEach(m => console.error('  ' + m));

const ok = result.failed === 0 && missing.length === 0 && bundleMissing.length === 0;
console.log(ok ? '\n✅ all good' : '\n❌ failures above');
process.exit(ok ? 0 : 1);
