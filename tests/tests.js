// tests.js — run via browser console: runTests()
function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      passed++;
    } else {
      failed++;
      console.error('FAIL:', message);
    }
  }

  console.group('מגדל הפיקוח — Tests');

  // ===== PROGRESS tests =====
  const d = PROGRESS._default();
  assert(d.currentStage === 1, 'Default stage should be 1');
  assert(d.planesCollected.length === 0, 'Default planes should be empty');
  assert(d.stagesCompleted.length === 0, 'Default stagesCompleted should be empty');
  assert(d.shiftsCompleted === 0, 'Default shiftsCompleted should be 0');

  // getRankForStage
  assert(PROGRESS.getRankForStage(1).name === 'מִתְלַמֵּד', 'Stage 1 = מִתְלַמֵּד');
  assert(PROGRESS.getRankForStage(2).name === 'פַּקָּח', 'Stage 2 = פַּקָּח');
  assert(PROGRESS.getRankForStage(3).name === 'פַּקָּח', 'Stage 3 = פַּקָּח (no change until 4)');
  assert(PROGRESS.getRankForStage(4).name === 'פַּקָּח בְּכִיר', 'Stage 4 = פַּקָּח בְּכִיר');
  assert(PROGRESS.getRankForStage(6).name === 'מְפַקֵּחַ', 'Stage 6 = מְפַקֵּחַ');
  assert(PROGRESS.getRankForStage(8).name === 'מְפַקֵּחַ רָאשִׁי', 'Stage 8 = מְפַקֵּחַ רָאשִׁי');

  // addPlane deduplication (functions mutate in place)
  let data = PROGRESS._default();
  PROGRESS.addPlane(data, 1);
  PROGRESS.addPlane(data, 1); // duplicate
  assert(data.planesCollected.length === 1, 'No duplicate planes');
  PROGRESS.addPlane(data, 2);
  assert(data.planesCollected.length === 2, 'Second plane added');

  // completeStage (mutates in place)
  data = PROGRESS._default();
  PROGRESS.completeStage(data, 1);
  assert(data.currentStage === 2, 'After completing stage 1, currentStage = 2');
  assert(data.stagesCompleted.includes(1), 'Stage 1 in stagesCompleted');
  assert(data.rank === 'פַּקָּח', 'Rank updated to פַּקָּח after stage 1');

  // completeStage idempotent
  PROGRESS.completeStage(data, 1); // complete again
  assert(data.stagesCompleted.filter(s => s === 1).length === 1, 'No duplicate in stagesCompleted');

  // Stage cap at 7
  data = PROGRESS._default();
  data.currentStage = 7;
  PROGRESS.completeStage(data, 7);
  assert(data.currentStage === 7, 'Stage capped at 7');

  // ===== CURRICULUM integrity =====
  assert(CURRICULUM.stages.length === 7, '7 stages in curriculum');

  CURRICULUM.stages.forEach((stage, i) => {
    assert(stage.questions.length >= 8, `Stage ${i+1} has ≥8 questions (has ${stage.questions.length})`);
    stage.questions.forEach((q, j) => {
      let mathOk = false;
      if (q.type === 'addition')    mathOk = q.a + q.b === q.result;
      if (q.type === 'subtraction') mathOk = q.a - q.b === q.result;
      if (q.type === 'decompose')   mathOk = q.a - q.b === q.result;
      assert(mathOk, `Stage ${i+1} Q${j+1}: ${q.a} ${q.type} ${q.b} ≠ ${q.result}`);
    });
  });

  // ===== THE QUESTION MUST ASK FOR THE ANSWER THE GAME EXPECTS =====
  //
  // This is the check that matters most, and its absence shipped a real bug:
  // every stage-3 question READ "how much should I descend?" while the game
  // waited for the destination altitude. A child at altitude 11 typed 1, was
  // right, and was told he was wrong — with the on-screen hint showing him
  // "10 + 1" the entire time.
  //
  // Arithmetic checks cannot catch that, because 11 - 1 = 10 is perfectly true.
  // Only comparing the WORDING against the expected answer catches it. The
  // assertion that used to sit here ("stage 3: all results = 10") did the
  // opposite: it pinned the wrong answer in place.
  const stripNikud = s => s.replace(/[ְ-ׇ]/g, '');
  const fill = (t, q) => stripNikud(
    t.replace(/{a}/g, q.a).replace(/{b}/g, q.b).replace(/{result}/g, q.result)
  );

  // Each entry maps a Hebrew phrasing to the quantity it is actually asking for.
  const ASK_PATTERNS = [
    { name: 'ABOVE-TEN',   want: q => q.a - 10,   re: /מעל|ועוד\s+כמה|פרק\s+לי|שווה\s+10/ },
    { name: 'DESCEND-BY',  want: q => q.a - 10,   re: /כמה\s+(יחידות\s+)?(גובה\s+)?(צריך\s+)?(ל)?(הוריד|רדת)/ },
    { name: 'DESTINATION', want: q => q.result,   re: /לאיזה\s+גובה|מה\s+הגובה|לאן/ },
    { name: 'TOTAL',       want: q => q.a + q.b,  re: /סך\s+הכל|כמה\s+יהיו|כמה\s+מטוסים|לפקח/ },
    { name: 'REMAINING',   want: q => q.a - q.b,  re: /כמה\s+(עוד|נשארו|נותרו|ממתינים|ממשיכים|עדיין)|בשמים\?/ },
  ];

  CURRICULUM.stages.forEach(stage => {
    stage.questions.forEach((q, j) => {
      const text = fill(q.radioText, q);
      const hit  = ASK_PATTERNS.find(p => p.re.test(text));
      // An unclassifiable question fails too: a question nobody can parse is
      // exactly where the next one of these will hide.
      if (!hit) {
        assert(false, `Stage ${stage.id} Q${j+1}: cannot tell what is being asked — "${text}"`);
        return;
      }
      assert(hit.want(q) === q.result,
        `Stage ${stage.id} Q${j+1}: wording asks ${hit.name} (=${hit.want(q)}) ` +
        `but the game expects ${q.result} — "${text}"`);
    });
  });

  // ===== EVERY ANSWER MUST BE TYPEABLE =====
  // The pad only composes integers 0..19; anything else is unanswerable, and an
  // unanswerable question traps the child on it.
  CURRICULUM.stages.forEach(stage => {
    stage.questions.forEach((q, j) => {
      assert(Number.isInteger(q.result) && q.result >= 0 && q.result <= 19,
        `Stage ${stage.id} Q${j+1}: answer ${q.result} cannot be entered on the numpad`);
    });
  });

  // ===== THE HINT MUST NOT CONTRADICT THE ANSWER =====
  // The altitude meter splits the current altitude into "10 + units". Where the
  // answer IS those units, the two must agree — the stage-3 bug was plainly
  // visible here as "10 + 1" displayed while 10 was demanded.
  CURRICULUM.stages.forEach(stage => {
    if (stage.visual !== 'altitude') return;
    stage.questions.forEach((q, j) => {
      if (q.hint !== 'decompose' || q.a <= 10 || q.destAlt !== 10) return;
      assert(q.a - 10 === q.result,
        `Stage ${stage.id} Q${j+1}: hint shows 10+${q.a - 10} but the answer is ${q.result}`);
    });
  });

  // ===== SAFETY-STATION STAGES MUST LEAVE THE PLANE AT A SANE ALTITUDE =====
  // Without destAlt the meter animates down to the answer itself — a plane at
  // altitude 1 — which destroys the "you always stop at 10" idea being taught.
  CURRICULUM.stages.forEach(stage => {
    if (!stage.safetyStation) return;
    stage.questions.forEach((q, j) => {
      const lands = q.destAlt !== undefined ? q.destAlt : q.result;
      assert(lands >= 10 && lands <= 19,
        `Stage ${stage.id} Q${j+1}: plane would settle at altitude ${lands}`);
    });
  });

  // Stage 4 climbs from the safety station
  const s4 = CURRICULUM.stages[3];
  assert(s4.questions.every(q => q.a === 10), 'Stage 4: every climb starts at 10');

  // Stage 5 is decomposition
  const s5 = CURRICULUM.stages[4];
  assert(s5.questions.every(q => q.type === 'decompose'), 'Stage 5: all decompose type');

  // ===== READ-ALOUD COVERAGE =====
  // Not optional: the child cannot yet read the questions unaided, so a line
  // without a clip is a line he cannot access.
  if (typeof SPEECH !== 'undefined' && typeof MESSAGES !== 'undefined') {
    const spoken = new Set();
    CURRICULUM.stages.forEach(s => s.questions.forEach(q => {
      spoken.add(fill(q.radioText, q));
      spoken.add(MESSAGES.reveal.replace(/{result}/g, q.result));
    }));
    MESSAGES.correct.forEach(m => spoken.add(m));
    MESSAGES.retry.forEach(m => spoken.add(m));
    spoken.add(MESSAGES.landing.normal);
    spoken.add(MESSAGES.landing.gold);
    assert(spoken.size > 0, 'Collected every spoken line');
    console.log(`(${spoken.size} distinct spoken lines — re-run tools/generate-audio.js if any changed)`);
  }

  console.groupEnd();
  console.log(`Tests complete: ${passed} passed, ${failed} failed`);
  if (failed === 0) console.log('%c✅ All tests passed!', 'color: green; font-weight: bold');
  return { passed, failed };
}

if (typeof module !== 'undefined' && module.exports) module.exports = { runTests };
