// tests.js — run in the browser console: runTests()
//            or from a terminal:        node tests/run.js
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

  const MAX_STAGE = CURRICULUM.stages.length;

  // ===== PROGRESS tests =====
  const d = PROGRESS._default();
  assert(d.currentStage === 1, 'Default stage should be 1');
  assert(d.planesCollected.length === 0, 'Default planes should be empty');
  assert(d.stagesCompleted.length === 0, 'Default stagesCompleted should be empty');
  assert(d.shiftsCompleted === 0, 'Default shiftsCompleted should be 0');
  assert(d.flightHours === 0, 'Default flightHours should be 0');
  assert(d.soundOn === true, 'Sound on by default');

  // getRankForStage — ranks only ever go up, and never below the first one.
  assert(PROGRESS.getRankForStage(1).name === 'מִתְלַמֵּד', 'Stage 1 = מִתְלַמֵּד');
  assert(PROGRESS.getRankForStage(2).name === 'פַּקָּח', 'Stage 2 = פַּקָּח');
  assert(PROGRESS.getRankForStage(3).name === 'פַּקָּח', 'Stage 3 = פַּקָּח (no change until 4)');
  assert(PROGRESS.getRankForStage(4).name === 'פַּקָּח בְּכִיר', 'Stage 4 = פַּקָּח בְּכִיר');
  assert(PROGRESS.getRankForStage(6).name === 'מְפַקֵּחַ', 'Stage 6 = מְפַקֵּחַ');
  assert(PROGRESS.getRankForStage(8).name === 'מְפַקֵּחַ רָאשִׁי', 'Stage 8 = מְפַקֵּחַ רָאשִׁי');
  assert(PROGRESS.getRankForStage(MAX_STAGE).minStage <= MAX_STAGE, 'Last stage has a rank');
  for (let s = 1; s < MAX_STAGE; s++) {
    assert(RANKS.indexOf(PROGRESS.getRankForStage(s)) <=
           RANKS.indexOf(PROGRESS.getRankForStage(s + 1)),
      `Rank never drops between stage ${s} and ${s + 1}`);
  }

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

  PROGRESS.completeStage(data, 1); // complete again
  assert(data.stagesCompleted.filter(s => s === 1).length === 1, 'No duplicate in stagesCompleted');

  // The cap follows the curriculum: adding a port must not need a code change.
  data = PROGRESS._default();
  data.currentStage = MAX_STAGE;
  PROGRESS.completeStage(data, MAX_STAGE);
  assert(data.currentStage === MAX_STAGE, `Stage capped at ${MAX_STAGE}`);

  // ===== DAY STREAK =====
  // A child who plays two days running must see 2, and one who skips a day must
  // see 1 — never 0, and never a message about what he lost.
  const day = (y, m, dd) => new Date(y, m - 1, dd, 12, 0, 0);
  data = PROGRESS._default();
  assert(PROGRESS.touchDay(data, day(2026, 3, 10)) === 1, 'First day played = streak 1');
  assert(PROGRESS.touchDay(data, day(2026, 3, 10)) === 1, 'Same day again = still 1');
  assert(PROGRESS.touchDay(data, day(2026, 3, 11)) === 2, 'Next day = streak 2');
  assert(PROGRESS.touchDay(data, day(2026, 3, 12)) === 3, 'Third day = streak 3');
  assert(PROGRESS.touchDay(data, day(2026, 3, 15)) === 1, 'Gap resets to 1, not 0');
  // Month and year boundaries are where naive date math dies.
  data = PROGRESS._default();
  PROGRESS.touchDay(data, day(2026, 1, 31));
  assert(PROGRESS.touchDay(data, day(2026, 2, 1)) === 2, 'Streak survives a month boundary');
  data = PROGRESS._default();
  PROGRESS.touchDay(data, day(2025, 12, 31));
  assert(PROGRESS.touchDay(data, day(2026, 1, 1)) === 2, 'Streak survives a year boundary');

  // ===== DAILY MISSION =====
  // Same mission all day, and one that some shift can actually satisfy.
  const m1 = PROGRESS.missionForDay('2026-03-10');
  assert(PROGRESS.missionForDay('2026-03-10').id === m1.id, 'Mission is stable within a day');
  assert(MESSAGES.missions.every(m => typeof m.check === 'function'), 'Every mission is checkable');
  const perfectShift = { answered: 8, total: 8, correct: 8, firstTry: 8, bestCombo: 8 };
  assert(MESSAGES.missions.every(m => m.check(perfectShift)),
    'A perfect shift completes any mission — no mission is impossible');
  const emptyShift = { answered: 0, total: 8, correct: 0, firstTry: 0, bestCombo: 0 };
  assert(MESSAGES.missions.every(m => !m.check(emptyShift)),
    'No mission completes itself without playing');

  // ===== CURRICULUM integrity =====
  assert(MAX_STAGE >= 14, `${MAX_STAGE} stages in curriculum`);
  const seenIds = new Set();
  CURRICULUM.stages.forEach((stage, i) => {
    assert(!seenIds.has(stage.id), `Stage id ${stage.id} is unique`);
    seenIds.add(stage.id);
    assert(stage.id === i + 1, `Stage ${i + 1} is numbered in order`);
    assert(stage.questions.length >= 8, `Stage ${stage.id} has ≥8 questions (has ${stage.questions.length})`);
  });

  // The arithmetic each question type promises.
  const EXPECTED = {
    addition:      q => q.a + q.b,
    subtraction:   q => q.a - q.b,
    decompose:     q => q.a - q.b,
    split:         q => q.a - q.b,
    'bridge-add':  q => q.a + q.b,
    'bridge-sub':  q => q.a - q.b,
    tens:          q => q.a / 10,
    after:         q => q.a + 1,
    before:        q => q.a - 1,
  };

  CURRICULUM.stages.forEach(stage => {
    stage.questions.forEach((q, j) => {
      const expect = EXPECTED[q.type];
      assert(!!expect, `Stage ${stage.id} Q${j + 1}: unknown question type "${q.type}"`);
      if (expect) {
        assert(expect(q) === q.result,
          `Stage ${stage.id} Q${j + 1}: ${q.type}(${q.a}, ${q.b}) ≠ ${q.result}`);
      }
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
  // Only comparing the WORDING against the expected answer catches it.
  const stripNikud = s => s.replace(/[ְ-ׇ]/g, '');
  const fill = (t, q) => stripNikud(fillTemplate(t, q));

  // Each entry maps a Hebrew phrasing to the quantity it asks for, and to the
  // question types that phrasing is allowed to belong to. Both halves matter: a
  // 'split' question worded "which altitude do I reach" is a bug even when the
  // arithmetic happens to line up.
  const ASK_PATTERNS = [
    { name: 'TENS-COUNT',  types: ['tens'],
      want: q => q.a / 10,  re: /כמה\s+עשרות/ },
    { name: 'AFTER',       types: ['after'],
      want: q => q.a + 1,   re: /בא\s+(מיד\s+)?אחרי|שבא\s+אחרי/ },
    { name: 'BEFORE',      types: ['before'],
      want: q => q.a - 1,   re: /בא\s+(מיד\s+)?לפני|שבא\s+לפני/ },
    // "מעל" has to stand as its own word: לְמַעְלָה contains it, and matching
    // that turned a perfectly good "which altitude do I reach" into a SPLIT.
    { name: 'SPLIT',       types: ['decompose', 'split'],
      want: q => q.a - q.b, re: /(^|\s)מעל(\s|$)|ועוד\s+כמה|פרק\s+לי|שווה\s+10/ },
    { name: 'DESCEND-BY',  types: ['decompose'],
      want: q => q.a - q.b, re: /כמה\s+(יחידות\s+)?(גובה\s+)?(צריך\s+)?(ל)?(הוריד|רדת)/ },
    { name: 'DESTINATION', types: ['addition', 'subtraction', 'bridge-add', 'bridge-sub', 'after', 'before'],
      want: q => EXPECTED[q.type](q),
      re: /לאיזה\s+גובה|מה\s+הגובה|לאיזו\s+רמ|מה\s+הרמה|לאן/ },
    { name: 'TOTAL',       types: ['addition'],
      want: q => q.a + q.b, re: /סך\s+הכל|כמה\s+יהיו|כמה\s+מטוסים|לפקח/ },
    { name: 'REMAINING',   types: ['subtraction'],
      want: q => q.a - q.b, re: /כמה\s+(עוד|נשארו|נותרו|ממתינים|ממשיכים|עדיין)|בשמים\?/ },
  ];

  CURRICULUM.stages.forEach(stage => {
    stage.questions.forEach((q, j) => {
      const text = fill(q.radioText, q);
      const hit  = ASK_PATTERNS.find(p => p.re.test(text));
      // An unclassifiable question fails too: a question nobody can parse is
      // exactly where the next one of these will hide.
      if (!hit) {
        assert(false, `Stage ${stage.id} Q${j + 1}: cannot tell what is being asked — "${text}"`);
        return;
      }
      assert(hit.types.includes(q.type),
        `Stage ${stage.id} Q${j + 1}: worded as ${hit.name} but typed "${q.type}" — "${text}"`);
      assert(hit.want(q) === q.result,
        `Stage ${stage.id} Q${j + 1}: wording asks ${hit.name} (=${hit.want(q)}) ` +
        `but the game expects ${q.result} — "${text}"`);
    });
  });

  // ===== EVERY ANSWER MUST BE TYPEABLE =====
  // The pad composes integers 0..100; anything else is unanswerable, and an
  // unanswerable question traps the child on it.
  CURRICULUM.stages.forEach(stage => {
    stage.questions.forEach((q, j) => {
      assert(Number.isInteger(q.result) && q.result >= 0 && q.result <= 100,
        `Stage ${stage.id} Q${j + 1}: answer ${q.result} cannot be entered on the numpad`);
    });
  });

  // ===== NOTHING MAY LEAVE THE METER =====
  // Every altitude a question names, and every altitude the plane moves to, has
  // to fit under that stage's ceiling or the needle pins and the picture lies.
  CURRICULUM.stages.forEach(stage => {
    if (stage.visual !== 'altitude') return;
    stage.questions.forEach((q, j) => {
      const max = q.altMax || stage.altMax || 20;
      const values = [q.a, q.destAlt !== undefined ? q.destAlt : q.result].filter(v => v !== undefined);
      values.forEach(v => assert(v >= 0 && v <= max,
        `Stage ${stage.id} Q${j + 1}: altitude ${v} is off a 0–${max} meter`));
    });
  });

  // ===== THE HINT MUST NOT CONTRADICT THE ANSWER =====
  // The meter splits the current altitude into "tens + units". Where the answer
  // IS those units, the two must agree — the stage-3 bug was plainly visible
  // here as "10 + 1" displayed while 10 was demanded.
  CURRICULUM.stages.forEach(stage => {
    if (stage.visual !== 'altitude') return;
    stage.questions.forEach((q, j) => {
      if (q.hint !== 'decompose' || q.a <= 10 || q.destAlt !== 10) return;
      assert(q.a - 10 === q.result,
        `Stage ${stage.id} Q${j + 1}: hint shows 10+${q.a - 10} but the answer is ${q.result}`);
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
        `Stage ${stage.id} Q${j + 1}: plane would settle at altitude ${lands}`);
    });
  });

  // Stage 4 climbs from the safety station
  assert(CURRICULUM.stages[3].questions.every(q => q.a === 10), 'Stage 4: every climb starts at 10');
  // Stage 5 is decomposition
  assert(CURRICULUM.stages[4].questions.every(q => q.type === 'decompose'), 'Stage 5: all decompose type');

  // ===== THE LADDER =====
  // The whole point of ports 7 and 8. Every bridging question must really cross
  // a ten (otherwise the method is being taught on an example that never needed
  // it), and every rung must be a number a first-grader can reach and type.
  CURRICULUM.stages.forEach(stage => {
    stage.questions.forEach((q, j) => {
      if (q.type !== 'bridge-add' && q.type !== 'bridge-sub') return;
      const where = `Stage ${stage.id} Q${j + 1} (${q.a}${q.type === 'bridge-add' ? '+' : '−'}${q.b})`;

      assert(Math.floor(q.a / 10) !== Math.floor(q.result / 10) || q.result % 10 === 0,
        `${where}: does not actually cross a ten — the ladder would teach nothing`);

      const b = bridgeSteps(q);
      assert(b.stop % 10 === 0, `${where}: station ${b.stop} is not a ten`);
      assert(b.s1 + b.s2 === q.b, `${where}: rungs ${b.s1}+${b.s2} do not add up to ${q.b}`);
      assert(b.s1 > 0 && b.s2 > 0, `${where}: a rung of 0 — the ladder collapses to one step`);
      assert(b.steps[b.steps.length - 1].answer === q.result,
        `${where}: the last rung is not the answer to the call`);
      b.steps.forEach((s, k) => {
        assert(Number.isInteger(s.answer) && s.answer >= 0 && s.answer <= 100,
          `${where}: rung ${k + 1} answer ${s.answer} is not typeable`);
        assert(/\?/.test(s.prompt), `${where}: rung ${k + 1} is not phrased as a question`);
        assert(!/{\w+}/.test(s.prompt), `${where}: rung ${k + 1} has an unfilled placeholder`);
      });
      assert(!/{\w+}/.test(b.intro) && !/{\w+}/.test(b.done),
        `${where}: ladder intro/done has an unfilled placeholder`);
    });
  });

  // Port 8 is the port this update exists for. 16 − 9 must be in it.
  const port8 = CURRICULUM.stages.find(s => s.id === 8);
  assert(port8 && port8.questions.some(q => q.a === 16 && q.b === 9 && q.result === 7),
    'Port 8 contains 16 − 9 = 7');

  // ===== NUMBERS TO 100 =====
  const allResults = CURRICULUM.stages.flatMap(s => s.questions.map(q => q.result));
  const allOperands = CURRICULUM.stages.flatMap(s => s.questions.map(q => q.a));
  assert(Math.max(...allOperands) >= 100, 'The curriculum reaches 100');
  assert(allResults.some(r => r > 20), 'There is work above 20');
  assert(CURRICULUM.stages.some(s => s.altMax === 100), 'There is a 0–100 meter');

  // ===== NO UNFILLED PLACEHOLDERS =====
  CURRICULUM.stages.forEach(stage => {
    stage.questions.forEach((q, j) => {
      const text = fillTemplate(q.radioText, q);
      assert(!/{\w+}/.test(text),
        `Stage ${stage.id} Q${j + 1}: unfilled placeholder in "${text}"`);
    });
  });

  // ===== ALBUM =====
  const planeIds = new Set();
  PLANE_TYPES.forEach(p => {
    assert(!planeIds.has(p.id), `Plane id ${p.id} is unique`);
    planeIds.add(p.id);
    assert(!!p.name && !!p.emoji && !!p.funFact, `Plane ${p.id} has name, emoji and fact`);
    assert(!p.rarity || !!RARITY[p.rarity], `Plane ${p.id} has a known rarity ("${p.rarity}")`);
  });
  assert(PLANE_TYPES.length >= 40, `${PLANE_TYPES.length} planes to collect`);
  assert(PLANE_TYPES.some(p => p.rarity === 'legendary'), 'There are legendary planes');

  // ===== READ-ALOUD COVERAGE =====
  // Not optional: the child cannot yet read the questions unaided, so a line
  // without a clip is a line he cannot access.
  const spoken = collectSpokenLines();
  assert(spoken.length > 0, 'Collected every spoken line');
  assert(spoken.every(t => !/{\w+}/.test(t)), 'No spoken line ships a placeholder');
  console.log(`(${spoken.length} distinct spoken lines — re-run tools/generate-audio.js if any changed)`);

  console.groupEnd();
  console.log(`Tests complete: ${passed} passed, ${failed} failed`);
  if (failed === 0) console.log('%c✅ All tests passed!', 'color: green; font-weight: bold');
  return { passed, failed };
}

if (typeof module !== 'undefined' && module.exports) module.exports = { runTests };
