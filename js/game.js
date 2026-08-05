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
const SHIFT_NAMES = ['מִשְׁמֶרֶת בֹּקֶר 🌅', 'מִשְׁמֶרֶת צׇהֳרַיִם ☀️', 'מִשְׁמֶרֶת עֶרֶב 🌙'];

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
    rankEl.textContent = `${rank.emoji} דַּרְגָּה: ${rank.name}`;
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
  // Stop any ongoing speech from the previous question
  _stopSpeech();

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

function showCelebration() {
  const overlay  = document.getElementById('celebrate-overlay');
  const nameEl   = document.getElementById('celebrate-name');
  const confetti = document.getElementById('celebrate-confetti');

  nameEl.textContent = saveData.playerName + '!';

  // Confetti burst
  confetti.innerHTML = '';
  const colors = ['#00ff41','#ff9500','#00bfff','#ff6b9d','#fff700','#cc44ff'];
  for (let i = 0; i < 32; i++) {
    const p = document.createElement('div');
    p.className = 'cel-cp';
    p.style.left             = (Math.random() * 100) + '%';
    p.style.width            = (6 + Math.random() * 7) + 'px';
    p.style.height           = (6 + Math.random() * 7) + 'px';
    p.style.background       = colors[i % colors.length];
    p.style.borderRadius     = Math.random() > .45 ? '50%' : '2px';
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

function showCorrect() {
  document.getElementById('btn-submit').disabled = true;
  correctCount++;
  const bubble = document.getElementById('radio-bubble');
  bubble.classList.add('correct');
  showCelebration();

  const chosenResponse = MESSAGES.correct[Math.floor(Math.random() * MESSAGES.correct.length)];
  document.getElementById('radio-text').textContent = chosenResponse;
  SPEECH.speak(chosenResponse);

  // Animate landing on radar (if planes visual)
  if (currentQ.visual === 'planes' && currentQ.type === 'subtraction') {
    animateLanding();
  }

  // Animate the meter to where the PLANE ends up, which is not always the
  // answer: on safety-station stages the answer is how far to descend, while
  // the plane itself stops at 10.
  if (currentQ.visual === 'altitude') {
    animateAltitudeChange(currentQ.destAlt !== undefined ? currentQ.destAlt : currentQ.result);
  }

  // Move to next question after celebration ends
  setTimeout(nextQuestion, 2100);
}

function showWrong() {
  const bubble = document.getElementById('radio-bubble');
  bubble.classList.add('retry');
  setTimeout(() => bubble.classList.remove('retry'), 500);

  const retryText = MESSAGES.retry[attempts - 1] || MESSAGES.retry[0];
  document.getElementById('radio-text').textContent = retryText;
  SPEECH.speak(retryText);

  // Restore the original question after a short pause
  const originalText = formatRadioText(currentQ.radioText, currentQ);
  setTimeout(() => {
    document.getElementById('radio-text').textContent = originalText;
  }, 1500);

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
  const total = currentQ.type === 'addition' ? currentQ.a + currentQ.b : currentQ.a;
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
    const separatorIndex = currentQ.type === 'subtraction' ? crossed : currentQ.a;
    hintDots.insertBefore(separator, hintDots.children[separatorIndex] || null);
  }
}

function revealAnswer() {
  document.getElementById('btn-submit').disabled = true;
  const revealText = MESSAGES.reveal.replace(/{result}/g, currentQ.result);
  document.getElementById('radio-text').textContent = revealText;
  // The child who missed three times is exactly the one who needs to hear it.
  SPEECH.speak(revealText);

  if (currentQ.visual === 'altitude') {
    animateAltitudeChange(currentQ.destAlt !== undefined ? currentQ.destAlt : currentQ.result);
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
  saveData.currentStageShifts = (saveData.currentStageShifts || 0) + 1;

  // Advance after every 2 shifts on this stage with ≥6/8 correct
  const shouldAdvance = correctCount >= 6 && (saveData.currentStageShifts % 2 === 0);

  let rankUp = false;
  let newPlane = null;

  if (shouldAdvance) {
    saveData.currentStageShifts = 0; // reset for next stage (or stays at 7)
    if (saveData.currentStage < 7) {
      const oldRank = PROGRESS.getRankForStage(saveData.currentStage).name;
      PROGRESS.completeStage(saveData, saveData.currentStage);
      const newRank = PROGRESS.getRankForStage(saveData.currentStage).name;
      rankUp = (newRank !== oldRank);
    }
  }

  // Award a random plane not yet collected
  const uncollected = PLANE_TYPES.filter(p => !saveData.planesCollected.includes(p.id));
  if (uncollected.length > 0) {
    const awarded = uncollected[Math.floor(Math.random() * uncollected.length)];
    PROGRESS.addPlane(saveData, awarded.id);
    newPlane = awarded;
  }

  PROGRESS.save(saveData);

  // Landing mini-game as reward if a new plane was collected
  if (newPlane) {
    startLandingGame(newPlane, () => showReport(correctCount, newPlane, rankUp));
  } else {
    showReport(correctCount, null, rankUp);
  }
}

// ===== SHIFT REPORT =====
function showReport(correct, newPlane, rankUp) {
  const planesEl  = document.getElementById('report-planes');
  const msgEl     = document.getElementById('report-msg');
  const planeEl   = document.getElementById('report-new-plane');
  const rankEl    = document.getElementById('report-rank-up');
  const btnCont   = document.getElementById('btn-continue');

  // Show plane emojis for each correct answer (always show at least one)
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

  if (newPlane) {
    const isGold = newPlane.rarity === 'gold';
    planeEl.textContent = isGold
      ? `✨ כֶּרְטִיס זָהָב נָדִיר! ${newPlane.emoji} ${newPlane.name} ✨`
      : `מָטוֹס חָדָשׁ בָּאַלְבּוּם: ${newPlane.emoji} ${newPlane.name}`;
    planeEl.className = 'new-plane-badge' + (isGold ? ' gold' : '');
    planeEl.classList.remove('hidden');
  } else {
    planeEl.classList.add('hidden');
  }

  if (rankUp) {
    const rank = PROGRESS.getRankForStage(saveData.currentStage);
    rankEl.textContent = `קִידּוּם! דַּרְגָּה חֲדָשָׁה: ${rank.emoji} ${rank.name}`;
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

// ===== ALBUM SCREEN =====
function showAlbum() {
  const grid = document.getElementById('album-grid');
  grid.innerHTML = '';

  PLANE_TYPES.forEach(p => {
    const slot = document.createElement('div');
    const collected = saveData.planesCollected.includes(p.id);
    const isGold = p.rarity === 'gold';

    slot.className = 'album-slot'
      + (collected ? ' collected' : ' empty')
      + (collected && isGold ? ' gold' : '');
    slot.textContent = collected ? p.emoji : '❓';
    slot.title = collected ? p.name : '???';

    if (collected) {
      slot.addEventListener('click', () => openPlaneDetail(p));
    }
    grid.appendChild(slot);
  });

  document.getElementById('btn-album-back').onclick = () => {
    showScreen('screen-entry');
    initEntry();
  };

  showScreen('screen-album');
}

// ===== PLANE DETAIL POPUP =====
function openPlaneDetail(plane) {
  // Remove any existing modal
  const existing = document.getElementById('plane-modal');
  if (existing) existing.remove();

  const isGold = plane.rarity === 'gold';
  const modal = document.createElement('div');
  modal.id = 'plane-modal';
  modal.className = 'plane-modal' + (isGold ? ' gold' : '');

  modal.innerHTML = `
    <div class="plane-modal-card">
      <span class="plane-modal-emoji">${plane.emoji}</span>
      <h3 class="plane-modal-name">${plane.name}</h3>
      ${isGold ? '<span class="plane-modal-gold-badge">✨ כֶּרְטִיס זָהָב נָדִיר!</span>' : ''}
      <p class="plane-modal-fact">${plane.funFact}</p>
      <button class="plane-modal-close btn-primary">סָגוּר ✕</button>
    </div>
  `;

  // Close on backdrop click or close button
  modal.addEventListener('click', e => {
    if (e.target === modal || e.target.classList.contains('plane-modal-close')) {
      modal.classList.add('closing');
      setTimeout(() => modal.remove(), 250);
    }
  });

  document.body.appendChild(modal);
  // Trigger animation next frame
  requestAnimationFrame(() => modal.classList.add('open'));
}

// ===== LANDING MINI-GAME =====
let _lg = null; // landing game state

function startLandingGame(plane, onComplete) {
  const isGold = plane.rarity === 'gold';

  _lg = {
    plane, onComplete,
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

  // Set up UI
  document.getElementById('landing-title').textContent =
    (isGold ? '✨ ' : '✈ ') + `נְחִית אֶת ${plane.name}!`;
  document.getElementById('landing-plane').textContent = plane.emoji;
  document.getElementById('landing-msg').textContent =
    'לְחַץ עַל הַכַּפְתּוֹר כַּאֲשֶׁר הַמָּטוֹס מֵעַל הַמַּסְלוּל הַמֶּאִיר!';
  const btn = document.getElementById('btn-land');
  btn.textContent = '✈ לְחַץ לִנְחִיתָה!';
  btn.disabled = false;
  btn.className = 'btn-land' + (isGold ? ' gold' : '');
  btn.onclick = _attemptLanding;

  // Style landing zone for gold planes
  document.getElementById('landing-zone').className =
    'landing-zone' + (isGold ? ' gold' : '');

  showScreen('screen-landing');

  // Compute RUNWAY_Y after screen is visible
  requestAnimationFrame(() => {
    const skyEl   = document.getElementById('landing-sky');
    const planeEl = document.getElementById('landing-plane');
    const skyH    = skyEl.offsetHeight || 300;
    const groundH = 65;
    const planeH  = planeEl.offsetHeight || 50;
    _lg.RUNWAY_Y  = ((skyH - groundH - planeH + 4) / skyH) * 100;

    // Reset plane position
    planeEl.style.cssText = `left:${_lg.x}%;top:${_lg.y}%`;
    _lg.raf = requestAnimationFrame(_landingLoop);
  });
}

function _landingLoop() {
  if (!_lg) return;
  const planeEl = document.getElementById('landing-plane');

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
    // Snap to center of zone on auto-assist
    if (!inZone) {
      _lg.x = (_lg.ZONE_START + _lg.ZONE_END) / 2;
      document.getElementById('landing-plane').style.left = _lg.x + '%';
    }
    _lg.phase = 'descending';
    document.getElementById('btn-land').disabled = true;
    document.getElementById('landing-msg').textContent = '...יוֹרְדִים לִנְחִיתָה 🛬';

  } else {
    _lg.attempts++;
    const msgs = [
      'כִּמְעַט! לְחַץ כַּאֲשֶׁר הַמָּטוֹס מֵעַל הַמַּסְלוּל הַיָּרֹק!',
      'עוֹד פַּעַם — הַפַּעַם תַּצְלִיחַ!',
    ];
    document.getElementById('landing-msg').textContent = msgs[_lg.attempts - 1];

    // Wobble the plane
    const p = document.getElementById('landing-plane');
    p.classList.remove('lg-wobble');
    void p.offsetWidth; // reflow
    p.classList.add('lg-wobble');
    setTimeout(() => p && p.classList.remove('lg-wobble'), 500);
  }
}

function _onLandingSuccess() {
  cancelAnimationFrame(_lg.raf);
  _lg.raf = null;

  const planeEl = document.getElementById('landing-plane');
  const isGold  = _lg.plane.rarity === 'gold';

  // Landing dust / bounce
  planeEl.classList.add('lg-landed');

  // Show success message
  document.getElementById('landing-msg').textContent =
    isGold
      ? '✨ נְחִיתַת זָהָב מוּשְׁלֶמֶת! אַתָּה מַדְהִים! ✨'
      : '🎉 נְחִיתָה מוּשְׁלֶמֶת! כׇּל הַכָּבוֹד!';

  // TTS celebration
  SPEECH.speak(isGold ? MESSAGES.landing.gold : MESSAGES.landing.normal);

  // Celebration confetti (reuse existing celebrate overlay briefly)
  const overlay = document.getElementById('celebrate-overlay');
  const confettiEl = document.getElementById('celebrate-confetti');
  document.getElementById('celebrate-name').textContent = _lg.plane.name;
  document.querySelector('.celebrate-sub').textContent = isGold ? '✨ מָטוֹס זָהָב!' : 'מָטוֹס חָדָשׁ!';
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

  // Show "continue" button after short pause
  setTimeout(() => {
    const btn = document.getElementById('btn-land');
    btn.disabled = false;
    btn.textContent = '✅ לְדוּחַ הַמִּשְׁמֶרֶת';
    btn.onclick = () => {
      planeEl.className = 'landing-plane-el';
      planeEl.style.cssText = '';
      const { onComplete } = _lg;
      _lg = null;
      onComplete();
    };
  }, 2000);
}

// ===== MAP SCREEN =====
function showMap() {
  const container = document.getElementById('map-stages');
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

    const icon   = document.createElement('span');
    icon.className = 'map-stage-icon';
    icon.textContent = completed ? '✅' : (current ? '👉' : '🔒');

    const name   = document.createElement('span');
    name.className = 'map-stage-name';
    name.textContent = `נָמֵל ${stage.id}: ${stage.title}`;

    const status = document.createElement('span');
    status.className = 'map-stage-status';
    status.textContent = completed ? 'הוּשְׁלַם' : (current ? 'פָּעִיל' : 'נָעוּל');

    row.append(icon, name, status);
    container.appendChild(row);
  });

  document.getElementById('btn-map-back').onclick = () => {
    showScreen('screen-entry');
    initEntry();
  };

  showScreen('screen-map');
}

// ===== TEXT-TO-SPEECH =====
// Backed by pre-generated clips under audio/ — see js/speech.js for why the
// live TTS endpoint could not survive the move to https.

function _stopSpeech() {
  SPEECH.stop();
  document.getElementById('btn-speak').classList.remove('speaking');
}

function speakQuestion() {
  const btn = document.getElementById('btn-speak');
  btn.classList.add('speaking');
  const done = () => btn.classList.remove('speaking');

  SPEECH.speak(formatRadioText(currentQ.radioText, currentQ), {
    onend: done,
    onerror: done
  });
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
  document.getElementById('btn-speak').addEventListener('click', speakQuestion);

  document.getElementById('btn-show-album').addEventListener('click', () => {
    saveData = PROGRESS.load();
    showAlbum();
  });

  document.getElementById('btn-show-map').addEventListener('click', () => {
    saveData = PROGRESS.load();
    showMap();
  });
});
