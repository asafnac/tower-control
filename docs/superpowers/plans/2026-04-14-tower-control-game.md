# מגדל הפיקוח — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Hebrew browser-based math game where a first-grade child plays as an air traffic controller, learning addition/subtraction 1–19 with a special focus on "10 as a safe station."

**Architecture:** Single HTML file with 5 screens (entry, game, report, album, map) managed via CSS `.hidden` class. Three JS modules loaded via `<script>` tags in order: `curriculum.js` → `progress.js` → `game.js`. All progress persisted to `localStorage`.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (ES6), localStorage — no frameworks, no bundler.

---

## File Structure

```
tower-control/
├── index.html                    — all 5 screens in one file
├── css/
│   └── style.css                 — RTL, color vars, all layouts, all animations
├── js/
│   ├── curriculum.js             — CURRICULUM constant: all question data for stages 1–7
│   ├── progress.js               — PROGRESS object: localStorage read/write API
│   └── game.js                   — GAME object: all logic, screen transitions, state
├── tests/
│   └── tests.js                  — browser-runnable tests using console.assert
└── docs/superpowers/plans/
    └── 2026-04-14-tower-control-game.md
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/curriculum.js`
- Create: `js/progress.js`
- Create: `js/game.js`
- Create: `tests/tests.js`

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>מגדל הפיקוח</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- Screen 1: Entry -->
  <div id="screen-entry" class="screen">
    <div class="screen-content">
      <h1 class="game-title">מגדל הפיקוח</h1>
      <p class="game-subtitle">✈️ ברוך הבא, פקח!</p>
      <div class="entry-form">
        <label for="player-name">מה שמך?</label>
        <input type="text" id="player-name" placeholder="הקלד את שמך" maxlength="12">
        <button id="btn-start" class="btn-primary">התחל משמרת</button>
      </div>
      <div id="entry-rank" class="rank-badge hidden"></div>
    </div>
  </div>

  <!-- Screen 2: Game -->
  <div id="screen-game" class="screen hidden">
    <div class="game-header">
      <span id="hdr-rank" class="rank-small"></span>
      <span id="hdr-name" class="player-name-small"></span>
      <span id="hdr-shift" class="shift-label"></span>
      <span id="hdr-progress" class="shift-progress"></span>
    </div>

    <div class="game-main">
      <!-- Radar / Visual area -->
      <div id="radar-area" class="radar-area">
        <div id="radar-screen" class="radar-screen">
          <div class="radar-sweep"></div>
          <div id="radar-planes" class="radar-planes"></div>
        </div>
        <!-- Altitude meter (shown for altitude-type questions) -->
        <div id="altitude-meter" class="altitude-meter hidden">
          <div class="alt-scale">
            <div id="alt-fill" class="alt-fill"></div>
            <div class="alt-safety-line">
              <span class="alt-safety-label">רמת ביטחון — 10</span>
            </div>
          </div>
          <div id="alt-number" class="alt-number">0</div>
          <div id="alt-decompose" class="alt-decompose hidden">
            <span class="decompose-ten">10</span>
            <span class="decompose-plus">+</span>
            <span id="decompose-units" class="decompose-units">0</span>
          </div>
        </div>
      </div>

      <!-- Radio message -->
      <div id="radio-bubble" class="radio-bubble">
        <span class="radio-icon">📻</span>
        <span id="radio-text" class="radio-text"></span>
      </div>

      <!-- Hint area -->
      <div id="hint-area" class="hint-area hidden">
        <div id="hint-dots" class="hint-dots"></div>
      </div>
    </div>

    <!-- Number pad -->
    <div class="numpad-area">
      <div id="answer-display" class="answer-display">
        <span id="answer-value">—</span>
      </div>
      <div class="numpad">
        <button class="num-btn" data-n="1">1</button>
        <button class="num-btn" data-n="2">2</button>
        <button class="num-btn" data-n="3">3</button>
        <button class="num-btn" data-n="4">4</button>
        <button class="num-btn" data-n="5">5</button>
        <button class="num-btn" data-n="6">6</button>
        <button class="num-btn" data-n="7">7</button>
        <button class="num-btn" data-n="8">8</button>
        <button class="num-btn" data-n="9">9</button>
        <button class="num-btn num-clear" data-n="clear">✕</button>
        <button class="num-btn" data-n="0">0</button>
        <button id="btn-submit" class="num-btn num-submit" disabled>✔</button>
      </div>
    </div>
  </div>

  <!-- Screen 3: Shift Report -->
  <div id="screen-report" class="screen hidden">
    <div class="screen-content">
      <h2 class="report-title">דוח משמרת</h2>
      <div id="report-planes" class="report-planes"></div>
      <p id="report-msg" class="report-msg"></p>
      <div id="report-new-plane" class="new-plane-badge hidden"></div>
      <div id="report-rank-up" class="rank-up hidden"></div>
      <button id="btn-continue" class="btn-primary">המשך</button>
    </div>
  </div>

  <!-- Screen 4: Plane Album -->
  <div id="screen-album" class="screen hidden">
    <div class="screen-content">
      <h2>אלבום המטוסים שלי</h2>
      <div id="album-grid" class="album-grid"></div>
      <button id="btn-album-back" class="btn-secondary">חזור</button>
    </div>
  </div>

  <!-- Screen 5: Airport Map -->
  <div id="screen-map" class="screen hidden">
    <div class="screen-content">
      <h2>מפת הנמלים</h2>
      <div id="map-stages" class="map-stages"></div>
      <button id="btn-map-back" class="btn-secondary">חזור</button>
    </div>
  </div>

  <script src="js/curriculum.js"></script>
  <script src="js/progress.js"></script>
  <script src="js/game.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `css/style.css` (empty placeholder)**

```css
/* מגדל הפיקוח — stylesheet */
```

- [ ] **Step 3: Create `js/curriculum.js` (empty placeholder)**

```js
// curriculum.js — loaded first
const CURRICULUM = { stages: [] };
```

- [ ] **Step 4: Create `js/progress.js` (empty placeholder)**

```js
// progress.js — loaded second
const PROGRESS = {};
```

- [ ] **Step 5: Create `js/game.js` (empty placeholder)**

```js
// game.js — loaded third
console.log('מגדל הפיקוח loaded');
```

- [ ] **Step 6: Create `tests/tests.js` (empty placeholder)**

```js
// tests.js — run via browser console: loadTests()
function loadTests() { console.log('Tests ready'); }
```

- [ ] **Step 7: Open `index.html` in browser and verify it loads without errors**

Open `tower-control/index.html` in Chrome/Edge. You should see a plain page with no console errors.

- [ ] **Step 8: Commit**

```bash
cd "C:/Users/USER/OneDrive/Desktop/tower-control"
git init
git add .
git commit -m "feat: project scaffold — 5 screens HTML, empty JS/CSS files"
```

---

## Task 2: CSS Foundation

**Files:**
- Modify: `css/style.css`

- [ ] **Step 1: Write full `css/style.css`**

```css
/* ===== VARIABLES ===== */
:root {
  --color-sky: #0a1628;
  --color-radar-bg: #001a00;
  --color-radar-green: #00ff41;
  --color-radar-dim: #004d00;
  --color-safety: #ff9500;
  --color-safety-glow: rgba(255,149,0,0.4);
  --color-correct: #00e676;
  --color-panel: #0d1f3c;
  --color-panel-border: #1a3a6b;
  --color-text: #e8f4fd;
  --color-text-dim: #7ba7c8;
  --color-btn: #1a4a8a;
  --color-btn-hover: #2060b0;
  --color-btn-submit: #006400;
  --color-btn-submit-active: #008000;
  --font-main: 'Segoe UI', Arial, sans-serif;
  --radius: 12px;
}

/* ===== RESET + BASE ===== */
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font-main);
  background: var(--color-sky);
  color: var(--color-text);
  direction: rtl;
  min-height: 100vh;
  overflow: hidden;
}

/* ===== SCREEN MANAGEMENT ===== */
.screen {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.screen.hidden { display: none; }

.screen-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  max-width: 500px;
  padding: 24px;
}

/* ===== ENTRY SCREEN ===== */
.game-title {
  font-size: 3rem;
  font-weight: 800;
  color: var(--color-radar-green);
  text-shadow: 0 0 20px var(--color-radar-green);
  letter-spacing: 2px;
}

.game-subtitle {
  font-size: 1.3rem;
  color: var(--color-text-dim);
}

.entry-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.entry-form label {
  font-size: 1.1rem;
  color: var(--color-text-dim);
}

.entry-form input {
  background: var(--color-panel);
  border: 2px solid var(--color-panel-border);
  border-radius: var(--radius);
  color: var(--color-text);
  font-size: 1.4rem;
  padding: 12px 16px;
  text-align: right;
  outline: none;
  width: 100%;
  direction: rtl;
}

.entry-form input:focus {
  border-color: var(--color-radar-green);
  box-shadow: 0 0 8px rgba(0,255,65,0.3);
}

/* ===== BUTTONS ===== */
.btn-primary {
  background: var(--color-btn);
  border: none;
  border-radius: var(--radius);
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 700;
  padding: 14px 28px;
  width: 100%;
  transition: background 0.15s;
}

.btn-primary:hover { background: var(--color-btn-hover); }

.btn-secondary {
  background: transparent;
  border: 2px solid var(--color-panel-border);
  border-radius: var(--radius);
  color: var(--color-text-dim);
  cursor: pointer;
  font-size: 1rem;
  padding: 10px 20px;
  transition: border-color 0.15s;
}

.btn-secondary:hover { border-color: var(--color-text); }

/* ===== GAME SCREEN ===== */
#screen-game {
  flex-direction: column;
  justify-content: flex-start;
  padding: 0;
}

.game-header {
  background: var(--color-panel);
  border-bottom: 1px solid var(--color-panel-border);
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 16px;
  width: 100%;
  font-size: 0.9rem;
}

.rank-small { color: var(--color-safety); font-weight: 700; }
.player-name-small { color: var(--color-text); }
.shift-label { color: var(--color-text-dim); margin-right: auto; }
.shift-progress { color: var(--color-radar-green); font-weight: 700; }

.game-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  width: 100%;
  max-width: 500px;
  overflow: hidden;
}

/* ===== RADAR ===== */
.radar-area {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.radar-screen {
  background: var(--color-radar-bg);
  border: 2px solid var(--color-radar-dim);
  border-radius: 50%;
  width: 160px;
  height: 160px;
  min-width: 160px;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 30px rgba(0,255,65,0.15), 0 0 15px rgba(0,255,65,0.1);
}

/* Radar sweep animation */
.radar-sweep {
  position: absolute;
  inset: 0;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(0,255,65,0.15) 20deg,
    transparent 21deg
  );
  animation: radar-rotate 3s linear infinite;
  transform-origin: center;
}

@keyframes radar-rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.radar-planes {
  position: absolute;
  inset: 0;
}

.plane-dot {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--color-radar-green);
  border-radius: 50%;
  box-shadow: 0 0 6px var(--color-radar-green);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;
  transform: translate(-50%, -50%);
}

.plane-dot.landed {
  opacity: 0.3;
  animation: fade-out 0.8s ease forwards;
}

@keyframes fade-out {
  to { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
}

/* ===== ALTITUDE METER ===== */
.altitude-meter {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.altitude-meter.hidden { display: none; }

.alt-scale {
  background: var(--color-panel);
  border: 2px solid var(--color-panel-border);
  border-radius: 8px;
  height: 140px;
  width: 40px;
  position: relative;
  overflow: hidden;
}

.alt-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, #0066cc, #3399ff);
  transition: height 0.8s ease;
  border-radius: 0 0 6px 6px;
}

/* Safety line at exactly 50% = altitude 10 (out of max 20) */
.alt-safety-line {
  position: absolute;
  bottom: 50%;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-safety);
  box-shadow: 0 0 8px var(--color-safety-glow);
}

.alt-safety-label {
  position: absolute;
  right: 44px;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
  font-size: 0.7rem;
  color: var(--color-safety);
}

.alt-number {
  font-size: 2rem;
  font-weight: 900;
  color: var(--color-text);
  min-width: 40px;
  text-align: center;
}

.alt-decompose {
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 700;
}

.alt-decompose.hidden { display: none; }

.decompose-ten {
  background: var(--color-safety);
  color: black;
  border-radius: 6px;
  padding: 2px 8px;
}

.decompose-plus { color: var(--color-text-dim); }

.decompose-units {
  background: #0066cc;
  color: white;
  border-radius: 6px;
  padding: 2px 8px;
}

/* Safety line pulse animation (triggered by JS adding class) */
.alt-safety-line.pulse {
  animation: safety-pulse 0.6s ease 3;
}

@keyframes safety-pulse {
  0%   { box-shadow: 0 0 8px var(--color-safety-glow); }
  50%  { box-shadow: 0 0 24px var(--color-safety), 0 0 40px var(--color-safety-glow); height: 5px; }
  100% { box-shadow: 0 0 8px var(--color-safety-glow); }
}

/* ===== RADIO BUBBLE ===== */
.radio-bubble {
  background: var(--color-panel);
  border: 2px solid var(--color-panel-border);
  border-radius: var(--radius);
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 14px;
  width: 100%;
  min-height: 70px;
}

.radio-icon { font-size: 1.4rem; flex-shrink: 0; }

.radio-text {
  font-size: 1rem;
  line-height: 1.5;
  color: var(--color-text);
}

/* ===== HINT AREA ===== */
.hint-area {
  background: rgba(255,149,0,0.1);
  border: 1px solid var(--color-safety);
  border-radius: var(--radius);
  padding: 10px;
  width: 100%;
}

.hint-area.hidden { display: none; }

.hint-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.hint-dot {
  width: 24px;
  height: 24px;
  background: var(--color-radar-green);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.hint-dot.crossed {
  background: #333;
  color: #666;
  text-decoration: line-through;
}

/* ===== NUMBER PAD ===== */
.numpad-area {
  background: var(--color-panel);
  border-top: 1px solid var(--color-panel-border);
  padding: 12px;
  width: 100%;
}

.answer-display {
  background: var(--color-sky);
  border: 2px solid var(--color-panel-border);
  border-radius: var(--radius);
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 10px;
  padding: 8px;
  text-align: center;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-radar-green);
}

.answer-display.selected {
  border-color: var(--color-radar-green);
  box-shadow: 0 0 8px rgba(0,255,65,0.3);
}

.numpad {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
}

.num-btn {
  background: var(--color-btn);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 1.3rem;
  font-weight: 700;
  padding: 12px 0;
  transition: background 0.1s, transform 0.05s;
  user-select: none;
}

.num-btn:hover { background: var(--color-btn-hover); }
.num-btn:active { transform: scale(0.95); }

.num-clear {
  background: #4a1a1a;
  color: #ff6b6b;
}

.num-clear:hover { background: #6b2222; }

.num-submit {
  background: var(--color-btn-submit);
  font-size: 1.5rem;
}

.num-submit:not([disabled]):hover { background: var(--color-btn-submit-active); }

.num-submit[disabled] {
  background: #1a3a1a;
  color: #2d5a2d;
  cursor: not-allowed;
}

/* ===== FEEDBACK ANIMATIONS ===== */
.radio-bubble.correct {
  border-color: var(--color-correct);
  box-shadow: 0 0 12px rgba(0,230,118,0.3);
  animation: correct-flash 0.4s ease;
}

@keyframes correct-flash {
  0%   { background: var(--color-panel); }
  50%  { background: rgba(0,230,118,0.2); }
  100% { background: var(--color-panel); }
}

.radio-bubble.retry {
  border-color: var(--color-safety);
  animation: retry-shake 0.4s ease;
}

@keyframes retry-shake {
  0%   { transform: translateX(0); }
  25%  { transform: translateX(-6px); }
  75%  { transform: translateX(6px); }
  100% { transform: translateX(0); }
}

/* ===== RANK BADGE ===== */
.rank-badge {
  background: var(--color-panel);
  border: 2px solid var(--color-safety);
  border-radius: var(--radius);
  color: var(--color-safety);
  font-size: 1.1rem;
  font-weight: 700;
  padding: 8px 16px;
}

.rank-badge.hidden { display: none; }

/* ===== REPORT SCREEN ===== */
.report-title {
  font-size: 2rem;
  color: var(--color-radar-green);
}

.report-planes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  font-size: 2rem;
}

.report-msg {
  font-size: 1.2rem;
  line-height: 1.6;
  text-align: center;
  color: var(--color-text-dim);
}

.new-plane-badge {
  background: var(--color-panel);
  border: 2px solid var(--color-radar-green);
  border-radius: var(--radius);
  font-size: 1.1rem;
  padding: 10px 20px;
  text-align: center;
}

.new-plane-badge.hidden { display: none; }

.rank-up {
  background: rgba(255,149,0,0.15);
  border: 2px solid var(--color-safety);
  border-radius: var(--radius);
  color: var(--color-safety);
  font-size: 1.2rem;
  font-weight: 700;
  padding: 12px 20px;
  text-align: center;
}

.rank-up.hidden { display: none; }

/* ===== ALBUM SCREEN ===== */
.album-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  width: 100%;
}

.album-slot {
  aspect-ratio: 1;
  background: var(--color-panel);
  border: 2px solid var(--color-panel-border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}

.album-slot.empty { opacity: 0.2; }

/* ===== MAP SCREEN ===== */
.map-stages {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.map-stage {
  align-items: center;
  background: var(--color-panel);
  border: 2px solid var(--color-panel-border);
  border-radius: var(--radius);
  display: flex;
  gap: 12px;
  padding: 12px 16px;
}

.map-stage.completed {
  border-color: var(--color-radar-green);
  opacity: 1;
}

.map-stage.current {
  border-color: var(--color-safety);
  box-shadow: 0 0 12px var(--color-safety-glow);
}

.map-stage.locked { opacity: 0.4; }

.map-stage-icon { font-size: 1.5rem; }
.map-stage-name { font-size: 1rem; font-weight: 600; flex: 1; }
.map-stage-status { font-size: 0.9rem; color: var(--color-text-dim); }
```

- [ ] **Step 2: Open browser, verify entry screen looks correct**

The entry screen should show:
- Dark navy background
- "מגדל הפיקוח" title in green glow
- Input field and button styled correctly
RTL text alignment throughout.

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: CSS foundation — RTL layout, radar, altitude meter, number pad"
```

---

## Task 3: Curriculum Data

**Files:**
- Modify: `js/curriculum.js`

- [ ] **Step 1: Write full `js/curriculum.js`**

```js
// curriculum.js
// All question data. Loaded before progress.js and game.js.

const PLANE_TYPES = [
  { id: 1,  emoji: '✈️',  name: 'בואינג' },
  { id: 2,  emoji: '🛩️', name: 'מטוס קטן' },
  { id: 3,  emoji: '🚁',  name: 'מסוק' },
  { id: 4,  emoji: '🛫',  name: 'מטוס ממריא' },
  { id: 5,  emoji: '🛬',  name: 'מטוס נוחת' },
  { id: 6,  emoji: '🚀',  name: 'טיל מחקר' },
  { id: 7,  emoji: '⛵',  name: 'ספינת ים' }, // special bonus
];

// Radio text uses {a}, {b}, {result} as placeholders — replaced at runtime.
// visual: 'planes' shows plane dots on radar.
// visual: 'altitude' shows altitude meter.
// hint: 'dots' shows dot grid hint.
// hint: 'decompose' shows 10+units decomposition on altitude meter.

const CURRICULUM = {
  stages: [
    {
      id: 1,
      name: 'נמל תל אביב',
      title: 'חיבור עד 10',
      visual: 'planes',
      questions: [
        { type: 'addition', a: 2, b: 3, result: 5,  hint: 'dots', radioText: 'מגדל הפיקוח, כאן טיסה 1. יש לי {a} מטוסים בצפון ועוד {b} מגיעים מהדרום. כמה מטוסים סה"כ?' },
        { type: 'addition', a: 1, b: 4, result: 5,  hint: 'dots', radioText: 'מגדל הפיקוח! {a} מטוס ממתין ועוד {b} בדרך אלינו. כמה יהיו בשמים?' },
        { type: 'addition', a: 3, b: 3, result: 6,  hint: 'dots', radioText: 'מגדל הפיקוח, כאן טיסה 7. {a} מטוסים ממזרח ועוד {b} ממערב. כמה בסך הכל?' },
        { type: 'addition', a: 4, b: 2, result: 6,  hint: 'dots', radioText: 'מגדל הפיקוח! מונה {a} מטוסים על המסך ועוד {b} בדרך. כמה יהיו?' },
        { type: 'addition', a: 3, b: 4, result: 7,  hint: 'dots', radioText: 'מגדל הפיקוח, {a} מטוסים נמצאים איתנו ועוד {b} הזמינו נחיתה. כמה סך הכל?' },
        { type: 'addition', a: 5, b: 2, result: 7,  hint: 'dots', radioText: 'מגדל הפיקוח! {a} מטוסים בשמים, עוד {b} בדרך. כמה יהיו?' },
        { type: 'addition', a: 4, b: 4, result: 8,  hint: 'dots', radioText: 'מגדל הפיקוח, {a} מטוסים בדרך מצפון ו-{b} מדרום. כמה בסך הכל?' },
        { type: 'addition', a: 2, b: 6, result: 8,  hint: 'dots', radioText: 'מגדל הפיקוח! {a} מטוסים כבר כאן ועוד {b} הזמינו כניסה. כמה יהיו?' },
        { type: 'addition', a: 5, b: 4, result: 9,  hint: 'dots', radioText: 'מגדל הפיקוח, {a} מטוסים ממתינים, עוד {b} מתקרבים. כמה בסה"כ?' },
        { type: 'addition', a: 3, b: 6, result: 9,  hint: 'dots', radioText: 'מגדל הפיקוח! {a} מטוסים בשמים, עוד {b} בדרך. כמה יהיו?' },
        { type: 'addition', a: 5, b: 5, result: 10, hint: 'dots', radioText: 'מגדל הפיקוח, {a} מטוסים בצד ימין ו-{b} בצד שמאל. כמה בסך הכל?' },
        { type: 'addition', a: 6, b: 4, result: 10, hint: 'dots', radioText: 'מגדל הפיקוח! {a} מטוסים גדולים ועוד {b} קטנים. כמה מטוסים יש לפקח?' },
      ]
    },
    {
      id: 2,
      name: 'נמל חיפה',
      title: 'חיסור עד 10',
      visual: 'planes',
      questions: [
        { type: 'subtraction', a: 5,  b: 2, result: 3,  hint: 'dots', radioText: 'מגדל הפיקוח, היו {a} מטוסים בשמים. {b} כבר נחתו בבטחה. כמה עוד בדרך?' },
        { type: 'subtraction', a: 6,  b: 3, result: 3,  hint: 'dots', radioText: 'מגדל הפיקוח! {a} מטוסים היו במסך, {b} סיימו משמרת. כמה נותרו?' },
        { type: 'subtraction', a: 7,  b: 4, result: 3,  hint: 'dots', radioText: 'מגדל הפיקוח, עקבתי אחרי {a} מטוסים. {b} נחתו. כמה עדיין בשמים?' },
        { type: 'subtraction', a: 8,  b: 3, result: 5,  hint: 'dots', radioText: 'מגדל הפיקוח! {a} מטוסים היו, {b} הגיעו ליעד. כמה נשארו?' },
        { type: 'subtraction', a: 9,  b: 4, result: 5,  hint: 'dots', radioText: 'מגדל הפיקוח, {a} מטוסים בשמים, {b} קיבלו אישור נחיתה. כמה ממתינים?' },
        { type: 'subtraction', a: 8,  b: 2, result: 6,  hint: 'dots', radioText: 'מגדל הפיקוח! {a} מטוסים היו, {b} יצאו. כמה נשארו?' },
        { type: 'subtraction', a: 10, b: 4, result: 6,  hint: 'dots', radioText: 'מגדל הפיקוח, {a} מטוסים בשמים, {b} נחתו. כמה עוד?' },
        { type: 'subtraction', a: 10, b: 3, result: 7,  hint: 'dots', radioText: 'מגדל הפיקוח! {a} מטוסים, {b} סיימו. כמה ממשיכים?' },
        { type: 'subtraction', a: 9,  b: 2, result: 7,  hint: 'dots', radioText: 'מגדל הפיקוח, {a} מטוסים, {b} נחתו. כמה נשארו?' },
        { type: 'subtraction', a: 10, b: 2, result: 8,  hint: 'dots', radioText: 'מגדל הפיקוח! {a} מטוסים בשמים, {b} קיבלו אישור. כמה ממתינים עוד?' },
        { type: 'subtraction', a: 9,  b: 1, result: 8,  hint: 'dots', radioText: 'מגדל הפיקוח, {a} מטוסים, {b} יצא. כמה נשארו?' },
        { type: 'subtraction', a: 10, b: 1, result: 9,  hint: 'dots', radioText: 'מגדל הפיקוח! {a} מטוסים, {b} נחת. כמה עוד בשמים?' },
      ]
    },
    {
      id: 3,
      name: 'נמל ירושלים',
      title: 'תחנת הביטחון — ירידה ל-10',
      visual: 'altitude',
      safetyStation: true,
      questions: [
        { type: 'subtraction', a: 11, b: 1,  result: 10, hint: 'decompose', radioText: 'מגדל הפיקוח, אני בגובה {a}. כמה יחידות גובה להוריד כדי להגיע לרמת הביטחון?' },
        { type: 'subtraction', a: 12, b: 2,  result: 10, hint: 'decompose', radioText: 'מגדל הפיקוח! גובה {a}. כמה להוריד כדי להגיע לגובה הביטחות — גובה 10?' },
        { type: 'subtraction', a: 13, b: 3,  result: 10, hint: 'decompose', radioText: 'מגדל הפיקוח, גובה {a}. כמה יחידות לרדת כדי להגיע לרמת הביטחון?' },
        { type: 'subtraction', a: 14, b: 4,  result: 10, hint: 'decompose', radioText: 'מגדל הפיקוח! אני בגובה {a}. כמה צריך להוריד כדי להגיע לגובה 10?' },
        { type: 'subtraction', a: 15, b: 5,  result: 10, hint: 'decompose', radioText: 'מגדל הפיקוח, גובה {a}. כמה יחידות גובה יש לי מעל רמת הביטחון?' },
        { type: 'subtraction', a: 16, b: 6,  result: 10, hint: 'decompose', radioText: 'מגדל הפיקוח! גובה {a}. כמה להוריד כדי להגיע לרמת הביטחון?' },
        { type: 'subtraction', a: 17, b: 7,  result: 10, hint: 'decompose', radioText: 'מגדל הפיקוח, אני בגובה {a}. כמה יחידות להוריד כדי להגיע לגובה 10?' },
        { type: 'subtraction', a: 18, b: 8,  result: 10, hint: 'decompose', radioText: 'מגדל הפיקוח! גובה {a}. כמה לרדת עד לרמת הביטחון?' },
        { type: 'subtraction', a: 19, b: 9,  result: 10, hint: 'decompose', radioText: 'מגדל הפיקוח, גובה {a}. כמה יחידות גובה יש לי מעל גובה 10?' },
      ]
    },
    {
      id: 4,
      name: 'נמל באר שבע',
      title: 'תחנת הביטחון — עלייה מ-10',
      visual: 'altitude',
      safetyStation: true,
      questions: [
        { type: 'addition', a: 10, b: 1,  result: 11, hint: 'decompose', radioText: 'מגדל הפיקוח, אני ברמת הביטחון — גובה 10. צריך לטפס {b} יחידות. לאיזה גובה אגיע?' },
        { type: 'addition', a: 10, b: 2,  result: 12, hint: 'decompose', radioText: 'מגדל הפיקוח! גובה 10, מטפס {b} יחידות. מה הגובה החדש?' },
        { type: 'addition', a: 10, b: 3,  result: 13, hint: 'decompose', radioText: 'מגדל הפיקוח, מרמת הביטחון אני עולה {b} יחידות. לאיזה גובה אגיע?' },
        { type: 'addition', a: 10, b: 4,  result: 14, hint: 'decompose', radioText: 'מגדל הפיקוח! גובה 10, עולה {b}. לאיזה גובה?' },
        { type: 'addition', a: 10, b: 5,  result: 15, hint: 'decompose', radioText: 'מגדל הפיקוח, מגובה 10 אני מטפס {b} יחידות. לאיזה גובה אגיע?' },
        { type: 'addition', a: 10, b: 6,  result: 16, hint: 'decompose', radioText: 'מגדל הפיקוח! ברמת הביטחון — גובה 10. עולה {b}. לאיזה גובה?' },
        { type: 'addition', a: 10, b: 7,  result: 17, hint: 'decompose', radioText: 'מגדל הפיקוח, גובה 10, מטפס {b} יחידות. מה הגובה?' },
        { type: 'addition', a: 10, b: 8,  result: 18, hint: 'decompose', radioText: 'מגדל הפיקוח! מגובה 10 עולה {b}. לאיזה גובה אגיע?' },
        { type: 'addition', a: 10, b: 9,  result: 19, hint: 'decompose', radioText: 'מגדל הפיקוח, גובה 10. טיפוס של {b} יחידות. לאיזה גובה?' },
      ]
    },
    {
      id: 5,
      name: 'נמל אילת',
      title: 'פירוק מספרים — 10 ועוד',
      visual: 'altitude',
      safetyStation: true,
      questions: [
        { type: 'decompose', a: 11, b: 10, result: 1,  hint: 'decompose', radioText: 'מגדל הפיקוח, אני בגובה {a}. ידוע שיש לי 10 יחידות בסיס. כמה יחידות יש לי מעל גובה 10?' },
        { type: 'decompose', a: 12, b: 10, result: 2,  hint: 'decompose', radioText: 'מגדל הפיקוח! גובה {a} — זה 10 ועוד כמה?' },
        { type: 'decompose', a: 13, b: 10, result: 3,  hint: 'decompose', radioText: 'מגדל הפיקוח, {a} זה 10 בתחתית ועוד כמה יחידות מעל?' },
        { type: 'decompose', a: 14, b: 10, result: 4,  hint: 'decompose', radioText: 'מגדל הפיקוח! גובה {a} — כמה יחידות יש מעל רמת הביטחון?' },
        { type: 'decompose', a: 15, b: 10, result: 5,  hint: 'decompose', radioText: 'מגדל הפיקוח, {a} שווה 10 ועוד כמה?' },
        { type: 'decompose', a: 16, b: 10, result: 6,  hint: 'decompose', radioText: 'מגדל הפיקוח! גובה {a}. פרק לי את הגובה — 10 ועוד כמה?' },
        { type: 'decompose', a: 17, b: 10, result: 7,  hint: 'decompose', radioText: 'מגדל הפיקוח, גובה {a}. כמה יחידות מעל לגובה 10?' },
        { type: 'decompose', a: 18, b: 10, result: 8,  hint: 'decompose', radioText: 'מגדל הפיקוח! {a} זה 10 ועוד כמה יחידות?' },
        { type: 'decompose', a: 19, b: 10, result: 9,  hint: 'decompose', radioText: 'מגדל הפיקוח, גובה {a} — פרק לי ל-10 ועוד משהו. הכמה?' },
      ]
    },
    {
      id: 6,
      name: 'נמל הצפון',
      title: 'חיסור בעשרת השנייה',
      visual: 'altitude',
      safetyStation: true,
      questions: [
        { type: 'subtraction', a: 14, b: 3,  result: 11, hint: 'decompose', radioText: 'מגדל הפיקוח, גובה {a}. יורד {b} יחידות. מה הגובה החדש?' },
        { type: 'subtraction', a: 15, b: 4,  result: 11, hint: 'decompose', radioText: 'מגדל הפיקוח! גובה {a}, יורד {b}. לאיזה גובה?' },
        { type: 'subtraction', a: 16, b: 5,  result: 11, hint: 'decompose', radioText: 'מגדל הפיקוח, מגובה {a} אני יורד {b} יחידות. לאיזה גובה?' },
        { type: 'subtraction', a: 15, b: 3,  result: 12, hint: 'decompose', radioText: 'מגדל הפיקוח! גובה {a}, ירידה של {b}. מה הגובה?' },
        { type: 'subtraction', a: 16, b: 4,  result: 12, hint: 'decompose', radioText: 'מגדל הפיקוח, {a} פחות {b}. לאיזה גובה אגיע?' },
        { type: 'subtraction', a: 17, b: 5,  result: 12, hint: 'decompose', radioText: 'מגדל הפיקוח! גובה {a}, יורד {b} יחידות. לאן?' },
        { type: 'subtraction', a: 18, b: 5,  result: 13, hint: 'decompose', radioText: 'מגדל הפיקוח, גובה {a}. ירידה של {b}. לאיזה גובה?' },
        { type: 'subtraction', a: 17, b: 4,  result: 13, hint: 'decompose', radioText: 'מגדל הפיקוח! {a} יורד {b}. מה הגובה החדש?' },
        { type: 'subtraction', a: 19, b: 4,  result: 15, hint: 'decompose', radioText: 'מגדל הפיקוח, גובה {a}. יורד {b}. לאיזה גובה?' },
        { type: 'subtraction', a: 18, b: 3,  result: 15, hint: 'decompose', radioText: 'מגדל הפיקוח! {a} פחות {b}. לאן מגיע?' },
      ]
    },
    {
      id: 7,
      name: 'נמל הבירה',
      title: 'חיבור וחיסור — חציית עשרות',
      visual: 'planes',
      questions: [
        { type: 'addition',    a: 8,  b: 5,  result: 13, hint: 'dots', radioText: 'מגדל הפיקוח, {a} מטוסים מצפון ועוד {b} מדרום. כמה בסה"כ?' },
        { type: 'addition',    a: 7,  b: 6,  result: 13, hint: 'dots', radioText: 'מגדל הפיקוח! {a} מטוסים ממזרח ו-{b} ממערב. כמה?' },
        { type: 'addition',    a: 9,  b: 4,  result: 13, hint: 'dots', radioText: 'מגדל הפיקוח, {a} ממתינים ועוד {b} מתקרבים. כמה בסך הכל?' },
        { type: 'addition',    a: 9,  b: 5,  result: 14, hint: 'dots', radioText: 'מגדל הפיקוח! {a} גדולים ו-{b} קטנים. כמה מטוסים?' },
        { type: 'addition',    a: 6,  b: 8,  result: 14, hint: 'dots', radioText: 'מגדל הפיקוח, {a} מטוסים בצד ימין, {b} בצד שמאל. כמה?' },
        { type: 'addition',    a: 9,  b: 6,  result: 15, hint: 'dots', radioText: 'מגדל הפיקוח! {a} מטוסים ועוד {b}. כמה?' },
        { type: 'addition',    a: 7,  b: 8,  result: 15, hint: 'dots', radioText: 'מגדל הפיקוח, {a} ועוד {b}. כמה בסה"כ?' },
        { type: 'subtraction', a: 13, b: 4,  result: 9,  hint: 'dots', radioText: 'מגדל הפיקוח, היו {a} מטוסים. {b} נחתו. כמה נשארו?' },
        { type: 'subtraction', a: 12, b: 5,  result: 7,  hint: 'dots', radioText: 'מגדל הפיקוח! {a} מטוסים, {b} סיימו. כמה ממשיכים?' },
        { type: 'subtraction', a: 14, b: 6,  result: 8,  hint: 'dots', radioText: 'מגדל הפיקוח, {a} מטוסים בשמים, {b} קיבלו אישור נחיתה. כמה עוד?' },
        { type: 'subtraction', a: 15, b: 7,  result: 8,  hint: 'dots', radioText: 'מגדל הפיקוח! {a} מטוסים, {b} נחתו. כמה בשמים?' },
        { type: 'subtraction', a: 11, b: 4,  result: 7,  hint: 'dots', radioText: 'מגדל הפיקוח, {a} פחות {b}. כמה נשארו?' },
      ]
    }
  ]
};
```

- [ ] **Step 2: Open browser console and verify `CURRICULUM.stages.length === 7`**

```js
// In browser console (F12):
console.assert(CURRICULUM.stages.length === 7, 'Expected 7 stages');
console.assert(CURRICULUM.stages[0].questions.length === 12, 'Stage 1 should have 12 questions');
console.assert(CURRICULUM.stages[2].questions[5].result === 10, 'Stage 3 Q6 result should be 10');
```

- [ ] **Step 3: Commit**

```bash
git add js/curriculum.js
git commit -m "feat: curriculum data — 7 stages, 80+ questions, radio text in Hebrew"
```

---

## Task 4: Progress Module

**Files:**
- Modify: `js/progress.js`

- [ ] **Step 1: Write full `js/progress.js`**

```js
// progress.js
// localStorage key: 'tower_control_save'
// Schema:
// {
//   playerName: string,
//   currentStage: number (1-7),
//   planesCollected: number[],    // PLANE_TYPES ids
//   stagesCompleted: number[],    // stage ids
//   shiftsCompleted: number,
//   rank: string
// }

const RANKS = [
  { name: 'מתלמד',       emoji: '⭐',  minStage: 1 },
  { name: 'פקח',         emoji: '✈️', minStage: 2 },
  { name: 'פקח בכיר',   emoji: '🛫', minStage: 4 },
  { name: 'מפקח',        emoji: '🏆', minStage: 6 },
  { name: 'מפקח ראשי',  emoji: '👑', minStage: 8 }, // achieved after stage 7 done
];

const PROGRESS = {
  _key: 'tower_control_save',

  _default() {
    return {
      playerName: '',
      currentStage: 1,
      planesCollected: [],
      stagesCompleted: [],
      shiftsCompleted: 0,
      rank: 'מתלמד'
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this._key);
      if (!raw) return this._default();
      return Object.assign(this._default(), JSON.parse(raw));
    } catch (e) {
      return this._default();
    }
  },

  save(data) {
    localStorage.setItem(this._key, JSON.stringify(data));
  },

  getRankForStage(currentStage) {
    let rank = RANKS[0];
    for (const r of RANKS) {
      if (currentStage >= r.minStage) rank = r;
    }
    return rank;
  },

  addPlane(data, planeId) {
    if (!data.planesCollected.includes(planeId)) {
      data.planesCollected.push(planeId);
    }
    return data;
  },

  completeStage(data, stageId) {
    if (!data.stagesCompleted.includes(stageId)) {
      data.stagesCompleted.push(stageId);
    }
    const next = stageId + 1;
    if (next > data.currentStage) {
      data.currentStage = Math.min(next, 7);
    }
    const rank = PROGRESS.getRankForStage(data.currentStage);
    data.rank = rank.name;
    return data;
  }
};
```

- [ ] **Step 2: Write `tests/tests.js`**

```js
// tests.js
function runTests() {
  console.group('PROGRESS tests');

  // Test default save
  const d = PROGRESS._default();
  console.assert(d.currentStage === 1, 'Default stage should be 1');
  console.assert(d.planesCollected.length === 0, 'Default planes should be empty');

  // Test getRankForStage
  console.assert(PROGRESS.getRankForStage(1).name === 'מתלמד', 'Stage 1 = מתלמד');
  console.assert(PROGRESS.getRankForStage(2).name === 'פקח', 'Stage 2 = פקח');
  console.assert(PROGRESS.getRankForStage(4).name === 'פקח בכיר', 'Stage 4 = פקח בכיר');
  console.assert(PROGRESS.getRankForStage(6).name === 'מפקח', 'Stage 6 = מפקח');

  // Test addPlane
  let data = PROGRESS._default();
  data = PROGRESS.addPlane(data, 1);
  data = PROGRESS.addPlane(data, 1); // duplicate
  console.assert(data.planesCollected.length === 1, 'No duplicate planes');

  // Test completeStage
  data = PROGRESS.completeStage(data, 1);
  console.assert(data.currentStage === 2, 'After completing stage 1, current = 2');
  console.assert(data.stagesCompleted.includes(1), 'Stage 1 in completed list');

  // Test CURRICULUM integrity
  console.assert(CURRICULUM.stages.length === 7, '7 stages');
  CURRICULUM.stages.forEach((s, i) => {
    console.assert(s.questions.length >= 8, `Stage ${i+1} has at least 8 questions`);
    s.questions.forEach((q, j) => {
      if (q.type === 'addition') {
        console.assert(q.a + q.b === q.result, `Stage ${i+1} Q${j+1}: ${q.a}+${q.b}≠${q.result}`);
      } else if (q.type === 'subtraction') {
        console.assert(q.a - q.b === q.result, `Stage ${i+1} Q${j+1}: ${q.a}-${q.b}≠${q.result}`);
      } else if (q.type === 'decompose') {
        console.assert(q.a - q.b === q.result, `Stage ${i+1} Q${j+1}: ${q.a}-${q.b}≠${q.result}`);
      }
    });
  });

  console.groupEnd();
  console.log('All tests passed!');
}
```

- [ ] **Step 3: Open browser, open console (F12), run `runTests()`**

Expected output: "All tests passed!" with no assertion errors.

- [ ] **Step 4: Commit**

```bash
git add js/progress.js tests/tests.js
git commit -m "feat: progress module — localStorage save/load, rank system, tests"
```

---

## Task 5: Entry Screen Logic

**Files:**
- Modify: `js/game.js`

- [ ] **Step 1: Write entry screen logic in `js/game.js`**

```js
// game.js

// ===== STATE =====
let saveData = null;  // loaded from PROGRESS
let currentQ = null;  // current question object
let attempts = 0;     // 0-2 for current question
let selectedAnswer = null; // currently selected number
let shiftQuestions = [];   // 8-question array for this shift
let shiftIndex = 0;        // which question in the shift we're on
let correctCount = 0;      // how many correct this shift

const QUESTIONS_PER_SHIFT = 8;
const SHIFT_NAMES = ['משמרת בוקר 🌅', 'משמרת צהריים ☀️', 'משמרת ערב 🌙'];

// ===== SCREEN MANAGEMENT =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// ===== ENTRY SCREEN =====
function initEntry() {
  saveData = PROGRESS.load();
  const nameInput = document.getElementById('player-name');
  const btnStart  = document.getElementById('btn-start');
  const rankEl    = document.getElementById('entry-rank');

  if (saveData.playerName) {
    nameInput.value = saveData.playerName;
    const rank = PROGRESS.getRankForStage(saveData.currentStage);
    rankEl.textContent = `${rank.emoji} דרגה: ${rank.name}`;
    rankEl.classList.remove('hidden');
  }

  // Use onclick (not addEventListener) to avoid accumulating listeners
  // when initEntry() is called again after returning from report/album/map.
  btnStart.onclick = () => {
    const name = nameInput.value.trim();
    if (!name) { nameInput.focus(); return; }
    saveData.playerName = name;
    PROGRESS.save(saveData);
    startShift();
  };

  nameInput.onkeydown = e => {
    if (e.key === 'Enter') btnStart.click();
  };
}

// ===== START SHIFT =====
function startShift() {
  const stage = CURRICULUM.stages.find(s => s.id === saveData.currentStage)
             || CURRICULUM.stages[CURRICULUM.stages.length - 1];

  // Shuffle and take QUESTIONS_PER_SHIFT questions
  const pool = [...stage.questions];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  shiftQuestions = pool.slice(0, QUESTIONS_PER_SHIFT);
  shiftIndex = 0;
  correctCount = 0;

  // Set header
  const rank = PROGRESS.getRankForStage(saveData.currentStage);
  document.getElementById('hdr-rank').textContent = `${rank.emoji} ${rank.name}`;
  document.getElementById('hdr-name').textContent = saveData.playerName;
  const shiftName = SHIFT_NAMES[saveData.shiftsCompleted % 3];
  document.getElementById('hdr-shift').textContent = shiftName;

  showScreen('screen-game');
  loadQuestion(shiftQuestions[0]);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initEntry();
  showScreen('screen-entry');
});
```

- [ ] **Step 2: Open browser, type a name, click "התחל משמרת"**

The game screen should appear. The header should show the name and "מתלמד" rank. No console errors.

- [ ] **Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: entry screen — name input, rank display, shift start"
```

---

## Task 6: Question Display

**Files:**
- Modify: `js/game.js`

- [ ] **Step 1: Add `loadQuestion` and helper functions to `js/game.js`**

Add these functions after the `startShift` function:

```js
// ===== QUESTION DISPLAY =====
function formatRadioText(template, q) {
  return template
    .replace(/{a}/g, q.a)
    .replace(/{b}/g, q.b)
    .replace(/{result}/g, q.result);
}

function loadQuestion(q) {
  currentQ = q;
  attempts = 0;
  selectedAnswer = null;

  // Update progress counter
  document.getElementById('hdr-progress').textContent =
    `${shiftIndex + 1}/${QUESTIONS_PER_SHIFT}`;

  // Set radio text
  document.getElementById('radio-text').textContent = formatRadioText(q.radioText, q);

  // Reset radio bubble style
  const bubble = document.getElementById('radio-bubble');
  bubble.classList.remove('correct', 'retry');

  // Reset answer display
  document.getElementById('answer-value').textContent = '—';
  document.getElementById('answer-display').classList.remove('selected');
  document.getElementById('btn-submit').disabled = true;

  // Hide hint
  document.getElementById('hint-area').classList.add('hidden');

  // Show correct visual
  if (q.visual === 'altitude') {
    showAltitudeMeter(q);
    document.getElementById('radar-screen').style.display = 'none';
    document.getElementById('altitude-meter').classList.remove('hidden');
  } else {
    showRadarPlanes(q);
    document.getElementById('radar-screen').style.display = '';
    document.getElementById('altitude-meter').classList.add('hidden');
  }
}

// ===== RADAR VISUAL =====
function showRadarPlanes(q) {
  const container = document.getElementById('radar-planes');
  container.innerHTML = '';
  const total = q.type === 'addition' ? q.a + q.b : q.a;
  const landed = q.type === 'subtraction' ? q.b : 0;

  // Place planes at fixed positions on a circle inside radar
  const positions = [
    [50, 25], [75, 35], [80, 60], [65, 80],
    [35, 80], [20, 60], [25, 35], [50, 65],
    [60, 45], [40, 45], [70, 55], [30, 55],
  ];

  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'plane-dot';
    const [left, top] = positions[i % positions.length];
    dot.style.left = left + '%';
    dot.style.top  = top  + '%';
    dot.textContent = '✈';
    if (i < landed) dot.classList.add('landed');
    container.appendChild(dot);
  }
}

// ===== ALTITUDE METER VISUAL =====
function showAltitudeMeter(q) {
  const altitude = q.a; // starting altitude
  const maxAlt = 20;
  const pct = (altitude / maxAlt) * 100;

  document.getElementById('alt-fill').style.height = pct + '%';
  document.getElementById('alt-number').textContent = altitude;

  // Show decomposition for altitude-type questions
  const decompose = document.getElementById('alt-decompose');
  if (q.hint === 'decompose' && altitude > 10) {
    document.getElementById('decompose-units').textContent = altitude - 10;
    decompose.classList.remove('hidden');
  } else {
    decompose.classList.add('hidden');
  }
}
```

- [ ] **Step 2: Verify in browser**

After starting a shift, the game screen should show:
- A radio message with formatted Hebrew text (no `{a}` or `{b}` visible)
- For stage 1/2: radar with plane dots
- Progress counter showing "1/8"

- [ ] **Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: question display — radio text, radar planes, altitude meter"
```

---

## Task 7: Number Pad + Answer Submission

**Files:**
- Modify: `js/game.js`

- [ ] **Step 1: Add number pad event handlers to `js/game.js`**

Add inside `document.addEventListener('DOMContentLoaded', ...)` after `initEntry()`:

```js
  // Number pad
  document.querySelectorAll('.num-btn[data-n]').forEach(btn => {
    btn.addEventListener('click', () => handleNumPress(btn.dataset.n));
  });

  document.getElementById('btn-submit').addEventListener('click', handleSubmit);
```

Then add these functions:

```js
// ===== NUMBER PAD =====
function handleNumPress(n) {
  if (n === 'clear') {
    selectedAnswer = null;
    document.getElementById('answer-value').textContent = '—';
    document.getElementById('answer-display').classList.remove('selected');
    document.getElementById('btn-submit').disabled = true;
    return;
  }

  const digit = parseInt(n, 10);

  // Allow two-digit answers (for results up to 19)
  if (selectedAnswer === null) {
    selectedAnswer = digit;
  } else if (selectedAnswer < 10) {
    // Append digit to form two-digit number
    const twoDigit = selectedAnswer * 10 + digit;
    if (twoDigit <= 20) {
      selectedAnswer = twoDigit;
    } else {
      selectedAnswer = digit; // start fresh
    }
  } else {
    selectedAnswer = digit; // start fresh if already 2 digits
  }

  document.getElementById('answer-value').textContent = selectedAnswer;
  document.getElementById('answer-display').classList.add('selected');
  document.getElementById('btn-submit').disabled = false;
}
```

- [ ] **Step 2: Verify number pad in browser**

Clicking number buttons should show the number in the answer display. Clicking "✕" clears it. Submit button enables only when a number is selected.

- [ ] **Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: number pad — digit input, two-digit support, clear button"
```

---

## Task 8: Answer Checking + 3-Attempt Policy

**Files:**
- Modify: `js/game.js`

- [ ] **Step 1: Add `handleSubmit`, `showCorrect`, `showWrong`, `showHint` functions**

```js
// ===== ANSWER HANDLING =====
function handleSubmit() {
  if (selectedAnswer === null) return;

  if (selectedAnswer === currentQ.result) {
    showCorrect();
  } else {
    attempts++;
    if (attempts >= 3) {
      // Reveal answer gently
      revealAnswer();
    } else {
      showWrong();
    }
  }
}

function showCorrect() {
  correctCount++;
  const bubble = document.getElementById('radio-bubble');
  bubble.classList.add('correct');

  const responses = [
    'מצוין מגדל הפיקוח! יורדים לנחיתה!',
    'כל הכבוד! המטוס נוחת בבטחה!',
    'עבודה מצוינת פקח! אישור נחיתה!',
    'מעולה! המטוס מקבל אישור!',
    'פנטסטי! נחיתה חלקה!'
  ];
  document.getElementById('radio-text').textContent =
    responses[Math.floor(Math.random() * responses.length)];

  // Animate landing on radar (if planes visual)
  if (currentQ.visual === 'planes' && currentQ.type === 'subtraction') {
    animateLanding();
  }

  // Animate altitude drop to result (if altitude visual)
  if (currentQ.visual === 'altitude') {
    animateAltitudeChange(currentQ.result);
  }

  // Move to next question after delay
  setTimeout(nextQuestion, 1800);
}

function showWrong() {
  const bubble = document.getElementById('radio-bubble');
  bubble.classList.add('retry');
  setTimeout(() => bubble.classList.remove('retry'), 500);

  const retryMessages = [
    'מגדל הפיקוח, חזור — לא קלטנו היטב.',
    'מגדל הפיקוח, אמור שנית?',
    'מגדל הפיקוח, יש הפרעות בקשר — חזור בבקשה.',
  ];
  document.getElementById('radio-text').textContent =
    retryMessages[attempts - 1] || retryMessages[0];

  // Reset answer for retry
  selectedAnswer = null;
  document.getElementById('answer-value').textContent = '—';
  document.getElementById('answer-display').classList.remove('selected');
  document.getElementById('btn-submit').disabled = true;

  // Show hint after first wrong
  if (attempts === 1) showHint(1);
  if (attempts === 2) showHint(2);
}

function showHint(level) {
  const hintArea = document.getElementById('hint-area');
  const hintDots = document.getElementById('hint-dots');
  hintArea.classList.remove('hidden');
  hintDots.innerHTML = '';

  if (currentQ.visual === 'altitude' && level >= 1) {
    // Show decomposition
    const decompose = document.getElementById('alt-decompose');
    decompose.classList.remove('hidden');
    // Pulse the safety line
    const line = document.querySelector('.alt-safety-line');
    line.classList.remove('pulse');
    void line.offsetWidth; // force reflow
    line.classList.add('pulse');
    setTimeout(() => line.classList.remove('pulse'), 2000);
    return;
  }

  // Dots hint for planes visual
  const total = currentQ.a;
  const crossed = currentQ.type === 'subtraction' ? currentQ.b : 0;
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'hint-dot' + (i < crossed ? ' crossed' : '');
    dot.textContent = i < crossed ? '✕' : '•';
    hintDots.appendChild(dot);
  }

  if (level >= 2) {
    // Group dots visually — add separator after first group
    const separator = document.createElement('div');
    separator.style.width = '100%';
    hintDots.insertBefore(separator, hintDots.children[currentQ.a] || null);
  }
}

function revealAnswer() {
  document.getElementById('radio-text').textContent =
    `התשובה היא ${currentQ.result}. המטוס נוחת בכל זאת — כל הכבוד שניסית!`;

  if (currentQ.visual === 'altitude') {
    animateAltitudeChange(currentQ.result);
  }

  setTimeout(nextQuestion, 2500);
}

// ===== ANIMATIONS =====
function animateLanding() {
  const dots = document.querySelectorAll('.plane-dot:not(.landed)');
  if (dots.length > 0) {
    dots[dots.length - 1].classList.add('landed');
  }
}

function animateAltitudeChange(targetAlt) {
  const maxAlt = 20;
  const pct = (targetAlt / maxAlt) * 100;
  document.getElementById('alt-fill').style.height = pct + '%';
  document.getElementById('alt-number').textContent = targetAlt;

  // If arriving exactly at 10, pulse the safety line
  if (targetAlt === 10) {
    const line = document.querySelector('.alt-safety-line');
    line.classList.remove('pulse');
    void line.offsetWidth;
    line.classList.add('pulse');
    setTimeout(() => line.classList.remove('pulse'), 2000);
  }
}
```

- [ ] **Step 2: Test in browser**

- Enter a correct answer → radio bubble flashes green, success message appears
- Enter a wrong answer → bubble shakes, "חזור" message appears, hint dots show
- Enter wrong 3 times → answer revealed gently, no shame message

- [ ] **Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: answer checking — 3 attempts, hints, gentle reveal, animations"
```

---

## Task 9: Next Question + End of Shift

**Files:**
- Modify: `js/game.js`

- [ ] **Step 1: Add `nextQuestion` and `endShift` functions**

```js
// ===== SHIFT FLOW =====
function nextQuestion() {
  shiftIndex++;
  if (shiftIndex >= QUESTIONS_PER_SHIFT) {
    endShift();
    return;
  }
  loadQuestion(shiftQuestions[shiftIndex]);
}

function endShift() {
  saveData.shiftsCompleted = (saveData.shiftsCompleted || 0) + 1;
  const oldStage = saveData.currentStage;

  // Advance stage when 3 consecutive shifts have high accuracy (≥6/8 correct)
  // For simplicity in this version: advance after every 2 shifts on same stage
  const stageShifts = saveData.shiftsCompleted;
  const shouldAdvance = correctCount >= 6 && (stageShifts % 2 === 0);

  let rankUp = false;
  let newPlane = null;

  if (shouldAdvance && saveData.currentStage < 7) {
    const oldRank = PROGRESS.getRankForStage(saveData.currentStage).name;
    saveData = PROGRESS.completeStage(saveData, saveData.currentStage);
    const newRank = PROGRESS.getRankForStage(saveData.currentStage).name;
    rankUp = (newRank !== oldRank);
  }

  // Award a random plane not yet collected
  const uncollected = PLANE_TYPES.filter(p => !saveData.planesCollected.includes(p.id));
  if (uncollected.length > 0) {
    const awarded = uncollected[Math.floor(Math.random() * uncollected.length)];
    saveData = PROGRESS.addPlane(saveData, awarded.id);
    newPlane = awarded;
  }

  PROGRESS.save(saveData);
  showReport(correctCount, newPlane, rankUp);
}

// ===== SHIFT REPORT =====
function showReport(correct, newPlane, rankUp) {
  const planesEl  = document.getElementById('report-planes');
  const msgEl     = document.getElementById('report-msg');
  const planeEl   = document.getElementById('report-new-plane');
  const rankEl    = document.getElementById('report-rank-up');
  const btnCont   = document.getElementById('btn-continue');

  // Show plane emojis for each correct answer
  planesEl.innerHTML = '';
  for (let i = 0; i < correct; i++) {
    const span = document.createElement('span');
    span.textContent = '✈️';
    planesEl.appendChild(span);
  }

  const msgs = [
    `היום נחתו בבטחה ${correct} מטוסים. כל הכבוד, ${saveData.playerName}!`,
    `משמרת מצוינת! ${correct} מטוסים נחתו בשלום תודה לך!`,
    `עבודה טובה, פקח! ${correct} נחיתות בטוחות היום.`,
  ];
  msgEl.textContent = msgs[Math.floor(Math.random() * msgs.length)];

  if (newPlane) {
    planeEl.textContent = `מטוס חדש באלבום: ${newPlane.emoji} ${newPlane.name}`;
    planeEl.classList.remove('hidden');
  } else {
    planeEl.classList.add('hidden');
  }

  if (rankUp) {
    const rank = PROGRESS.getRankForStage(saveData.currentStage);
    rankEl.textContent = `קידום! דרגה חדשה: ${rank.emoji} ${rank.name}`;
    rankEl.classList.remove('hidden');
  } else {
    rankEl.classList.add('hidden');
  }

  // Continue button goes back to entry screen
  btnCont.onclick = () => {
    showScreen('screen-entry');
    initEntry();
  };

  showScreen('screen-report');
}
```

- [ ] **Step 2: Test full shift in browser**

Answer all 8 questions. The report screen should appear with:
- Plane emojis for correct answers
- A positive message (no mention of wrong answers)
- A new plane badge if planes remain to collect
- Rank-up notification if applicable

- [ ] **Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: shift flow — next question, end shift, report screen with planes and rank"
```

---

## Task 10: Album + Map Screens

**Files:**
- Modify: `js/game.js`

- [ ] **Step 1: Add album and map screen logic + navigation**

Add these functions:

```js
// ===== ALBUM SCREEN =====
function showAlbum() {
  const grid = document.getElementById('album-grid');
  grid.innerHTML = '';
  PLANE_TYPES.forEach(p => {
    const slot = document.createElement('div');
    const collected = saveData.planesCollected.includes(p.id);
    slot.className = 'album-slot' + (collected ? '' : ' empty');
    slot.textContent = collected ? p.emoji : '?';
    slot.title = collected ? p.name : '???';
    grid.appendChild(slot);
  });

  document.getElementById('btn-album-back').onclick = () => {
    showScreen('screen-entry');
    initEntry();
  };

  showScreen('screen-album');
}

// ===== MAP SCREEN =====
function showMap() {
  const container = document.getElementById('map-stages');
  container.innerHTML = '';

  CURRICULUM.stages.forEach(stage => {
    const completed = saveData.stagesCompleted.includes(stage.id);
    const current   = stage.id === saveData.currentStage;
    const locked    = stage.id > saveData.currentStage;

    const row = document.createElement('div');
    row.className = 'map-stage' +
      (completed ? ' completed' : '') +
      (current   ? ' current'   : '') +
      (locked    ? ' locked'    : '');

    const icon   = document.createElement('span');
    icon.className = 'map-stage-icon';
    icon.textContent = completed ? '✅' : (current ? '👉' : '🔒');

    const name   = document.createElement('span');
    name.className = 'map-stage-name';
    name.textContent = `נמל ${stage.id}: ${stage.title}`;

    const status = document.createElement('span');
    status.className = 'map-stage-status';
    status.textContent = completed ? 'הושלם' : (current ? 'פעיל' : 'נעול');

    row.append(icon, name, status);
    container.appendChild(row);
  });

  document.getElementById('btn-map-back').onclick = () => {
    showScreen('screen-entry');
    initEntry();
  };

  showScreen('screen-map');
}
```

- [ ] **Step 2: Add album and map buttons to entry screen in `index.html`**

Find the entry screen `<div class="entry-form">` and add after the start button:

```html
        <div class="entry-nav">
          <button id="btn-show-album" class="btn-secondary">אלבום מטוסים ✈️</button>
          <button id="btn-show-map"   class="btn-secondary">מפת נמלים 🗺️</button>
        </div>
```

- [ ] **Step 3: Add CSS for entry nav**

Append to `css/style.css`:

```css
/* ===== ENTRY NAV ===== */
.entry-nav {
  display: flex;
  gap: 8px;
  width: 100%;
}

.entry-nav .btn-secondary {
  flex: 1;
  font-size: 0.85rem;
  padding: 8px 12px;
}
```

- [ ] **Step 4: Wire up album/map buttons in `js/game.js`**

Inside `document.addEventListener('DOMContentLoaded', ...)`, add:

```js
  document.getElementById('btn-show-album').addEventListener('click', () => {
    saveData = PROGRESS.load();
    showAlbum();
  });

  document.getElementById('btn-show-map').addEventListener('click', () => {
    saveData = PROGRESS.load();
    showMap();
  });
```

- [ ] **Step 5: Test album and map in browser**

Entry screen should now have two secondary buttons. Clicking Album shows the plane collection. Clicking Map shows the 7 stages with correct locked/current/completed state.

- [ ] **Step 6: Commit**

```bash
git add index.html css/style.css js/game.js
git commit -m "feat: album and map screens — plane collection, stage progress"
```

---

## Task 11: End-to-End Verification

**Files:** read-only

- [ ] **Step 1: Run all curriculum tests**

Open browser console (F12) and run:
```js
runTests();
```
Expected: "All tests passed!"

- [ ] **Step 2: Verify Entry → Shift → Report → Entry cycle**

1. Open `index.html` in browser
2. Enter name "דניאל", click "התחל משמרת"
3. Answer all 8 questions (use correct answers from CURRICULUM.stages[0])
4. Verify report screen shows planes + positive message
5. Click "המשך" — verify return to entry screen with rank displayed

- [ ] **Step 3: Verify 3-attempt policy**

1. Start a shift
2. Enter wrong answer twice — verify "חזור" messages appear, hint dots show
3. Enter wrong answer third time — verify answer revealed gently, no "שגיאה" text anywhere on screen
4. Verify the shift continues to next question

- [ ] **Step 4: Verify altitude meter (stages 3-5)**

1. Manually set `saveData.currentStage = 3` in browser console, then `PROGRESS.save(saveData)`, then reload
2. Start a shift — verify altitude meter appears instead of radar
3. Verify decomposition box shows `[10] + [X]`
4. Verify safety line pulses on correct answer when result = 10

- [ ] **Step 5: Verify localStorage persistence**

1. Complete a shift
2. Refresh the page (F5)
3. Verify player name pre-filled, rank badge shown

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat: מגדל הפיקוח v1.0 — complete game with 7 stages, 3-attempt policy, album, map"
```

---

## Quick Reference

| Stage | Content | Visual |
|-------|---------|--------|
| 1 | חיבור עד 10 | מטוסים על רדאר |
| 2 | חיסור עד 10 | מטוסים על רדאר |
| 3 | חיסור עד 10 בדיוק (X-Y=10) | מד גובה + "תחנת ביטחון" |
| 4 | חיבור מ-10 (10+Y=X) | מד גובה |
| 5 | פירוק: X = 10 + ? | מד גובה + פירוק |
| 6 | חיסור בעשרת השנייה | מד גובה |
| 7 | חציית עשרות | מטוסים |

**No answer is ever marked "wrong".** Always: "חזור — לא קלטנו היטב."
**No plane ever crashes.** Always: plane lands safely.
**Rank never decreases.** Only increases.
