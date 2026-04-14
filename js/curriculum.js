// curriculum.js
// All question data. Loaded before progress.js and game.js.

const PLANE_TYPES = [
  { id: 1,  emoji: '✈️',  name: 'בואינג' },
  { id: 2,  emoji: '🛩️', name: 'מטוס קטן' },
  { id: 3,  emoji: '🚁',  name: 'מסוק' },
  { id: 4,  emoji: '🛫',  name: 'מטוס ממריא' },
  { id: 5,  emoji: '🛬',  name: 'מטוס נוחת' },
  { id: 6,  emoji: '🚀',  name: 'טיל מחקר' },
  { id: 7,  emoji: '⛵',  name: 'ספינת ים' },
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
