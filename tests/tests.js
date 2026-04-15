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
  assert(PROGRESS.getRankForStage(1).name === 'מתלמד', 'Stage 1 = מתלמד');
  assert(PROGRESS.getRankForStage(2).name === 'פקח', 'Stage 2 = פקח');
  assert(PROGRESS.getRankForStage(3).name === 'פקח', 'Stage 3 = פקח (no change until 4)');
  assert(PROGRESS.getRankForStage(4).name === 'פקח בכיר', 'Stage 4 = פקח בכיר');
  assert(PROGRESS.getRankForStage(6).name === 'מפקח', 'Stage 6 = מפקח');
  assert(PROGRESS.getRankForStage(8).name === 'מפקח ראשי', 'Stage 8 = מפקח ראשי');

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
  assert(data.rank === 'פקח', 'Rank updated to פקח after stage 1');

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

  // Stage 3 all results = 10
  const s3 = CURRICULUM.stages[2];
  assert(s3.questions.every(q => q.result === 10), 'Stage 3: all results = 10');

  // Stage 4 all a = 10
  const s4 = CURRICULUM.stages[3];
  assert(s4.questions.every(q => q.a === 10), 'Stage 4: all a = 10');

  // Stage 5 all decompose
  const s5 = CURRICULUM.stages[4];
  assert(s5.questions.every(q => q.type === 'decompose'), 'Stage 5: all decompose type');

  console.groupEnd();
  console.log(`Tests complete: ${passed} passed, ${failed} failed`);
  if (failed === 0) console.log('%c✅ All tests passed!', 'color: green; font-weight: bold');
}
