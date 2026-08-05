#!/usr/bin/env node
//
// analyze.js — read an exported save and say where the child actually stands.
//
//     node tools/analyze.js ~/Downloads/tower-control-2026-08-05.json
//
// The export comes from the parent report screen (hold 📊 on the entry screen →
// "הורד קובץ נתונים"). Nothing is uploaded anywhere to make this work: the file
// is produced locally and read locally.
//
// The analysis itself lives in js/analytics.js and is shared with the in-game
// report, so this can never quietly disagree with what the parent already saw.
// What this adds is depth the phone screen has no room for: per-port detail,
// the full error list, session shapes, and time of day.

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const ROOT = path.join(__dirname, '..');

function loadAnalytics() {
  const sandbox = { module: { exports: {} }, console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'analytics.js'), 'utf8'), sandbox,
                  { filename: 'js/analytics.js' });
  return vm.runInContext('ANALYTICS', sandbox);
}

const A = loadAnalytics();

const file = process.argv[2];
if (!file) {
  console.error('usage: node tools/analyze.js <exported-save.json>');
  process.exit(2);
}
if (!fs.existsSync(file)) {
  console.error('no such file: ' + file);
  process.exit(2);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (e) {
  console.error('not valid JSON: ' + e.message);
  process.exit(2);
}

// Accept either an export or a raw localStorage save — a parent who copies the
// localStorage value straight out of devtools should not hit a parse error.
const log = data.log || (data.save && data.save.log) || [];
if (!Array.isArray(log) || !log.length) {
  console.error('this file has no answer log in it');
  process.exit(1);
}

const rep = A.analyse(log);
const bar = (pct, width = 22) => {
  const n = Math.round((Math.max(0, Math.min(100, pct)) / 100) * width);
  return '█'.repeat(n) + '·'.repeat(width - n);
};
const date = t => new Date(t).toISOString().slice(0, 10);

const H = s => '\n' + s + '\n' + '─'.repeat(s.length);

console.log(H('OVERVIEW'));
console.log(`player            ${data.player || '(unnamed)'}`);
console.log(`port              ${data.currentStage ?? '?'}`);
console.log(`answered          ${rep.total} questions over ${rep.days} days ` +
            `(${date(rep.from)} → ${date(rep.to)})`);
console.log(`first-try correct ${rep.firstTryPct}%   ${bar(rep.firstTryPct)}`);
console.log(`answer revealed   ${rep.revealPct}%`);
console.log(`median time       ${rep.medianSeconds}s`);
if (rep.trend) {
  console.log(`trend             ${rep.trend.early}% → ${rep.trend.late}% ` +
              `(${rep.trend.delta >= 0 ? '+' : ''}${rep.trend.delta}, ${rep.trend.direction})`);
}

console.log(H('SKILLS  (% = first try, last 12 attempts)'));
rep.skills.filter(s => s.samples > 0).forEach(s => {
  console.log(`${(s.plain || s.label).padEnd(26)} ${String(s.recentPct).padStart(3)}%  ${bar(s.recentPct, 16)}  ` +
              `n=${String(s.samples).padStart(3)}  ${String(s.seconds).padStart(5)}s  ` +
              `${s.ladderPct ? 'ladder ' + String(s.ladderPct).padStart(3) + '%  ' : '            '}${s.status}`);
});
const unseen = rep.skills.filter(s => s.samples === 0);
if (unseen.length) console.log('\nnot met yet: ' + unseen.map(s => s.plain || s.label).join(', '));

// Per-port breakdown. The skill view is what to teach; this is where to send him.
console.log(H('BY PORT  (% = first try, all time — so it lags the skill view)'));
const ports = new Map();
log.forEach(r => {
  const e = ports.get(r.s) || { port: r.s, n: 0, first: 0, revealed: 0, ladder: 0, ms: [] };
  e.n++;
  if (r.n === 0 && !r.v) e.first++;
  if (r.v) e.revealed++;
  if (r.l) e.ladder++;
  e.ms.push(r.d);
  ports.set(r.s, e);
});
[...ports.values()].sort((a, b) => a.port - b.port).forEach(p => {
  const pct = Math.round((p.first / p.n) * 100);
  console.log(`port ${String(p.port).padStart(2)}  ${String(pct).padStart(3)}%  ${bar(pct, 16)}  ` +
              `n=${String(p.n).padStart(3)}  revealed=${p.revealed}  ladder=${p.ladder}  ` +
              `median=${Math.round(A._median(p.ms) / 100) / 10}s`);
});

// Every fact he has ever missed, not just the top six.
console.log(H('EVERY MISSED EXERCISE'));
const facts = new Map();
log.forEach(r => {
  const k = A.factOf(r);
  const e = facts.get(k) || { fact: k, seen: 0, missed: 0, tries: 0, skill: A.skillOf(r) };
  e.seen++;
  e.tries += r.n;
  if (r.n > 0 || r.v) e.missed++;
  facts.set(k, e);
});
const missed = [...facts.values()].filter(f => f.missed > 0)
  .sort((a, b) => (b.missed / b.seen) - (a.missed / a.seen) || b.seen - a.seen);
if (!missed.length) console.log('(nothing missed — every exercise first try)');
missed.forEach(f => console.log(
  `${f.fact.padEnd(16)} missed ${f.missed}/${f.seen}  ` +
  `(${Math.round((f.missed / f.seen) * 100)}%)  avg tries ${(f.tries / f.seen).toFixed(1)}  ${f.skill}`));

// Sessions: gaps over 20 minutes start a new one. Length and fade tell you
// whether shifts are the right size for his attention.
console.log(H('SESSIONS'));
const GAP = 20 * 60 * 1000;
const sessions = [];
log.forEach(r => {
  const last = sessions[sessions.length - 1];
  if (!last || r.t - last.end > GAP) sessions.push({ start: r.t, end: r.t, rows: [r] });
  else { last.end = r.t; last.rows.push(r); }
});
sessions.slice(-12).forEach(s => {
  const mins = Math.max(1, Math.round((s.end - s.start) / 60000));
  const pct  = Math.round(s.rows.filter(r => r.n === 0 && !r.v).length / s.rows.length * 100);
  // First half vs second half of a sitting: a big drop is fatigue, not ability.
  const h = Math.floor(s.rows.length / 2);
  const fade = h >= 2
    ? Math.round(s.rows.slice(h).filter(r => r.n === 0 && !r.v).length / (s.rows.length - h) * 100) -
      Math.round(s.rows.slice(0, h).filter(r => r.n === 0 && !r.v).length / h * 100)
    : 0;
  console.log(`${new Date(s.start).toISOString().slice(0, 16).replace('T', ' ')}  ` +
              `${String(mins).padStart(3)} min  n=${String(s.rows.length).padStart(3)}  ` +
              `${String(pct).padStart(3)}%  within-session ${fade >= 0 ? '+' : ''}${fade}`);
});

console.log(H('RECOMMENDATIONS'));
// Left with their nikud: these are sentences, not columns, so nothing drifts,
// and stripping nikud from pointed text yields defective spelling that reads
// like a typo ("חצית" for "חציית").
rep.recommendations.forEach((r, i) => {
  console.log(`${i + 1}. [p${r.priority}] ${r.title}`);
  console.log(`   ${r.detail}\n`);
});
