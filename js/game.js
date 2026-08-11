// game.js

// ===== STATE =====
let saveData = null;  // loaded from PROGRESS
let currentQ = null;  // current question object
let attempts = 0;     // 0-2 for current question
let selectedAnswer = null; // currently selected number
let shiftQuestions = [];   // 8-question array for this shift
let shiftIndex = 0;        // which question in the shift we're on
let correctCount = 0;      // how many correct this shift
let activeStage = null;    // stage being played (not always the current stage)
let practiceMode = false;  // replaying a completed port from the map
let combo = 0;             // current run of correct answers
let shiftStats = null;     // { answered, correct, firstTry, bestCombo, hours }
let bridge = null;         // open safety-station ladder, or null
let qStarted = 0;          // when the current call was first heard
let qLadder = false;       // was the ladder opened on this call

const QUESTIONS_PER_SHIFT = 8;
const SHIFT_NAMES = ['מִשְׁמֶרֶת בֹּקֶר 🌅', 'מִשְׁמֶרֶת צׇהֳרַיִם ☀️', 'מִשְׁמֶרֶת עֶרֶב 🌙'];

// Flight hours are a score that only ever grows. Trying is worth something,
// getting there alone is worth more.
const HOURS = { firstTry: 10, correct: 6, revealed: 2, comboStep: 2, shift: 15, mission: 30 };

// ===== SCREEN MANAGEMENT =====
const $ = id => document.getElementById(id);

// Screens that sit in front of the airport. The question screen is not one of
// them: it draws its own flat background, so the 3D loop is idled there rather
// than rendering frames nobody can see.
const AMBIENT_SCREENS = ['screen-entry', 'screen-report', 'screen-album', 'screen-map',
                         'screen-parents'];

let use3D = false;

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  $(id).classList.remove('hidden');
  sync3D(id);
}

/** Point the single 3D canvas at whatever the current screen needs. */
function sync3D(id) {
  if (!use3D) return;
  if (id === 'screen-landing') return;      // the landing world drives itself
  SCENE3D.endLanding();
  if (AMBIENT_SCREENS.includes(id)) SCENE3D.startAirport($('scene3d-host'));
  else SCENE3D.idle();
}

// ===== ENTRY SCREEN =====
function initEntry() {
  saveData = PROGRESS.load();
  SFX.enabled = saveData.soundOn !== false;

  const nameInput = $('player-name');
  const btnStart  = $('btn-start');
  const rankEl    = $('entry-rank');

  if (saveData.playerName) {
    nameInput.value = saveData.playerName;
    const rank = PROGRESS.getRankForStage(saveData.currentStage);
    rankEl.textContent = `${rank.emoji} דַּרְגָּה: ${rank.name}`;
    rankEl.classList.remove('hidden');
  } else {
    rankEl.classList.add('hidden');
  }

  renderEntryStats();
  renderMission();
  renderSoundToggle();

  // Pull anything the other device did, without making him wait for it.
  SYNC.syncInBackground(saveData, res => {
    if (!res.ok || res.gained <= 0) return;
    saveData = res.save;
    if (!$('screen-entry').classList.contains('hidden')) {
      renderEntryStats();
      renderMission();
    }
  });

  // Use onclick (not addEventListener) to avoid accumulating listeners
  // when initEntry() is called again after returning from report/album/map.
  btnStart.onclick = () => {
    const name = nameInput.value.trim();
    if (!name) { nameInput.focus(); return; }
    saveData.playerName = name;
    PROGRESS.save(saveData);
    SFX.whoosh();
    startShift(saveData.currentStage, false);
  };

  nameInput.onkeydown = e => {
    if (e.key === 'Enter') btnStart.click();
  };
}

function renderEntryStats() {
  const el = $('entry-stats');
  if (!saveData.playerName) { el.classList.add('hidden'); return; }

  const parts = [];
  if (saveData.streakDays > 1) parts.push(`🔥 ${saveData.streakDays} יָמִים בָּרָצַף`);
  parts.push(`⏱️ ${saveData.flightHours || 0} שְׁעוֹת טִיסָה`);
  parts.push(`✈️ ${saveData.planesCollected.length}/${PLANE_TYPES.length} מְטוֹסִים`);
  el.innerHTML = parts.map(p => `<span>${p}</span>`).join('');
  el.classList.remove('hidden');
}

function renderMission() {
  const el = $('entry-mission');
  if (!saveData.playerName) { el.classList.add('hidden'); return; }

  const m = PROGRESS.currentMission(saveData);
  el.innerHTML = `<span class="mission-label">🎯 מְשִׂימַת הַיּוֹם</span>
                  <span class="mission-text">${m.text}</span>`;
  el.className = 'mission-card' + (m.done ? ' done' : '');
  if (m.done) el.querySelector('.mission-label').textContent = '✅ מְשִׂימַת הַיּוֹם הֻשְׁלְמָה';
  el.classList.remove('hidden');
}

function renderSoundToggle() {
  const btn = $('btn-sound');
  const on  = saveData.soundOn !== false;
  btn.textContent = on ? '🔊' : '🔇';
  btn.title = on ? 'כַּבֵּה צְלִילִים' : 'הַדְלֵק צְלִילִים';
  btn.onclick = () => {
    saveData.soundOn = !(saveData.soundOn !== false);
    SFX.enabled = saveData.soundOn;
    PROGRESS.save(saveData);
    renderSoundToggle();
    if (SFX.enabled) SFX.click();
  };
}

// ===== START SHIFT =====
function startShift(stageId, practice) {
  activeStage = CURRICULUM.stages.find(s => s.id === stageId)
             || CURRICULUM.stages[CURRICULUM.stages.length - 1];
  practiceMode = !!practice;

  // Shuffle and take QUESTIONS_PER_SHIFT questions
  const pool = activeStage.questions.map(q => ({
    ...q,
    visual: q.visual || activeStage.visual,
    altMax: q.altMax || activeStage.altMax || 20,
  }));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  shiftQuestions = pool.slice(0, QUESTIONS_PER_SHIFT);
  shiftIndex = 0;
  correctCount = 0;
  combo = 0;
  bridge = null;
  shiftStats = { answered: 0, correct: 0, firstTry: 0, bestCombo: 0, hours: 0,
                 total: QUESTIONS_PER_SHIFT };

  PROGRESS.touchDay(saveData);
  PROGRESS.save(saveData);

  // Header
  const rank = PROGRESS.getRankForStage(saveData.currentStage);
  $('hdr-rank').textContent = `${rank.emoji} ${rank.name}`;
  $('hdr-name').textContent = saveData.playerName;
  $('hdr-shift').textContent = practiceMode
    ? `🛠️ אִימּוּן — ${activeStage.name}`
    : SHIFT_NAMES[saveData.shiftsCompleted % 3];
  renderCombo();

  showScreen('screen-game');
  loadQuestion(shiftQuestions[0]);
}

function renderCombo() {
  const el = $('hdr-combo');
  if (combo >= 2) {
    el.textContent = `🔥 ×${combo}`;
    el.classList.remove('hidden');
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
  } else {
    el.classList.add('hidden');
  }
}

// ===== QUESTION DISPLAY =====
function formatRadioText(template, q) {
  return fillTemplate(template, q);
}

function setRadio(text, speak) {
  $('radio-text').textContent = text;
  if (speak) SPEECH.speak(text);
}

function loadQuestion(q) {
  _stopSpeech();

  currentQ = q;
  attempts = 0;
  bridge = null;
  qStarted = Date.now();
  qLadder = false;
  clearAnswer();

  $('hdr-progress').textContent = `${shiftIndex + 1}/${QUESTIONS_PER_SHIFT}`;

  const bubble = $('radio-bubble');
  bubble.classList.remove('correct', 'retry');

  $('hint-area').classList.add('hidden');
  $('hint-text').textContent = '';
  $('bridge-panel').classList.add('hidden');

  // The ladder button exists only where there is a ten to cross.
  const canBridge = q.hint === 'bridge';
  $('btn-bridge').classList.toggle('hidden', !canBridge);

  showVisual(q);

  SFX.radio();
  setRadio(formatRadioText(q.radioText, q), true);

  // The very first ten-crossing question the child ever meets opens the ladder
  // by itself. After that it is his to call for.
  if (canBridge && !saveData.bridgeTaught) {
    saveData.bridgeTaught = true;
    PROGRESS.save(saveData);
    setTimeout(() => { if (currentQ === q && !bridge) openBridge(true); }, 2600);
  }
}

function showVisual(q) {
  if (q.visual === 'altitude') {
    $('radar-screen').style.display = 'none';
    $('altitude-meter').classList.remove('hidden');
    renderAltitude(q);
  } else {
    showRadarPlanes(q);
    $('radar-screen').style.display = '';
    $('altitude-meter').classList.add('hidden');
  }
}

// ===== RADAR VISUAL =====
function showRadarPlanes(q) {
  const container = $('radar-planes');
  container.innerHTML = '';
  const total  = q.type === 'addition' ? q.a + q.b : q.a;
  const landed = q.type === 'subtraction' ? q.b : 0;

  // Place planes at fixed positions on a circle inside radar
  const positions = [
    [50, 25], [75, 35], [80, 60], [65, 80],
    [35, 80], [20, 60], [25, 35], [50, 65],
    [60, 45], [40, 45], [70, 55], [30, 55],
    [55, 15], [45, 85], [85, 45],
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

// ===== ALTITUDE METER =====
// One meter serves both scales. Up to 20 it is the safety station at 10; up to
// 100 every ten is a marked flight level, and the one the plane is sitting in
// is lit. The child sees the same idea twice at two sizes, which is the point.

function altMaxOf(q) { return q.altMax || 20; }

function renderAltitude(q) {
  const max = altMaxOf(q);
  const meter = $('altitude-meter');
  meter.classList.toggle('tall', max > 20);

  // Tick marks, one per ten.
  const ticks = $('alt-ticks');
  ticks.innerHTML = '';
  const step = 10;
  for (let v = step; v <= max; v += step) {
    // Only 10 is the safety station. The top of a 0–20 meter is just a ceiling,
    // and labelling it "safety level 20" would teach a station that isn't one.
    const isStation = max <= 20 && v === 10;
    const tick = document.createElement('div');
    tick.className = 'alt-tick' + (isStation ? ' safety' : '');
    tick.style.bottom = (v / max * 100) + '%';
    tick.dataset.value = v;
    const label = document.createElement('span');
    label.className = 'alt-tick-label';
    label.textContent = isStation ? 'תַּחֲנַת הָעֲשָׂרָה — 10' : v;
    tick.appendChild(label);
    ticks.appendChild(tick);
  }

  setAltitude(q.a, max, false);
  highlightLevel(q.a, max);
  renderDecompose(q);
}

/** Move the needle. `animate` is only false when placing it for a new question. */
function setAltitude(value, max, animate = true) {
  const fill = $('alt-fill');
  fill.style.transition = animate ? '' : 'none';
  fill.style.height = Math.max(0, Math.min(100, value / max * 100)) + '%';
  if (!animate) { void fill.offsetHeight; fill.style.transition = ''; }
  $('alt-number').textContent = value;
}

/** Light the ten the plane is currently inside. */
function highlightLevel(value, max) {
  const level = Math.floor(value / 10) * 10;
  document.querySelectorAll('.alt-tick').forEach(t => {
    t.classList.toggle('active', Number(t.dataset.value) === level);
  });
}

/** The "40 + 7" strip under the meter. Shown where it helps, hidden where it
 *  would hand over the very number being asked for. */
function renderDecompose(q, force) {
  const box = $('alt-decompose');
  const hide = () => box.classList.add('hidden');

  // Splitting a number is the answer on the decomposition ports, and the method
  // being practised on the bridging ports. Neither gets it for free.
  const givesItAway = (q.type === 'decompose' || q.type === 'split' || q.type === 'tens');
  if (!force && (q.hint !== 'decompose' || givesItAway)) return hide();

  // Which number is worth splitting: where the plane is, or — when it starts
  // exactly on a ten — where it is heading.
  const n = q.a > 10 ? q.a : (q.result > 10 ? q.result : q.a);
  const tens  = Math.floor(n / 10) * 10;
  const units = n - tens;
  if (tens === 0) return hide();

  $('decompose-ten').textContent   = tens;
  $('decompose-units').textContent = units;
  box.classList.remove('hidden');
}

// ===== NUMBER PAD =====
function clearAnswer() {
  selectedAnswer = null;
  $('answer-value').textContent = '—';
  $('answer-display').classList.remove('selected');
  $('btn-submit').disabled = true;
}

function handleNumPress(n) {
  if (n === 'clear') {
    SFX.click();
    clearAnswer();
    return;
  }

  const digit = parseInt(n, 10);

  // Answers now run up to 100, so the pad composes up to three digits and
  // starts over the moment the number would leave the map.
  if (selectedAnswer === null) {
    selectedAnswer = digit;
  } else {
    const next = selectedAnswer * 10 + digit;
    selectedAnswer = next <= 100 ? next : digit;
  }

  SFX.key(digit);
  $('answer-value').textContent = selectedAnswer;
  $('answer-display').classList.add('selected');
  $('btn-submit').disabled = false;
}

// ===== ANSWER HANDLING =====
function handleSubmit() {
  if (selectedAnswer === null) return;
  if (bridge) return submitBridgeStep();

  if (selectedAnswer === currentQ.result) {
    showCorrect(attempts === 0);
  } else {
    attempts++;
    if (attempts >= 3) {
      revealAnswer();
    } else {
      showWrong();
    }
  }
}

function showCelebration(title, sub) {
  const overlay  = $('celebrate-overlay');
  const confetti = $('celebrate-confetti');

  $('celebrate-name').textContent = title || (saveData.playerName + '!');
  document.querySelector('.celebrate-sub').textContent = sub || 'אַתָּה פַּקָּח מְצֻיָּן!';

  confetti.innerHTML = '';
  const colors = ['#00ff41','#ff9500','#00bfff','#ff6b9d','#fff700','#cc44ff'];
  for (let i = 0; i < 32; i++) {
    const p = document.createElement('div');
    p.className = 'cel-cp';
    p.style.left              = (Math.random() * 100) + '%';
    p.style.width             = (6 + Math.random() * 7) + 'px';
    p.style.height            = (6 + Math.random() * 7) + 'px';
    p.style.background        = colors[i % colors.length];
    p.style.borderRadius      = Math.random() > .45 ? '50%' : '2px';
    p.style.animationDelay    = (Math.random() * .35) + 's';
    p.style.animationDuration = (.8 + Math.random() * .9) + 's';
    confetti.appendChild(p);
  }

  overlay.classList.add('active');
  setTimeout(() => {
    overlay.classList.remove('active');
    setTimeout(() => { confetti.innerHTML = ''; }, 300);
  }, 1700);
}

function showCorrect(firstTry) {
  $('btn-submit').disabled = true;
  $('btn-bridge').classList.add('hidden');
  $('bridge-panel').classList.add('hidden');
  bridge = null;

  recordAnswer({ n: attempts, revealed: false });

  correctCount++;
  combo++;
  shiftStats.answered++;
  shiftStats.correct++;
  if (firstTry) shiftStats.firstTry++;
  shiftStats.bestCombo = Math.max(shiftStats.bestCombo, combo);
  shiftStats.hours += firstTry ? HOURS.firstTry : HOURS.correct;
  if (combo >= 3) shiftStats.hours += HOURS.comboStep;
  renderCombo();

  $('radio-bubble').classList.add('correct');
  SFX.correct(combo);

  // A milestone in the streak gets its own call sign; otherwise a normal one.
  const milestone = MESSAGES.combo[combo];
  const line = milestone
    || MESSAGES.correct[Math.floor(Math.random() * MESSAGES.correct.length)];
  setRadio(line, true);
  showCelebration(milestone ? `🔥 ${combo} בָּרָצַף!` : null,
                  milestone ? saveData.playerName + '!' : null);

  if (currentQ.visual === 'planes' && currentQ.type === 'subtraction') animateLanding();
  if (currentQ.visual === 'altitude') {
    const dest = currentQ.destAlt !== undefined ? currentQ.destAlt : landingAltitude(currentQ);
    animateAltitudeChange(dest, altMaxOf(currentQ));
  }

  setTimeout(nextQuestion, 2100);
}

/**
 * One row per answered call, for the parent report.
 *
 * Stays on this machine, like the rest of the save. It is written at the two
 * points a question can end — solved, or handed over — so the log can never
 * drift from what actually happened on screen.
 */
function recordAnswer({ n, revealed }) {
  if (!currentQ) return;
  ANALYTICS.record(saveData, {
    t: Date.now(),
    s: activeStage ? activeStage.id : saveData.currentStage,
    q: currentQ.type,
    a: currentQ.a,
    b: currentQ.b,
    r: currentQ.result,
    n: revealed ? 3 : n,
    l: qLadder,
    v: revealed,
    d: Date.now() - qStarted,
  });
}

/** Where the plane itself ends up, which is not always the number typed:
 *  "how many tens are in 60" is answered 6 but nothing moves to 6. */
function landingAltitude(q) {
  if (q.type === 'tens' || q.type === 'split') return q.a;
  return q.result;
}

function showWrong() {
  const bubble = $('radio-bubble');
  bubble.classList.add('retry');
  setTimeout(() => bubble.classList.remove('retry'), 500);

  combo = 0;
  renderCombo();
  SFX.retry();

  const retryText = MESSAGES.retry[attempts - 1] || MESSAGES.retry[0];
  setRadio(retryText, true);

  const originalText = formatRadioText(currentQ.radioText, currentQ);
  setTimeout(() => {
    if (!bridge) $('radio-text').textContent = originalText;
  }, 1500);

  clearAnswer();

  // A ten-crossing question does not get dots — it gets the ladder, straight
  // away, because dots are exactly what this method replaces.
  if (currentQ.hint === 'bridge') {
    if (attempts === 1) setTimeout(() => { if (currentQ && !bridge) openBridge(false); }, 1600);
    return;
  }
  if (attempts === 1) showHint(1);
  if (attempts === 2) showHint(2);
}

function showHint(level) {
  const hintArea = $('hint-area');
  const hintDots = $('hint-dots');
  const hintText = $('hint-text');
  hintArea.classList.remove('hidden');
  hintDots.innerHTML = '';
  hintText.textContent = '';
  // A hint the child has to scroll to find is not a hint.
  setTimeout(() => hintArea.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 60);

  if (currentQ.hint === 'levels') {
    // Two-digit work. The first hint names the flight level the plane is in;
    // only the second one splits the number all the way, because on the
    // place-value questions that split IS the answer.
    const tens   = Math.floor(currentQ.a / 10) * 10;
    const units  = currentQ.a - tens;
    const isSplit = currentQ.type === 'split' || currentQ.type === 'tens';
    pulseTicks();

    // "How many tens" is not helped by being told which ten you are in — it is
    // helped by being pointed at the marks and asked to count them.
    if (currentQ.type === 'tens') {
      hintText.textContent = level === 1
        ? `כׇּל קַו בַּמַּד הוּא עֲשָׂרָה אַחַת — סְפֹר אֶת הַקַּוִּים עַד ${currentQ.a}`
        : `${currentQ.a} זֶה ${currentQ.a / 10} עֲשָׂרוֹת`;
      return;
    }

    if (level === 1) {
      hintText.textContent = `${currentQ.a} נִמְצָא בְּרָמַת טִיסָה ${tens}`;
      if (!isSplit) renderDecompose(currentQ, true);
      return;
    }

    renderDecompose(currentQ, true);
    hintText.textContent = `${currentQ.a} זֶה ${tens} וְעוֹד ${units}`;
    if (!isSplit && currentQ.b !== undefined) {
      hintText.textContent += (currentQ.b % 10 === 0)
        ? ` — וְ-${currentQ.b} הֵן עֲשָׂרוֹת, אָז רַק הָעֲשָׂרוֹת זָזוֹת`
        : ` — וְ-${currentQ.b} הֵן יְחִידוֹת, אָז רַק הַיְּחִידוֹת זָזוֹת`;
    }
    return;
  }

  if (currentQ.visual === 'altitude') {
    renderDecompose(currentQ, true);
    pulseTicks();
    return;
  }

  // Dots hint for planes visual
  const total   = currentQ.type === 'addition' ? currentQ.a + currentQ.b : currentQ.a;
  const crossed = currentQ.type === 'subtraction' ? currentQ.b : 0;
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'hint-dot' + (i < crossed ? ' crossed' : '');
    dot.textContent = i < crossed ? '✕' : '•';
    hintDots.appendChild(dot);
  }

  if (level >= 2) {
    const separator = document.createElement('div');
    separator.style.width = '100%';
    const separatorIndex = currentQ.type === 'subtraction' ? crossed : currentQ.a;
    hintDots.insertBefore(separator, hintDots.children[separatorIndex] || null);
  }
}

function pulseTicks() {
  document.querySelectorAll('.alt-tick').forEach(t => {
    t.classList.remove('pulse');
    void t.offsetWidth;
    t.classList.add('pulse');
    setTimeout(() => t.classList.remove('pulse'), 2000);
  });
}

function revealAnswer() {
  $('btn-submit').disabled = true;
  $('btn-bridge').classList.add('hidden');
  combo = 0;
  renderCombo();
  recordAnswer({ n: attempts, revealed: true });
  shiftStats.answered++;
  shiftStats.hours += HOURS.revealed;

  SFX.reveal();
  setRadio(fillTemplate(MESSAGES.reveal, { result: currentQ.result }), true);

  if (currentQ.visual === 'altitude') {
    const dest = currentQ.destAlt !== undefined ? currentQ.destAlt : landingAltitude(currentQ);
    animateAltitudeChange(dest, altMaxOf(currentQ));
  }

  setTimeout(nextQuestion, 2800);
}

// ===== תחנת העשרה — הסולם =====
// Three real questions instead of one told answer. The meter moves after each
// step, so the child watches the plane stop at the station he just computed.

function openBridge(isTutorial) {
  if (!currentQ || currentQ.hint !== 'bridge') return;

  const b = bridgeSteps(currentQ);
  bridge = { data: b, idx: 0, tries: 0, tutorial: !!isTutorial };
  qLadder = true;

  $('btn-bridge').classList.add('hidden');
  $('hint-area').classList.add('hidden');
  const panel = $('bridge-panel');
  panel.classList.remove('hidden');
  renderBridgeRungs();
  setTimeout(() => panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 60);

  SFX.whoosh();
  setRadio(b.intro, true);
  clearAnswer();

  setTimeout(() => { if (bridge) askBridgeStep(); }, 2600);
}

function renderBridgeRungs() {
  const rungs = $('bridge-rungs');
  rungs.innerHTML = '';
  const b = bridge.data;
  const labels = [`עַד ${b.stop}`, 'הַשְּׁאָר', 'הַגּוֹבַהּ'];
  labels.forEach((label, i) => {
    const rung = document.createElement('div');
    rung.className = 'bridge-rung'
      + (i <  bridge.idx ? ' done'   : '')
      + (i === bridge.idx ? ' active' : '');
    const val = i < bridge.idx ? bridge.data.steps[i].answer : '?';
    rung.innerHTML = `<span class="rung-label">${label}</span>
                      <span class="rung-value">${val}</span>`;
    rungs.appendChild(rung);
  });
}

function askBridgeStep() {
  const step = bridge.data.steps[bridge.idx];
  bridge.tries = 0;
  renderBridgeRungs();
  clearAnswer();
  setRadio(step.prompt, true);
}

function submitBridgeStep() {
  const step = bridge.data.steps[bridge.idx];
  // The last rung is answered ~2.5s before the question hands over. A child who
  // keeps tapping in that window used to land here with no rung left.
  if (!step) return;

  if (selectedAnswer === step.answer) {
    SFX.correct(1);
    bridge.idx++;
    renderBridgeRungs();

    if (currentQ.visual === 'altitude') {
      animateAltitudeChange(step.alt, altMaxOf(currentQ));
    }

    if (bridge.idx >= bridge.data.steps.length) {
      // The last rung IS the answer to the original call.
      setRadio(bridge.data.done, true);
      setTimeout(() => {
        if (!bridge) return;
        bridge = null;
        // Reaching it on the ladder counts as correct — but never as first-try,
        // so "answered it alone" stays a real distinction.
        showCorrect(false);
      }, 2600);
      clearAnswer();
      $('btn-submit').disabled = true;
      return;
    }

    setTimeout(() => { if (bridge) askBridgeStep(); }, 900);
    clearAnswer();
    return;
  }

  // Wrong rung. Nudge once, then hand it over and keep climbing — a child stuck
  // on rung 1 must never be stuck on the whole method.
  bridge.tries++;
  SFX.retry();
  clearAnswer();

  if (bridge.tries >= 2) {
    $('bridge-rungs').children[bridge.idx].classList.add('revealed');
    setRadio(`הַתְּשׁוּבָה כָּאן הִיא ${step.answer}. מַמְשִׁיכִים!`, false);
    setTimeout(() => {
      if (!bridge) return;
      selectedAnswer = step.answer;
      submitBridgeStep();
    }, 1800);
    return;
  }

  const bubble = $('radio-bubble');
  bubble.classList.add('retry');
  setTimeout(() => bubble.classList.remove('retry'), 500);
  setRadio(MESSAGES.retry[0], true);
  setTimeout(() => { if (bridge) setRadio(step.prompt, false); }, 1600);
}

// ===== ANIMATIONS =====
function animateLanding() {
  const dots = document.querySelectorAll('.plane-dot:not(.landed)');
  if (dots.length > 0) {
    dots[dots.length - 1].classList.add('landed');
    SFX.land();
  }
}

function animateAltitudeChange(targetAlt, max) {
  setAltitude(targetAlt, max, true);
  highlightLevel(targetAlt, max);

  // Stopping exactly on a ten is the thing being taught — make it visible.
  if (targetAlt % 10 === 0 && targetAlt > 0) {
    document.querySelectorAll('.alt-tick').forEach(t => {
      if (Number(t.dataset.value) !== targetAlt) return;
      t.classList.remove('pulse');
      void t.offsetWidth;
      t.classList.add('pulse');
      setTimeout(() => t.classList.remove('pulse'), 2000);
    });
  }
}

// ===== SHIFT FLOW =====
function nextQuestion() {
  shiftIndex++;
  if (shiftIndex >= QUESTIONS_PER_SHIFT) {
    endShift();
    return;
  }
  loadQuestion(shiftQuestions[shiftIndex]);
}

/** Weighted pick, so a legendary card stays something that happens to you. */
function pickReward(uncollected) {
  const bigLeagues = saveData.currentStage >= 8 || (saveData.streakDays || 0) >= 3;
  let pool = uncollected.filter(p => bigLeagues || p.rarity !== 'legendary');
  if (!pool.length) pool = uncollected;

  const weight = p => (RARITY[p.rarity || 'normal'] || RARITY.normal).weight;
  const total  = pool.reduce((s, p) => s + weight(p), 0);
  let roll = Math.random() * total;
  for (const p of pool) {
    roll -= weight(p);
    if (roll <= 0) return p;
  }
  return pool[pool.length - 1];
}

function endShift() {
  shiftStats.hours += HOURS.shift;

  saveData.shiftsCompleted = (saveData.shiftsCompleted || 0) + 1;
  saveData.bestCombo = Math.max(saveData.bestCombo || 0, shiftStats.bestCombo);

  // Today's mission, checked against what actually happened this shift.
  const mission = PROGRESS.currentMission(saveData);
  let missionJustDone = false;
  if (!mission.done && mission.check(shiftStats)) {
    PROGRESS.markMissionDone(saveData, mission.day);
    shiftStats.hours += HOURS.mission;
    missionJustDone = true;
  }

  PROGRESS.addFlightHours(saveData, shiftStats.hours);

  let rankUp = false;

  // Practice runs never move the map — they are there to be safe.
  if (!practiceMode) {
    saveData.currentStageShifts = (saveData.currentStageShifts || 0) + 1;
    const shouldAdvance = correctCount >= 6 && (saveData.currentStageShifts % 2 === 0);

    if (shouldAdvance && saveData.currentStage < PROGRESS.maxStage()) {
      saveData.currentStageShifts = 0;
      const oldRank = PROGRESS.getRankForStage(saveData.currentStage).name;
      PROGRESS.completeStage(saveData, saveData.currentStage);
      rankUp = PROGRESS.getRankForStage(saveData.currentStage).name !== oldRank;
    } else if (shouldAdvance) {
      // Already at the last port: mark it done, stay there.
      saveData.currentStageShifts = 0;
      PROGRESS.completeStage(saveData, saveData.currentStage);
    }
  }

  // Award a random plane not yet collected
  const uncollected = PLANE_TYPES.filter(p => !saveData.planesCollected.includes(p.id));
  const newPlane = uncollected.length ? pickReward(uncollected) : null;
  if (newPlane) PROGRESS.addPlane(saveData, newPlane.id);

  PROGRESS.save(saveData);

  // Push the shift up before the report is even read. If it fails, nothing
  // happens — the next launch will carry it.
  SYNC.syncInBackground(saveData);

  const done = () => showReport(correctCount, newPlane, rankUp, missionJustDone);
  if (newPlane) startLandingGame(newPlane, done); else done();
}

// ===== SHIFT REPORT =====
function showReport(correct, newPlane, rankUp, missionJustDone) {
  const planesEl = $('report-planes');
  const msgEl    = $('report-msg');
  const planeEl  = $('report-new-plane');
  const rankEl   = $('report-rank-up');
  const btnCont  = $('btn-continue');

  planesEl.innerHTML = '';
  const displayPlanes = Math.max(correct, 1);
  for (let i = 0; i < displayPlanes; i++) {
    const span = document.createElement('span');
    span.textContent = '✈️';
    planesEl.appendChild(span);
  }

  let msg;
  if (correct === 0) {
    msg = `מִשְׁמֶרֶת טוֹבָה, ${saveData.playerName}! הַמְשֵׁךְ לְהִתְאַמֵּן — אַתָּה הוֹלֵךְ לְהַצְלִיחַ!`;
  } else {
    const msgs = [
      `הַיּוֹם נָחֲתוּ בְּבִטָּחָה ${correct} מְטוֹסִים. כׇּל הַכָּבוֹד, ${saveData.playerName}!`,
      `מִשְׁמֶרֶת מְצֻיֶּנֶת! ${correct} מְטוֹסִים נָחֲתוּ בְּשָׁלוֹם תּוֹדָה לְךָ!`,
      `עֲבוֹדָה טוֹבָה, פַּקָּח! ${correct} נְחִיתוֹת בְּטוּחוֹת הַיּוֹם.`,
    ];
    msg = msgs[Math.floor(Math.random() * msgs.length)];
  }
  msgEl.textContent = msg;

  // Numbers that only ever go up.
  const stats = $('report-stats');
  const rows = [
    `⏱️ +${shiftStats.hours} שְׁעוֹת טִיסָה`,
    `🔥 רֶצֶף הַשִּׂיא בַּמִּשְׁמֶרֶת: ${shiftStats.bestCombo}`,
  ];
  if (saveData.streakDays > 1) rows.push(`📅 ${saveData.streakDays} יָמִים בָּרָצַף`);
  if (missionJustDone) rows.push('🎯 מְשִׂימַת הַיּוֹם הֻשְׁלְמָה!');
  stats.innerHTML = rows.map(r => `<span>${r}</span>`).join('');

  if (newPlane) {
    const rar = RARITY[newPlane.rarity || 'normal'] || RARITY.normal;
    planeEl.textContent = `${rar.label}: ${newPlane.emoji} ${newPlane.name}`;
    planeEl.className = 'new-plane-badge ' + rar.cls;
    planeEl.classList.remove('hidden');
  } else {
    planeEl.classList.add('hidden');
  }

  if (rankUp) {
    const rank = PROGRESS.getRankForStage(saveData.currentStage);
    rankEl.textContent = `קִידּוּם! דַּרְגָּה חֲדָשָׁה: ${rank.emoji} ${rank.name}`;
    rankEl.classList.remove('hidden');
    SFX.rankUp();
  } else {
    rankEl.classList.add('hidden');
  }

  btnCont.onclick = () => {
    SFX.click();
    showScreen('screen-entry');
    initEntry();
  };

  showScreen('screen-report');
}

// ===== ALBUM SCREEN =====
function showAlbum() {
  const grid = $('album-grid');
  grid.innerHTML = '';

  PLANE_TYPES.forEach(p => {
    const slot = document.createElement('div');
    const collected = saveData.planesCollected.includes(p.id);
    const rar = RARITY[p.rarity || 'normal'] || RARITY.normal;

    slot.className = 'album-slot'
      + (collected ? ' collected' : ' empty')
      + (collected && rar.cls ? ' ' + rar.cls : '');
    slot.textContent = collected ? p.emoji : '❓';
    slot.title = collected ? p.name : '???';

    if (collected) slot.addEventListener('click', () => openPlaneDetail(p));
    grid.appendChild(slot);
  });

  $('album-count').textContent =
    `${saveData.planesCollected.length} מִתּוֹךְ ${PLANE_TYPES.length}`;

  $('btn-album-back').onclick = () => {
    SFX.click();
    showScreen('screen-entry');
    initEntry();
  };

  showScreen('screen-album');
}

// ===== PLANE DETAIL POPUP =====
function openPlaneDetail(plane) {
  const existing = $('plane-modal');
  if (existing) existing.remove();

  const rar = RARITY[plane.rarity || 'normal'] || RARITY.normal;
  if (rar.cls) SFX.rare(); else SFX.click();

  const modal = document.createElement('div');
  modal.id = 'plane-modal';
  modal.className = 'plane-modal' + (rar.cls ? ' ' + rar.cls : '');

  // A collector's card: the plane on the front, the fact on the back, and it
  // turns over when you touch it.
  modal.innerHTML = `
    <div class="plane-modal-card">
      <div class="plane-card" id="plane-card">
        <div class="plane-card-inner">
          <div class="plane-card-face front">
            <span class="plane-modal-emoji">${plane.emoji}</span>
            <h3 class="plane-modal-name">${plane.name}</h3>
            ${rar.cls ? `<span class="plane-modal-gold-badge">${rar.label}</span>` : ''}
            <span class="plane-card-hint">הַקֵּשׁ כְּדֵי לְהָפֹךְ אֶת הַכַּרְטִיס</span>
          </div>
          <div class="plane-card-face back">
            <h3 class="plane-modal-name">${plane.name}</h3>
            <p class="plane-modal-fact">${plane.funFact}</p>
            <span class="plane-card-hint">הַקֵּשׁ כְּדֵי לַחֲזֹר</span>
          </div>
        </div>
      </div>
      <button class="plane-modal-close btn-primary">סָגוּר ✕</button>
    </div>
  `;

  modal.addEventListener('click', e => {
    if (e.target === modal || e.target.classList.contains('plane-modal-close')) {
      modal.classList.add('closing');
      setTimeout(() => modal.remove(), 250);
      return;
    }
    if (e.target.closest('.plane-card')) {
      SFX.click();
      $('plane-card').classList.toggle('flipped');
    }
  });

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('open'));
}

// ===== LANDING MINI-GAME =====
// Two implementations of one game. The 3D approach is the one the child gets
// when the machine can draw it; the flat version stays because a game that
// only runs on a good GPU is a game that sometimes does not run.
let _lg = null; // 2D landing game state
let _lg3 = null; // 3D landing world

function startLandingGame(plane, onComplete) {
  return use3D ? startLanding3D(plane, onComplete)
               : startLanding2D(plane, onComplete);
}

/** Everything after the wheels touch: identical in both versions. */
function landingSuccessUI(plane, rar, onDone) {
  const isRare = !!rar.cls;

  $('landing-msg').textContent = isRare
    ? '✨ נְחִיתַת זָהָב מוּשְׁלֶמֶת! אַתָּה מַדְהִים! ✨'
    : '🎉 נְחִיתָה מוּשְׁלֶמֶת! כׇּל הַכָּבוֹד!';

  SPEECH.speak(isRare ? MESSAGES.landing.gold : MESSAGES.landing.normal);
  SFX.land();
  if (isRare) setTimeout(() => SFX.rare(), 400);

  const overlay = $('celebrate-overlay');
  const confettiEl = $('celebrate-confetti');
  $('celebrate-name').textContent = plane.name;
  document.querySelector('.celebrate-sub').textContent = isRare ? rar.label : 'מָטוֹס חָדָשׁ!';
  confettiEl.innerHTML = '';
  const colors = ['#00ff41','#ffd700','#00bfff','#ff6b9d','#fff700','#cc44ff'];
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'cel-cp';
    p.style.cssText = `left:${Math.random()*100}%;width:${7+Math.random()*6}px;height:${7+Math.random()*6}px;background:${colors[i%colors.length]};border-radius:${Math.random()>.45?'50%':'3px'};animation-delay:${Math.random()*.3}s;animation-duration:${.9+Math.random()*.8}s`;
    confettiEl.appendChild(p);
  }
  overlay.classList.add('active');
  setTimeout(() => {
    overlay.classList.remove('active');
    confettiEl.innerHTML = '';
  }, 1800);

  setTimeout(() => {
    const btn = $('btn-land');
    btn.disabled = false;
    btn.textContent = '✅ לְדוּחַ הַמִּשְׁמֶרֶת';
    btn.onclick = onDone;
  }, 2000);
}

/** Title, message and button — shared setup before either version starts. */
function landingChrome(plane, rar) {
  $('landing-title').textContent = (rar.cls ? '✨ ' : '✈ ') + `נְחִית אֶת ${plane.name}!`;
  $('landing-msg').textContent =
    'לְחַץ עַל הַכַּפְתּוֹר כַּאֲשֶׁר הַמָּטוֹס מֵעַל הַמַּסְלוּל הַמֶּאִיר!';
  const btn = $('btn-land');
  btn.textContent = '✈ לְחַץ לִנְחִיתָה!';
  btn.disabled = false;
  btn.className = 'btn-land' + (rar.cls ? ' ' + rar.cls : '');
  return btn;
}

// ===== 3D LANDING =====
function startLanding3D(plane, onComplete) {
  const rar = RARITY[plane.rarity || 'normal'] || RARITY.normal;
  const sky = $('landing-sky');

  const btn = landingChrome(plane, rar);
  sky.classList.add('is3d');            // hides the flat sky, ground and runway
  showScreen('screen-landing');
  SFX.whoosh();

  const finish = () => {
    sky.classList.remove('is3d');
    SCENE3D.endLanding();
    _lg3 = null;
    onComplete();
  };

  // The canvas needs the container's real size, which only exists once the
  // screen is on screen.
  requestAnimationFrame(() => {
    _lg3 = SCENE3D.startLanding(plane, sky, {
      onTouchdown: () => landingSuccessUI(plane, rar, finish),
    });

    // WebGL can still fail at context-creation time on a machine that claimed
    // to support it. Falling back beats a black rectangle.
    if (!_lg3) { sky.classList.remove('is3d'); startLanding2D(plane, onComplete); return; }

    btn.onclick = () => {
      const outcome = _lg3.press();
      if (outcome === 'landing') {
        btn.disabled = true;
        $('landing-msg').textContent = '...יוֹרְדִים לִנְחִיתָה 🛬';
        SFX.whoosh();
      } else if (outcome === 'goaround') {
        SFX.retry();
        $('landing-msg').textContent = 'עוֹלִים לְסִיבוּב נוֹסָף — הַפַּעַם תַּצְלִיחַ!';
      }
    };
  });
}

// ===== 2D LANDING (fallback) =====
function startLanding2D(plane, onComplete) {
  const rar = RARITY[plane.rarity || 'normal'] || RARITY.normal;

  _lg = {
    plane, onComplete, rar,
    x:        -15,      // plane left position, % of sky width. starts off-screen
    vx:       0.42,     // % per frame (≈0.42 * 60fps = 25% per second → 5s loop)
    y:        20,       // plane top position, % of sky height
    phase:    'flying', // 'flying' | 'descending' | 'landed'
    attempts: 0,
    raf:      null,
    ZONE_START: 22,     // landing zone left edge, % of sky width
    ZONE_END:   72,     // landing zone right edge — generous 50% window
    RUNWAY_Y:   80,     // filled in after screen shows (% of sky height)
  };

  $('landing-plane').textContent = plane.emoji;
  landingChrome(plane, rar).onclick = _attemptLanding;
  $('landing-zone').className = 'landing-zone' + (rar.cls ? ' ' + rar.cls : '');

  showScreen('screen-landing');
  SFX.whoosh();

  requestAnimationFrame(() => {
    const skyEl   = $('landing-sky');
    const planeEl = $('landing-plane');
    const skyH    = skyEl.offsetHeight || 300;
    const groundH = 65;
    const planeH  = planeEl.offsetHeight || 50;
    _lg.RUNWAY_Y  = ((skyH - groundH - planeH + 4) / skyH) * 100;

    planeEl.style.cssText = `left:${_lg.x}%;top:${_lg.y}%`;
    _lg.raf = requestAnimationFrame(_landingLoop);
  });
}

function _landingLoop() {
  if (!_lg) return;
  const planeEl = $('landing-plane');

  if (_lg.phase === 'flying') {
    _lg.x += _lg.vx;
    if (_lg.x > 112) _lg.x = -15;        // loop back
    planeEl.style.left = _lg.x + '%';

  } else if (_lg.phase === 'descending') {
    _lg.y += 1.6;                          // descend ~1.6% of sky per frame
    planeEl.style.top = _lg.y + '%';
    if (_lg.y >= _lg.RUNWAY_Y) {
      planeEl.style.top = _lg.RUNWAY_Y + '%';
      _lg.phase = 'landed';
      _onLandingSuccess();
      return;
    }
  }

  _lg.raf = requestAnimationFrame(_landingLoop);
}

function _attemptLanding() {
  if (!_lg || _lg.phase !== 'flying') return;

  const inZone = _lg.x >= _lg.ZONE_START && _lg.x <= _lg.ZONE_END;

  if (inZone || _lg.attempts >= 2) {
    if (!inZone) {
      _lg.x = (_lg.ZONE_START + _lg.ZONE_END) / 2;
      $('landing-plane').style.left = _lg.x + '%';
    }
    _lg.phase = 'descending';
    $('btn-land').disabled = true;
    $('landing-msg').textContent = '...יוֹרְדִים לִנְחִיתָה 🛬';
    SFX.whoosh();

  } else {
    _lg.attempts++;
    SFX.retry();
    const msgs = [
      'כִּמְעַט! לְחַץ כַּאֲשֶׁר הַמָּטוֹס מֵעַל הַמַּסְלוּל הַיָּרֹק!',
      'עוֹד פַּעַם — הַפַּעַם תַּצְלִיחַ!',
    ];
    $('landing-msg').textContent = msgs[_lg.attempts - 1];

    const p = $('landing-plane');
    p.classList.remove('lg-wobble');
    void p.offsetWidth; // reflow
    p.classList.add('lg-wobble');
    setTimeout(() => p && p.classList.remove('lg-wobble'), 500);
  }
}

function _onLandingSuccess() {
  cancelAnimationFrame(_lg.raf);
  _lg.raf = null;

  const planeEl = $('landing-plane');
  planeEl.classList.add('lg-landed');

  landingSuccessUI(_lg.plane, _lg.rar, () => {
    planeEl.className = 'landing-plane-el';
    planeEl.style.cssText = '';
    const { onComplete } = _lg;
    _lg = null;
    onComplete();
  });
}

// ===== MAP SCREEN =====
// Unlocked ports are tappable. Going back to an easy port is not a punishment
// and should not need permission — it is how a child rebuilds confidence.
function showMap() {
  const container = $('map-stages');
  container.innerHTML = '';

  CURRICULUM.stages.forEach(stage => {
    const completed = saveData.stagesCompleted.includes(stage.id);
    const current   = !completed && (stage.id === saveData.currentStage);
    const locked    = stage.id > saveData.currentStage;

    const row = document.createElement('div');
    row.className = 'map-stage' +
      (completed ? ' completed' : '') +
      (current   ? ' current'   : '') +
      (locked    ? ' locked'    : '');

    const icon = document.createElement('span');
    icon.className = 'map-stage-icon';
    icon.textContent = completed ? '✅' : (current ? '👉' : '🔒');

    const name = document.createElement('span');
    name.className = 'map-stage-name';
    name.textContent = `נָמֵל ${stage.id}: ${stage.title}`;

    const status = document.createElement('span');
    status.className = 'map-stage-status';
    status.textContent = completed ? 'תַּרְגֵּל ▶' : (current ? 'פָּעִיל' : 'נָעוּל');

    row.append(icon, name, status);

    if (!locked) {
      row.classList.add('playable');
      row.onclick = () => {
        SFX.whoosh();
        startShift(stage.id, stage.id !== saveData.currentStage);
      };
    }
    container.appendChild(row);
  });

  $('btn-map-back').onclick = () => {
    SFX.click();
    showScreen('screen-entry');
    initEntry();
  };

  showScreen('screen-map');
}

// ===== PARENT REPORT =====
// Everything below reads the log; nothing here writes to it, and nothing leaves
// the machine unless the parent presses export.

const SKILL_STATUS = {
  solid:           { label: 'שׁוֹלֵט',            cls: 'solid'  },
  'accurate-slow': { label: 'נָכוֹן, לֹא מָהִיר',  cls: 'slow'   },
  working:         { label: 'בַּדֶּרֶךְ',          cls: 'working' },
  weak:            { label: 'דּוֹרֵשׁ חִיזּוּק',   cls: 'weak'   },
  thin:            { label: 'מְעַט נְתוּנִים',     cls: 'thin'   },
  unseen:          { label: 'עוֹד לֹא הִגִּיעַ',   cls: 'thin'   },
};

function showParents(notice) {
  saveData = PROGRESS.load();
  const rep = ANALYTICS.analyse(saveData.log);

  const fmtDate = t => t ? new Date(t).toLocaleDateString('he-IL') : '—';
  $('parents-sub').textContent = rep.total
    ? `${saveData.playerName || 'הַפַּקָּח'} · ${rep.total} תַּרְגִּילִים בְּ-${rep.days} יְמֵי מִשְׂחָק · ${fmtDate(rep.from)}–${fmtDate(rep.to)}`
    : 'עוֹד לֹא נֶאֱסְפוּ נְתוּנִים.';

  // Headline numbers.
  const cards = [
    ['נָכוֹן בַּנִּסָּיוֹן הָרִאשׁוֹן', rep.total ? rep.firstTryPct + '%' : '—'],
    ['זְמַן חֲצִיוֹנִי לִתְשׁוּבָה',    rep.total ? rep.medianSeconds + ' שְׁנִיּוֹת' : '—'],
    ['נֶחְשְׂפָה תְּשׁוּבָה',           rep.total ? rep.revealPct + '%' : '—'],
    ['נָמֵל נוֹכְחִי',                  `${saveData.currentStage} מִתּוֹךְ ${PROGRESS.maxStage()}`],
  ];
  $('parents-summary').innerHTML = cards.map(([k, v]) =>
    `<div class="pcard"><span class="pcard-v">${v}</span><span class="pcard-k">${k}</span></div>`).join('');

  // Skills, in teaching order, skipping what he has not met yet.
  const seen = rep.skills.filter(s => s.samples > 0);
  $('parents-skills').innerHTML = seen.length ? seen.map(s => {
    const st = SKILL_STATUS[s.status] || SKILL_STATUS.thin;
    const bar = Math.max(2, s.recentPct);
    return `<div class="pskill">
        <div class="pskill-head">
          <span class="pskill-name">${s.label}</span>
          <span class="pskill-status ${st.cls}">${st.label}</span>
        </div>
        <div class="pskill-bar"><div class="pskill-fill ${st.cls}" style="width:${bar}%"></div></div>
        <div class="pskill-meta">${s.recentPct}% לְאַחֲרוֹנָה · ${s.samples} תַּרְגִּילִים · ${s.seconds} שְׁנִיּוֹת${
          s.ladderPct ? ` · סֻלָּם בְּ-${s.ladderPct}%` : ''}</div>
      </div>`;
  }).join('') : '<p class="parents-empty">אֵין עֲדַיִין תַּרְגִּילִים מֻקְלָטִים.</p>';

  $('parents-recs').innerHTML = rep.recommendations.map(r =>
    `<div class="prec p${r.priority}"><strong>${r.title}</strong><span>${r.detail}</span></div>`).join('');

  $('parents-hardest').innerHTML = rep.hardest.length
    ? `<h3 class="parents-h3">תַּרְגִּילִים שֶׁחוֹזְרִים וְנִתְקָעִים</h3>
       <div class="phard">${rep.hardest.map(f =>
         `<span class="phard-item">${f.fact}<em>${f.missPct}%</em></span>`).join('')}</div>`
    : '';

  // A notice survives the re-render that follows an import — otherwise the
  // confirmation the parent needs to read vanishes the moment it appears.
  $('parents-import-msg').textContent = notice || '';
  renderSyncBox();
  renderOfflineBox();
  $('btn-parents-export').onclick = () => exportReport(rep);
  $('btn-parents-import').onclick = () => $('parents-file').click();
  $('parents-file').onchange = e => importSave(e.target.files[0]);
  $('btn-parents-copy').onclick   = () => copyReport(rep);
  $('btn-parents-back').onclick   = () => { showScreen('screen-entry'); initEntry(); };

  showScreen('screen-parents');
}

/** The raw log as a file — this is what gets handed to someone who can dig. */
function exportReport() {
  const data = ANALYTICS.exportPayload(saveData);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `tower-control-${PROGRESS.today()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// ===== OFFLINE =====
async function renderOfflineBox() {
  const state = $('offline-state');
  const btnDl = $('btn-offline-download');
  const bar   = $('offline-bar');
  const fill  = $('offline-fill');

  if (!OFFLINE.possible()) {
    // Opened from a disk: already offline in the only sense that matters.
    state.textContent = 'הַמִּשְׂחָק רָץ מֵהַקֹּבֶץ הַמְּקוֹמִי — הוּא כְּבָר עוֹבֵד בְּלִי אִינְטֶרְנֶט.';
    btnDl.disabled = true;
    $('btn-offline-reset').disabled = true;
    return;
  }

  const total  = OFFLINE.audioUrls().length;
  const cached = await OFFLINE.cachedCount();

  const describe = () => {
    if (cached === null) return 'מִתְקִין... נַסֵּה שׁוּב בְּעוֹד רֶגַע.';
    if (cached >= total) return `כׇּל ${total} קִטְעֵי הַהַקְרָאָה שְׁמוּרִים — הַמִּשְׂחָק עוֹבֵד מָלֵא גַּם בְּלִי רֶשֶׁת.`;
    if (cached === 0)    return `הַמִּשְׂחָק עַצְמוֹ כְּבָר עוֹבֵד בְּלִי רֶשֶׁת. הַהַקְרָאָה בְּקוֹל תִּשָּׁמֵר תּוֹךְ כְּדֵי מִשְׂחָק, אוֹ בְּבַת אַחַת כָּאן (16 מֶגָה).`;
    return `${cached} מִתּוֹךְ ${total} קִטְעֵי הַקְרָאָה שְׁמוּרִים.`;
  };
  state.textContent = describe();

  btnDl.onclick = async () => {
    btnDl.disabled = true;
    bar.classList.remove('hidden');
    const res = await OFFLINE.downloadAll((done, all) => {
      fill.style.width = Math.round((done / all) * 100) + '%';
      state.textContent = `מוֹרִיד ${done} מִתּוֹךְ ${all}...`;
    });
    btnDl.disabled = false;
    if (res.ok) {
      SFX.rare();
      state.textContent = res.failed
        ? `הֻשְׁלַם — ${res.total - res.failed} מִתּוֹךְ ${res.total}. נַסֵּה שׁוּב לְהַשְׁלִים אֶת הַשְּׁאָר.`
        : `הֻשְׁלַם! כׇּל ${res.total} הַקִּטְעִים שְׁמוּרִים בַּמַּכְשִׁיר.`;
    } else {
      state.textContent = 'הַהוֹרָדָה לֹא הִתְחִילָה — רַעֲנֵן אֶת הַדַּף וְנַסֵּה שׁוּב.';
    }
  };

  $('btn-offline-reset').onclick = () => {
    if (confirm('לְנַקּוֹת אֶת הַמַּטְמוֹן וְלִטְעֹן מֵחָדָשׁ? הַהִתְקַדְּמוּת וְהַמְּטוֹסִים לֹא יִפָּגְעוּ.')) {
      OFFLINE.reset();
    }
  };
}

// ===== SYNC =====
function renderSyncBox() {
  const cfg = SYNC.config();
  $('sync-url').value  = cfg.url  || '';
  $('sync-code').value = cfg.code || '';

  const status = $('sync-status');
  if (!SYNC.enabled()) {
    status.className = 'sync-status';
    status.textContent = 'לֹא מֻגְדָּר — הַמִּשְׂחָק עוֹבֵד רָגִיל, פָּשׁוּט בְּלִי סִנְכְּרוּן.';
  } else if (cfg.lastError) {
    status.className = 'sync-status bad';
    status.textContent = 'הַסִּנְכְּרוּן הָאַחֲרוֹן נִכְשַׁל: ' + cfg.lastError;
  } else if (cfg.lastAt) {
    status.className = 'sync-status good';
    status.textContent = 'סֻנְכְרַן לְאַחֲרוֹנָה: ' + new Date(cfg.lastAt).toLocaleString('he-IL');
  } else {
    status.className = 'sync-status';
    status.textContent = 'מֻגְדָּר. לְחַץ "סַנְכְּרֵן עַכְשָׁו".';
  }

  $('btn-sync-new').onclick = () => {
    $('sync-code').value = SYNC.makeCode();
    SFX.click();
  };

  const say = (text, kind) => {
    status.className = 'sync-status' + (kind ? ' ' + kind : '');
    status.textContent = text;
  };

  /**
   * Read the two fields, validate, store.
   *
   * Returns a reason string when it cannot, never a silent false: a settings
   * box that does nothing and says nothing is indistinguishable from a broken
   * one, and that is exactly how this button failed the first time it was used.
   */
  const commitFields = () => {
    const url  = $('sync-url').value.trim();
    const code = $('sync-code').value.trim().toUpperCase();

    if (!url && !code) return 'מַלֵּא אֶת כְּתֹבֶת הַשֶּׁרֶת וְאֶת הַקּוֹד — שְׁנֵיהֶם רֵיקִים.';
    if (!url)  return 'חֲסֵרָה כְּתֹבֶת הַשֶּׁרֶת.';
    if (!code) return 'חָסֵר קוֹד — לְחַץ "צוֹר קוֹד", אוֹ הַקְלֵד אֶת זֶה שֶׁל הַמַּכְשִׁיר הָאַחֵר.';
    if (!SYNC.validUrl(url))   return 'הַכְּתֹבֶת חַיֶּבֶת לְהַתְחִיל בְּ-https:// — כְּפִי שֶׁהִיא כְּתוּבָה עַכְשָׁו הַדַּפְדְּפָן יַחְסֹם אוֹתָהּ.';
    if (!SYNC.validCode(code)) return 'קוֹד לֹא תָּקִין — לְפָחוֹת 16 תָּוִים, אוֹתִיּוֹת וְסִפְרוֹת בִּלְבַד.';

    SYNC.setConfig({ url, code, lastError: '' });
    $('sync-code').value = code;
    return null;
  };

  $('btn-sync-save').onclick = () => {
    const problem = commitFields();
    if (problem) { say(problem, 'bad'); return; }
    say('נִשְׁמַר. לְחַץ "סַנְכְּרֵן עַכְשָׁו".', 'good');
  };

  $('btn-sync-now').onclick = async () => {
    // Always take what is on screen. Requiring "save" first, and then doing
    // nothing when it had not been pressed, is what made this button look dead.
    const problem = commitFields();
    if (problem) { say(problem, 'bad'); return; }

    const btn = $('btn-sync-now');
    btn.disabled = true;
    say('מְסַנְכְרֵן...');

    let res;
    try {
      res = await SYNC.sync(PROGRESS.load());
    } catch (err) {
      res = { ok: false, reason: err && err.message ? err.message : 'שְׁגִיאָה לֹא צְפוּיָה' };
    }
    btn.disabled = false;

    if (res.ok) {
      PROGRESS.save(res.save);
      saveData = res.save;
      SFX.rare();
      showParents(`סֻנְכְרַן — ${res.gained > 0 ? res.gained + ' תַּרְגִּילִים חֲדָשִׁים מִמַּכְשִׁיר אַחֵר' : 'הַכֹּל כְּבָר מְעֻדְכָּן'}.`);
      return;
    }

    say(explainSyncFailure(res.reason), 'bad');
  };
}

/**
 * Turn a fetch failure into something a parent can act on.
 *
 * "Failed to fetch" is what the browser says for a blocked origin, a dead host
 * and a typo alike — useless on its own. The wording below names the two or
 * three things it is actually likely to be.
 */
function explainSyncFailure(reason) {
  const raw = String(reason || '');
  if (/failed to fetch|networkerror|load failed/i.test(raw)) {
    return 'לֹא הִצְלַחְתִּי לְהַגִּיעַ לַשֶּׁרֶת. בְּדֹק שֶׁהַכְּתֹבֶת נְכוֹנָה, שֶׁיֵּשׁ אִינְטֶרְנֶט, ' +
           'וְשֶׁהִדְבַּקְתָּ אֶת הַכְּתֹבֶת בִּמְלוֹאָהּ. (' + raw + ')';
  }
  if (/timeout|abort/i.test(raw)) {
    return 'הַשֶּׁרֶת לֹא עָנָה בִּזְמַן. נַסֵּה שׁוּב בְּעוֹד רֶגַע.';
  }
  if (/bad code/i.test(raw)) {
    return 'הַשֶּׁרֶת דָּחָה אֶת הַקּוֹד. צוֹר קוֹד חָדָשׁ וְהַשְׁתֵּמַשׁ בְּאוֹתוֹ אֶחָד בְּכׇל מַכְשִׁיר.';
  }
  if (/HTTP 404/i.test(raw)) {
    return 'הַכְּתֹבֶת מַחְזִירָה 404 — כְּנִרְאֶה חָסֵר חֵלֶק מִמֶּנָּה, אוֹ שֶׁהַשֶּׁרֶת לֹא בַּמָּקוֹם הַזֶּה.';
  }
  if (/not a game save/i.test(raw)) {
    return 'הַשֶּׁרֶת דָּחָה אֶת הַשְּׁמִירָה. נַסֵּה לְשַׂחֵק מִשְׁמֶרֶת אַחַת וְאָז לְסַנְכְרֵן.';
  }
  return 'לֹא הִצְלִיחַ: ' + raw;
}

/**
 * Restore — or fold in another device's play.
 *
 * Always a merge, never an overwrite. A parent moving a save between a laptop
 * and a tablet must not have to work out which file is "the good one": both
 * are, and the union of them is the child's real history.
 */
function importSave(file) {
  if (!file) return;
  const msg = t => { $('parents-import-msg').textContent = t; };
  const reader = new FileReader();

  reader.onerror = () => msg('לֹא הִצְלַחְתִּי לִקְרֹא אֶת הַקֹּבֶץ.');
  reader.onload = () => {
    let payload;
    try {
      payload = JSON.parse(reader.result);
    } catch (e) {
      msg('הַקֹּבֶץ אֵינוֹ קֹבֶץ גִּבּוּי תָּקִין.');
      return;
    }

    const incoming = payload.save || (Array.isArray(payload.log) ? payload : null);
    if (!incoming || typeof incoming !== 'object') {
      msg('הַקֹּבֶץ אֵינוֹ קֹבֶץ גִּבּוּי שֶׁל הַמִּשְׂחָק.');
      return;
    }

    // Two different children's saves must never be silently welded together.
    const local = PROGRESS.load();
    if (local.playerName && incoming.playerName && local.playerName !== incoming.playerName) {
      const ok = confirm(`הַגִּבּוּי שַׁיָּךְ לְ"${incoming.playerName}" וְהַשְּׁמִירָה כָּאן לְ"${local.playerName}". לְאַחֵד בְּכׇל זֹאת?`);
      if (!ok) { msg('הַשִּׁחְזוּר בֻּטַּל.'); return; }
    }

    const before = (local.log || []).length;
    const merged = PROGRESS.merge(local, incoming);
    PROGRESS.save(merged);
    saveData = merged;

    const added = (merged.log || []).length - before;
    const notice = `אֻחַד בְּהַצְלָחָה — ${added} תַּרְגִּילִים חֲדָשִׁים, נָמֵל ${merged.currentStage}, ` +
                   `${merged.planesCollected.length} מְטוֹסִים.`;
    msg(notice);
    SFX.rare();
    setTimeout(() => showParents(notice), 1200);
  };

  reader.readAsText(file);
}

/** The same report as plain text, for pasting into a message. */
function reportText(rep) {
  const lines = [];
  lines.push(`מגדל הפיקוח — דוח ל${saveData.playerName || 'פקח'}`);
  lines.push(`${rep.total} תרגילים ב-${rep.days} ימי משחק · נמל ${saveData.currentStage}/${PROGRESS.maxStage()}`);
  lines.push(`נכון בניסיון ראשון: ${rep.firstTryPct}% · זמן חציוני: ${rep.medianSeconds}ש · נחשפה תשובה: ${rep.revealPct}%`);
  if (rep.trend) lines.push(`מגמה: ${rep.trend.early}% ← ${rep.trend.late}%`);
  lines.push('');
  lines.push('מיומנויות:');
  rep.skills.filter(s => s.samples > 0).forEach(s => {
    const st = (SKILL_STATUS[s.status] || SKILL_STATUS.thin).label;
    lines.push(`  ${s.label} — ${st} · ${s.recentPct}% · ${s.samples} תרגילים · ${s.seconds}ש` +
               (s.ladderPct ? ` · סולם ${s.ladderPct}%` : ''));
  });
  if (rep.hardest.length) {
    lines.push('');
    lines.push('נתקע בעיקר ב: ' + rep.hardest.map(f => `${f.fact} (${f.missPct}%)`).join(', '));
  }
  lines.push('');
  lines.push('המלצות:');
  rep.recommendations.forEach(r => lines.push(`  • ${r.title}: ${r.detail}`));
  return lines.join('\n');
}

function copyReport(rep) {
  const text = reportText(rep);
  const done = ok => {
    const btn = $('btn-parents-copy');
    btn.textContent = ok ? 'הֹעְתַּק ✓' : 'לֹא הִצְלִיחַ לְהַעְתִּיק';
    setTimeout(() => { btn.textContent = 'הַעְתֵּק דּוּחַ 📋'; }, 2000);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => done(true), () => done(false));
  } else {
    // file:// in some browsers has no clipboard API at all.
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    done(ok);
  }
}

/** Hold, don't tap. The gate is the point — see the note in index.html. */
function wireParentsButton() {
  const btn = $('btn-parents');
  const HOLD_MS = 800;
  const SLOP_PX = 16;      // a finger is not a mouse
  let timer = null;
  let from = null;

  const start = e => {
    e.preventDefault();
    const pt = e.touches ? e.touches[0] : e;
    from = { x: pt.clientX, y: pt.clientY };
    btn.classList.add('holding');
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      btn.classList.remove('holding');
      SFX.rare();
      showParents();
    }, HOLD_MS);
  };

  const cancel = () => {
    btn.classList.remove('holding');
    if (timer) { clearTimeout(timer); timer = null; }
  };

  // Movement cancels only once it is real movement. Cancelling on mouseleave —
  // which is what this used to do — meant a thumb settling by a pixel on a
  // tablet aborted the press, and the parent just saw a button that did nothing.
  const moved = e => {
    if (!from || !timer) return;
    const pt = e.touches ? e.touches[0] : e;
    if (Math.hypot(pt.clientX - from.x, pt.clientY - from.y) > SLOP_PX) cancel();
  };

  btn.addEventListener('mousedown', start);
  btn.addEventListener('touchstart', start, { passive: false });
  btn.addEventListener('touchmove', moved, { passive: true });
  document.addEventListener('mousemove', moved, { passive: true });
  ['mouseup', 'touchend', 'touchcancel'].forEach(ev => btn.addEventListener(ev, cancel));
  // Releasing anywhere counts as releasing: a pointer let go off the button must
  // not leave the timer armed.
  document.addEventListener('mouseup', cancel);
}

// ===== TEXT-TO-SPEECH =====
// Backed by pre-generated clips under audio/ — see js/speech.js for why the
// live TTS endpoint could not survive the move to https.

function _stopSpeech() {
  SPEECH.stop();
  $('btn-speak').classList.remove('speaking');
}

function speakQuestion() {
  const btn = $('btn-speak');
  btn.classList.add('speaking');
  const done = () => btn.classList.remove('speaking');

  // Repeat whatever is on the radio right now — mid-ladder that is the rung,
  // not the original call.
  SPEECH.speak($('radio-text').textContent, { onend: done, onerror: done });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // 3D is a bonus layer, never a requirement. Without WebGL the CSS airport and
  // the flat landing game carry on exactly as before.
  use3D = typeof SCENE3D !== 'undefined' && SCENE3D.supported();
  document.body.classList.toggle('has-3d', use3D);

  // Offline support installs itself quietly and is never waited on.
  OFFLINE.register();

  initEntry();
  wireParentsButton();
  showScreen('screen-entry');

  document.querySelectorAll('.num-btn[data-n]').forEach(btn => {
    btn.addEventListener('click', () => handleNumPress(btn.dataset.n));
  });

  $('btn-submit').addEventListener('click', handleSubmit);
  $('btn-speak').addEventListener('click', speakQuestion);
  $('btn-bridge').addEventListener('click', () => openBridge(false));

  $('btn-show-album').addEventListener('click', () => {
    SFX.click();
    saveData = PROGRESS.load();
    showAlbum();
  });

  $('btn-show-map').addEventListener('click', () => {
    SFX.click();
    saveData = PROGRESS.load();
    showMap();
  });

  // A physical keyboard is faster than the pad for anyone helping out.
  document.addEventListener('keydown', e => {
    if ($('screen-game').classList.contains('hidden')) return;
    if (e.key >= '0' && e.key <= '9') handleNumPress(e.key);
    else if (e.key === 'Enter' && !$('btn-submit').disabled) handleSubmit();
    else if (e.key === 'Backspace' || e.key === 'Escape') handleNumPress('clear');
  });
});
