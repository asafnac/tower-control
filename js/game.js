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
  const pool = stage.questions.map(q => ({ ...q, visual: stage.visual }));
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

// ===== ALTITUDE METER VISUAL =====
function showAltitudeMeter(q) {
  const altitude = q.a; // starting altitude
  const maxAlt = 20;
  const pct = (altitude / maxAlt) * 100;

  document.getElementById('alt-fill').style.height = pct + '%';
  document.getElementById('alt-number').textContent = altitude;

  // Show decomposition for altitude-type questions
  const decompose = document.getElementById('alt-decompose');
  if (q.hint === 'decompose' && (altitude > 10 || q.result > 10)) {
    document.getElementById('decompose-units').textContent = (altitude > 10 ? altitude : q.result) - 10;
    decompose.classList.remove('hidden');
  } else {
    decompose.classList.add('hidden');
  }
}

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
    if (twoDigit <= 19) {
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

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initEntry();
  showScreen('screen-entry');

  // Number pad
  document.querySelectorAll('.num-btn[data-n]').forEach(btn => {
    btn.addEventListener('click', () => handleNumPress(btn.dataset.n));
  });

  document.getElementById('btn-submit').addEventListener('click', handleSubmit);
});
