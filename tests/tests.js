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

  // ===== MERGING TWO DEVICES =====
  // A tablet and a laptop have to be one child. The rule everywhere is "take
  // the side that represents more play" — never "the newer file wins", because
  // the newer file may be from the device he opened once by mistake.
  const laptop = Object.assign(PROGRESS._default(), {
    playerName: 'יונתן', currentStage: 8, stagesCompleted: [1, 2, 3],
    planesCollected: [1, 5, 9], shiftsCompleted: 20, flightHours: 900,
    bestCombo: 7, streakDays: 4, lastPlayedDay: '2026-08-04', bridgeTaught: true,
    log: [{ t: 1000, s: 8, q: 'bridge-sub', a: 16, b: 9, r: 7, n: 0, l: 0, v: 0, d: 5000 },
          { t: 2000, s: 8, q: 'bridge-sub', a: 15, b: 8, r: 7, n: 1, l: 1, v: 0, d: 9000 }],
  });
  const tablet = Object.assign(PROGRESS._default(), {
    playerName: 'יונתן', currentStage: 5, stagesCompleted: [1, 2, 4],
    planesCollected: [5, 12], shiftsCompleted: 6, flightHours: 300,
    bestCombo: 3, streakDays: 2, lastPlayedDay: '2026-08-02', bridgeTaught: false,
    log: [{ t: 2000, s: 8, q: 'bridge-sub', a: 15, b: 8, r: 7, n: 1, l: 1, v: 0, d: 9000 },
          { t: 3000, s: 9, q: 'addition', a: 40, b: 20, r: 60, n: 0, l: 0, v: 0, d: 4000 }],
  });

  const m = PROGRESS.merge(laptop, tablet);
  assert(m.currentStage === 8, 'Merge keeps the furthest port, not the last written');
  assert(m.stagesCompleted.join() === '1,2,3,4', 'Merge unions completed ports');
  assert(m.planesCollected.join() === '1,5,9,12', 'Merge unions the album with no duplicates');
  assert(m.flightHours === 900 && m.bestCombo === 7, 'Merge keeps the better totals');
  assert(m.lastPlayedDay === '2026-08-04', 'Merge keeps the later play date');
  assert(m.bridgeTaught === true, 'The ladder does not re-introduce itself after a merge');
  assert(m.log.length === 3, `Merge unions the log and drops the shared row (got ${m.log.length})`);
  assert(m.log.every((r, i, arr) => i === 0 || arr[i - 1].t <= r.t), 'Merged log stays in time order');

  // Direction must not matter, or a parent has to know which file to open first.
  const rev = PROGRESS.merge(tablet, laptop);
  assert(rev.currentStage === 8 && rev.log.length === 3 && rev.flightHours === 900,
    'Merging in the other direction gives the same result');

  // Importing the same backup twice must change nothing.
  const twice = PROGRESS.merge(m, tablet);
  assert(twice.log.length === 3 && twice.currentStage === 8, 'Re-importing a backup is a no-op');

  // A first-time device with an empty save must take everything.
  const fresh = PROGRESS.merge(PROGRESS._default(), laptop);
  assert(fresh.currentStage === 8 && fresh.playerName === 'יונתן' && fresh.log.length === 2,
    'A fresh device adopts the whole backup');

  // Junk must not wipe a save.
  assert(PROGRESS.merge(laptop, null).currentStage === 8, 'Merging null leaves the save alone');

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

  // ===== SYNC =====
  if (typeof SYNC !== 'undefined') {
    // The code is the only thing standing between a stranger and the slot.
    const codes = new Set();
    for (let i = 0; i < 200; i++) {
      const c = SYNC.makeCode();
      assert(SYNC.validCode(c), `Generated code "${c}" fails the server's own check`);
      assert(!/[OI01]/.test(c), 'Generated codes avoid characters that get mistyped');
      codes.add(c);
    }
    assert(codes.size === 200, 'Generated codes are distinct');

    assert(!SYNC.validCode('short'), 'A short code is rejected');
    assert(!SYNC.validCode('has spaces in it here'), 'A code with spaces is rejected');
    assert(!SYNC.validCode('../../etc/passwd'), 'A path is never a valid code');
    assert(!SYNC.validCode(''), 'An empty code is rejected');

    // http:// would be blocked by the browser once the game is served over
    // https, so it is refused here where the message can explain why.
    assert(!SYNC.validUrl('http://example.com/tower-sync.php'), 'Plain http is refused');
    assert(SYNC.validUrl('https://example.com/tower-sync.php'), 'https is accepted');
    assert(SYNC.validUrl('http://localhost:8790/'), 'localhost is allowed for testing');
    assert(!SYNC.validUrl('not a url'), 'Junk is refused');
    assert(!SYNC.validUrl(''), 'Empty is refused');

    // Half-configured must count as off, not as broken.
    SYNC.setConfig({ url: 'https://example.com/s.php', code: '' });
    assert(!SYNC.enabled(), 'A URL with no code is not enabled');
    SYNC.setConfig({ url: '', code: 'ABCDEFGHJKMNPQRS' });
    assert(!SYNC.enabled(), 'A code with no URL is not enabled');
    SYNC.setConfig({ url: 'https://example.com/s.php', code: 'ABCDEFGHJKMNPQRS' });
    assert(SYNC.enabled(), 'Both together are enabled');
    assert(SYNC.config().url === 'https://example.com/s.php', 'Config round-trips');

    // With no server configured, sync must decline rather than throw.
    SYNC.setConfig({ url: '', code: '' });
    const off = SYNC.sync({ log: [] });
    assert(off && typeof off.then === 'function', 'sync() always returns a promise');
  }

  // ===== ANALYTICS =====
  if (typeof ANALYTICS !== 'undefined') {
    const SKILL_IDS = ANALYTICS.SKILLS.map(s => s.id);

    // Every exercise the game can ask must land in a named skill. A question
    // that falls through to "other" is invisible in the report — the parent
    // would be told the child has not met something he practises every day.
    CURRICULUM.stages.forEach(stage => {
      stage.questions.forEach((q, j) => {
        const skill = ANALYTICS.skillOf({ q: q.type, a: q.a, b: q.b, r: q.result });
        assert(SKILL_IDS.includes(skill),
          `Stage ${stage.id} Q${j + 1} (${q.type} ${q.a},${q.b}) maps to "${skill}", not a known skill`);
      });
    });

    // And every skill must be reachable, or the report shows a row that can
    // never fill in.
    SKILL_IDS.forEach(id => {
      const found = CURRICULUM.stages.some(s => s.questions.some(q =>
        ANALYTICS.skillOf({ q: q.type, a: q.a, b: q.b, r: q.result }) === id));
      assert(found, `No question in the curriculum ever exercises skill "${id}"`);
    });

    // The bridging ports must map to the bridging skills — this is the pair the
    // whole report is watched for.
    const p8 = CURRICULUM.stages.find(s => s.id === 8);
    assert(p8.questions.every(q =>
      ANALYTICS.skillOf({ q: q.type, a: q.a, b: q.b, r: q.result }) === 'bridgeSub'),
      'Every port 8 question counts as crossing-ten subtraction');

    // The log is a rolling window: a save must not grow forever.
    const big = { log: [] };
    for (let i = 0; i < ANALYTICS.MAX_ROWS + 250; i++) {
      ANALYTICS.record(big, { t: i, s: 8, q: 'bridge-sub', a: 16, b: 9, r: 7, n: 0, d: 4000 });
    }
    assert(big.log.length === ANALYTICS.MAX_ROWS, `Log capped at ${ANALYTICS.MAX_ROWS}`);
    assert(big.log[big.log.length - 1].t === ANALYTICS.MAX_ROWS + 249, 'Newest row is kept');
    assert(big.log[0].t === 250, 'Oldest rows are the ones dropped');

    // A wandering-off answer must not be recorded as thinking for an hour.
    const capped = ANALYTICS.record({ log: [] },
      { t: 1, s: 1, q: 'addition', a: 2, b: 3, r: 5, n: 0, d: 60 * 60 * 1000 });
    assert(capped.log[0].d === ANALYTICS.MAX_THINK_MS, 'Absurd think times are clamped');

    // An empty log must produce a report, not an exception.
    const empty = ANALYTICS.analyse([]);
    assert(empty.total === 0 && !empty.enough, 'Empty log analyses to an empty report');
    assert(Array.isArray(empty.recommendations), 'Empty log still returns recommendations array');

    // A thin log must refuse to judge rather than judge wrongly.
    const thin = ANALYTICS.analyse(Array.from({ length: 4 }, (_, i) =>
      ({ t: i, s: 8, q: 'bridge-sub', a: 16, b: 9, r: 7, n: 2, l: 1, v: 0, d: 9000 })));
    assert(!thin.enough, 'Four answers is not enough to judge');
    assert(thin.recommendations.length === 1 &&
           thin.recommendations[0].title.includes('נְתוּנִים'),
      'A thin log says so instead of recommending drills');

    // A child who gets a skill wrong repeatedly must be flagged weak, and the
    // recommendation must name the port to practise.
    const struggling = Array.from({ length: 20 }, (_, i) =>
      ({ t: i * 60000, s: 8, q: 'bridge-sub', a: 16, b: 9, r: 7, n: 2, l: 1, v: 0, d: 15000 }));
    const sRep = ANALYTICS.analyse(struggling);
    const bs = sRep.skills.find(s => s.id === 'bridgeSub');
    assert(bs.status === 'weak', `Twenty missed bridge-subs reads as weak (got "${bs.status}")`);
    assert(sRep.recommendations.some(r => r.detail.includes('נָמֵל 8')),
      'The weak-skill recommendation names port 8');

    // And a child who has it must be told he has it, not drilled anyway.
    const fluent = Array.from({ length: 20 }, (_, i) =>
      ({ t: i * 60000, s: 8, q: 'bridge-sub', a: 15, b: 8, r: 7, n: 0, l: 0, v: 0, d: 4000 }));
    const fRep = ANALYTICS.analyse(fluent);
    assert(fRep.skills.find(s => s.id === 'bridgeSub').status === 'solid',
      'Twenty clean bridge-subs reads as solid');
    assert(!fRep.recommendations.some(r => r.title.startsWith('לְחַזֵּק')),
      'A fluent child gets no "needs work" recommendation');

    // Accurate but slow is its own diagnosis, and must not be called weak.
    const slow = Array.from({ length: 20 }, (_, i) =>
      ({ t: i * 60000, s: 8, q: 'bridge-sub', a: 15, b: 8, r: 7, n: 0, l: 0, v: 0, d: 25000 }));
    assert(ANALYTICS.analyse(slow).skills.find(s => s.id === 'bridgeSub').status === 'accurate-slow',
      'Right-but-slow is reported as slow, not as weak');

    // Revealed answers must never be counted as first-try successes.
    const revealed = Array.from({ length: 20 }, (_, i) =>
      ({ t: i * 60000, s: 8, q: 'bridge-sub', a: 16, b: 9, r: 7, n: 0, l: 0, v: 1, d: 5000 }));
    assert(ANALYTICS.analyse(revealed).firstTryPct === 0,
      'A revealed answer is not a first-try answer');
  }

  // ===== 3D LAYER =====
  // The 3D scenes are a bonus, so the only thing worth asserting without a GPU
  // is that they cannot be asked for something they do not have: every plane in
  // the album must map to a body plan that buildAircraft actually builds.
  if (typeof SCENE3D !== 'undefined') {
    const PLANS = ['airliner', 'jet', 'rocket', 'heli', 'saucer'];
    PLANE_TYPES.forEach(p => {
      assert(PLANS.includes(SCENE3D.bodyPlan(p)),
        `Plane ${p.id} (${p.emoji}) maps to unknown body plan "${SCENE3D.bodyPlan(p)}"`);
      const pal = SCENE3D.palette(p);
      assert(pal && typeof pal.body === 'number' && typeof pal.wing === 'number',
        `Plane ${p.id} has no usable 3D palette`);
    });
    // A shape nobody ever gets is a shape nobody should maintain.
    PLANS.forEach(plan => {
      assert(PLANE_TYPES.some(p => SCENE3D.bodyPlan(p) === plan),
        `No plane in the album is ever built as "${plan}"`);
    });
    ['startAirport', 'startLanding', 'endLanding', 'idle', 'supported']
      .forEach(fn => assert(typeof SCENE3D[fn] === 'function', `SCENE3D.${fn} exists`));
  }

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
