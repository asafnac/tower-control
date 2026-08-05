// curriculum.js
// All question data. Loaded before progress.js and game.js.

// ===== PLANE ALBUM =====
// rarity: undefined = רגיל, 'silver', 'gold', 'legendary'
// funFact = עובדה מהנה לפופ-אפ
const PLANE_TYPES = [
  // ✈ מסחרי / אזרחי
  { id: 1,  emoji: '✈️',  name: 'בּוֹאִינְג 747',
    funFact: 'מָלְכַּת הַשָּׁמַיִם! יְכוֹלָה לְהָסִיעַ 660 נוֹסְעִים בְּבַת אַחַת!' },
  { id: 2,  emoji: '🛩️', name: 'מָטוֹס סֵסְנָה',
    funFact: 'מָטוֹס קָטָן שֶׁטָּס נָמוּךְ — אֶפְשָׁר לִרְאוֹת אֶת הַבָּתִּים מִלְּמַעְלָה!' },
  { id: 3,  emoji: '🛫',  name: 'אֶיירְבָּס A380',
    funFact: 'יֵשׁ בּוֹ שְׁתֵּי קוֹמוֹת! הַמָּטוֹס הַגָּדוֹל בָּעוֹלָם עִם 850 מוֹשָׁבוֹת!' },
  { id: 4,  emoji: '🛬',  name: 'קוֹנְקוֹרְד',
    funFact: 'טָס פִּי שְׁנַיִם מִמַּהִירוּת הַקּוֹל — 3,600 ק"מ בְּכׇל שָׁעָה! מֻשְׁבָּת מֵאָז 2003.' },

  // 🚁 כוח סיבוב
  { id: 5,  emoji: '🚁',  name: 'מָסוֹק אַפָּצִ\'י',
    funFact: 'יָכוֹל לָעֶמֶד בָּאֲוִיר, לָנוּס לְאָחוֹר, וְלַעֲלוֹת בְּאֵינוֹ מִסְלוּל!' },

  // ⚡ מטוסי קרב
  { id: 6,  emoji: '⚡',  name: 'אֶף-16 בָּרָק',       rarity: 'gold',
    funFact: 'מָטוֹס קְרָב יִשְׂרְאֵלִי מְפֻרְסָם! טָס בְּ-2,400 ק"מ לְשָׁעָה וְשׁוֹמֵר עַל הַשָּׁמַיִם שֶׁלָּנוּ!' },
  { id: 7,  emoji: '🦅',  name: 'אֶף-15 נֶשֶׁר',
    funFact: '"הַנֶּשֶׁר" — מֶלֶךְ הַשָּׁמַיִם! בְּ-40 שָׁנָה לֹא נָפַל מֵעוֹלָם בְּקְרָב אֲוִירִי!' },
  { id: 8,  emoji: '👻',  name: 'אֶף-35 עֶרְפִּיאָד',  rarity: 'gold',
    funFact: 'מָטוֹס חֲמִיקָה — הָרָדָר לֹא רוֹאֶה אוֹתוֹ! כְּמוֹ רוּחַ שֶׁטָּס בַּשָּׁמַיִם.' },
  { id: 9,  emoji: '💫',  name: 'מִיג-29 פוּלְקְרוּם',
    funFact: 'מָטוֹס קְרָב רוּסִי — גִּמְנַסְטְקָאי הַשָּׁמַיִם! מְסֻגָּל לִזְוִיּוֹת שׁוּם מָטוֹס אַחֵר לֹא יָכוֹל!' },

  // 🚀 חלל
  { id: 10, emoji: '🚀',  name: 'רָקֶטָה שַׂלְוָה',
    funFact: 'כְּדֵי לְהַגִּיעַ לַחָלָל צָרִיךְ לִנְסוֹעַ בְּ-28,000 ק"מ לְשָׁעָה — 8 ק"מ בְּכׇל שְׁנִיָּה!' },
  { id: 11, emoji: '🛸',  name: 'טַסִּית מְעוֹפֶפֶת',  rarity: 'gold',
    funFact: 'אוּלַי בְּיוֹם אֶחָד נִפְגּוֹשׁ חַיָּזָרִים? מִי יוֹדֵעַ מַה מִסְתַּתֵּר בַּחָלָל הַגָּדוֹל...' },
  { id: 12, emoji: '🛰️', name: 'לְוַיָּן חָלָל',
    funFact: 'מְקִיף אֶת כַּדּוּר הָאָרֶץ כׇּל 90 דַּקּוֹת וּמְשַׁדֵּר לָנוּ GPS וּטֵלֵוִיזְיָה!' },
  { id: 13, emoji: '🌙',  name: 'חֲלִלִית אַפּוֹלּוֹ',  rarity: 'gold',
    funFact: 'ב-1969 נֵיל אַרְמְסְטְרוֹנְג דָּרַךְ עַל הַיָּרֵחַ! "קְפִיצָה קְטַנָּה לָאָדָם — קְפִיצָה עֲנָקִית לָאֱנוֹשׁוּת."' },

  // 🎩 היסטורי ומיוחד
  { id: 14, emoji: '🎈',  name: 'בָּלוֹן חַם',
    funFact: 'כְּלִי הַטִּיסָה הָרִאשׁוֹן בְּהִיסְטוֹרְיָה — הֻמְצָא בְּ-1783 בְּצָרְפַת!' },
  { id: 15, emoji: '🪂',  name: 'מָצְנֵחַ מְיֻחָד',
    funFact: 'קוֹפֵץ מִ-4,000 מֶטֶר עִם מָטוֹס וְנוֹחֵת כְּמוֹ נוֹצָה — רַק 4 דַּקּוֹת בָּאֲוִיר!' },
  { id: 16, emoji: '⚓',  name: 'מָטוֹס יָם',
    funFact: 'מָטוֹס שֶׁנּוֹחֵת עַל הַמַּיִם! מְשַׁמֵּשׁ לְהַצָּלַת אֲנָשִׁים בַּיָּם הַפָּתוּחַ.' },

  // 🌟 אגדי / נדיר
  { id: 17, emoji: '🌈',  name: 'מָטוֹס הַקֶּשֶׁת',    rarity: 'gold',
    funFact: 'נֶאֱמָר שֶׁזֶּה הַמָּטוֹס שֶׁטָּס בִּשְׁבִיל הַקֶּשֶׁת — רַק פַּקָּחִים מְצֻיָּנִים זוֹכִים בּוֹ!' },
  { id: 18, emoji: '🪄',  name: 'מָטוֹס הַקֶּסֶם',     rarity: 'gold',
    funFact: 'מָטוֹס אַגַּדִּי שֶׁטָּס בְּלִי דֶּלֶק! מִי שֶׁמּוֹצֵא אוֹתוֹ קִבֵּל כּׂשֶׁר טִיסָה לְנֶצַח!' },
  { id: 19, emoji: '🦁',  name: 'מָטוֹס אַרְיֵה',
    funFact: 'קָרוּי עַל שֵׁם מֶלֶךְ הַחַיּוֹת — הַחָזָק וְהַנּוֹרָא בְּיוֹתֵר בַּשָּׁמַיִם!' },
  { id: 20, emoji: '👑',  name: 'מָטוֹס הַמֶּלֶךְ',    rarity: 'gold',
    funFact: 'הַנָּדִיר בְּיוֹתֵר בָּאַלְבּוּם — רַק מְפַקֵּחַ רָאשִׁי אֲמִתִּי יָכוֹל לִמְצוֹא אוֹתוֹ! 👑' },

  // ===== מטוסים מטורפים — הרחבה =====
  { id: 21, emoji: '🌩️', name: 'אֶס־אָר 71 בְּלֶקְבֶּרְד', rarity: 'legendary',
    funFact: 'הַמָּטוֹס הַמָּהִיר בְּיוֹתֵר שֶׁטָּס אֵי פַּעַם — 3,500 ק"מ לְשָׁעָה! הוּא הִתְחַמֵּם כׇּל כָּךְ שֶׁהַמַּתֶּכֶת שֶׁלּוֹ הִתְרַחֲבָה בָּאֲוִיר.' },
  { id: 22, emoji: '🦇',  name: 'בִּי-2 רוּחַ',          rarity: 'gold',
    funFact: 'מַפְצִיץ חֲמִיקָה בְּצוּרַת בּוּמֶרַנְג — בְּלִי זָנָב בִּכְלָל! נִרְאֶה כְּמוֹ עֲטַלֵּף עֲנָק בַּשָּׁמַיִם.' },
  { id: 23, emoji: '🦖',  name: 'אֶף-22 רַפְּטוֹר',      rarity: 'gold',
    funFact: 'הַטּוֹרֵף שֶׁל הַשָּׁמַיִם! יָכוֹל לָטוּס מַהֵר מִמְּהִירוּת הַקּוֹל בְּלִי לְהַדְלִיק מְאִיץ.' },
  { id: 24, emoji: '📦',  name: 'אַנְטוֹנוֹב מְרִיָּה',  rarity: 'legendary',
    funFact: 'הַמָּטוֹס הֲכִי גָּדוֹל שֶׁנִּבְנָה אֵי פַּעַם! 6 מְנוֹעִים וְ-32 גַּלְגַּלִּים — וְנִבְנָה רַק אֶחָד כָּזֶה בָּעוֹלָם.' },
  { id: 25, emoji: '🕹️', name: 'כְּטַב"ם רַחְפָן',
    funFact: 'טָס בְּלִי טַיָּס בִּכְלָל! מִישֶׁהוּ מְנַהֵג אוֹתוֹ מֵהַקַּרְקַע, לִפְעָמִים מֵאֶלֶף ק"מ מֶרְחָק.' },
  { id: 26, emoji: '⬆️',  name: 'הָארְיֵיר קוֹפֵץ',
    funFact: 'מַמְרִיא יָשָׁר לְמַעְלָה כְּמוֹ מָסוֹק — וְאָז טָס קָדִימָה כְּמוֹ מָטוֹס קְרָב!' },
  { id: 27, emoji: '🔭',  name: 'יוּ-2 מְרַגֵּל',
    funFact: 'טָס כׇּל כָּךְ גָּבוֹהַּ — 21 ק"מ! — שֶׁהַטַּיָּס חַיָּב לִלְבּוֹשׁ חֲלִיפַת חָלָל אֲמִתִּית.' },
  { id: 28, emoji: '🚚',  name: 'הֶרְקוּלֶס תּוֹבָלָה',
    funFact: 'מָטוֹס עֲנָק שֶׁיָּכוֹל לָנְחוֹת עַל מַסְלוּל עָפָר, בַּמִּדְבָּר, וַאֲפִלּוּ עַל קֶרַח.' },
  { id: 29, emoji: '🌊',  name: 'מָטוֹס כִּבּוּי אֵשׁ',
    funFact: 'שׁוֹאֵב 6 טוֹן מַיִם מֵהַיָּם תּוֹךְ 12 שְׁנִיּוֹת בִּלְבַד — בְּלִי לַעֲצוֹר לִנְחִיתָה!' },
  { id: 30, emoji: '⛑️',  name: 'מָסוֹק הַצָּלָה',
    funFact: 'מוֹרִיד לוֹחֲמִים בְּכֶבֶל וּמְחַלֵּץ אֲנָשִׁים מֵהַיָּם וּמֵהָהָר — גַּם בַּלַּיְלָה.' },
  { id: 31, emoji: '🚑',  name: 'מָטוֹס אַמְבּוּלַנְס',
    funFact: 'בֵּית חוֹלִים מְעוֹפֵף! יֵשׁ בְּתוֹכוֹ מִטָּה, רוֹפֵא וּמַכְשִׁירִים — וְהוּא טָס מַהֵר מִכֻּלָּם.' },
  { id: 32, emoji: '🛡️',  name: 'מְיָרֵט כִּפַּת בַּרְזֶל',
    funFact: 'מְחַשֵּׁב תּוֹךְ שְׁנִיּוֹת בּוֹדְדוֹת לְאָן טִיל מִתְקָרֵב, וּמְיָרֵט אוֹתוֹ בְּאֶמְצַע הָאֲוִיר.' },
  { id: 33, emoji: '☀️',  name: 'מָטוֹס סוֹלָארִי',
    funFact: 'טָס רַק עַל אֶנֶרְגְּיַת שֶׁמֶשׁ — בְּלִי טִיפַּת דֶּלֶק! הוּא הִקִּיף אֶת כׇּל כַּדּוּר הָאָרֶץ.' },
  { id: 34, emoji: '🔋',  name: 'מָטוֹס חַשְׁמַלִּי',
    funFact: 'טָס עַל סוֹלְלָה, כִּמְעַט בְּלִי רַעַשׁ בִּכְלָל — הַמָּטוֹס שֶׁל הֶעָתִיד!' },
  { id: 35, emoji: '🪁',  name: 'אוּלְטְרָלַייט',
    funFact: 'כְּמוֹ עֲפִיפוֹן עִם מָנוֹעַ! קַל כׇּל כָּךְ שֶׁשְּׁנֵי אֲנָשִׁים יְכוֹלִים לְהָרִים אוֹתוֹ.' },
  { id: 36, emoji: '📄',  name: 'אֲוִירוֹן נְיָר',
    funFact: 'שִׂיא הָעוֹלָם בִּזְרִיקַת אֲוִירוֹן נְיָר הוּא יוֹתֵר מ-70 מֶטֶר — כִּמְעַט מִגְרַשׁ כַּדּוּרֶגֶל!' },
  { id: 37, emoji: '🚀',  name: 'מַעְבֹּרֶת הַחָלָל',    rarity: 'gold',
    funFact: 'הִמְרִיאָה כְּמוֹ רָקֶטָה וְנָחֲתָה כְּמוֹ מָטוֹס! עָשְׂתָה 135 טִיסוֹת לַחָלָל וַחֲזָרָה.' },
  { id: 38, emoji: '🛖',  name: 'תַּחֲנַת הֶחָלָל',
    funFact: 'הָאַסְטְרוֹנָאוּטִים בְּתוֹכָהּ רוֹאִים 16 זְרִיחוֹת בְּכׇל יוֹם — הִיא מַקִּיפָה אֶת כַּדּוּר הָאָרֶץ כׇּל 90 דַּקּוֹת!' },
  { id: 39, emoji: '🔴',  name: 'מָסוֹק הַמַּאְדִּים',   rarity: 'legendary',
    funFact: 'מָסוֹק זָעִיר שֶׁטָּס בֶּאֱמֶת עַל כּוֹכַב הַמַּאְדִּים! הוּא עָשָׂה 72 טִיסוֹת בְּעוֹלָם אַחֵר.' },
  { id: 40, emoji: '☄️',  name: 'שׁוֹבֵר הַכּוֹכָבִים',
    funFact: 'חֲלָלִית שֶׁטָּסָה בֵּין הַכּוֹכָבִים וְעָבְרָה לְיַד מְטֵאוֹרִים בִּמְהִירוּת מְטוֹרֶפֶת.' },
  { id: 41, emoji: '🐉',  name: 'דְּרָקוֹן הַשָּׁמַיִם', rarity: 'legendary',
    funFact: 'הָאַגָּדָה מְסַפֶּרֶת שֶׁהוּא מוֹפִיעַ רַק לְפַקָּח שֶׁלֹּא וִיתֵּר אַף פַּעַם. מָצָאתָ אוֹתוֹ!' },
  { id: 42, emoji: '⏳',  name: 'מָטוֹס הַזְּמַן',      rarity: 'legendary',
    funFact: 'טָס כׇּל כָּךְ מַהֵר שֶׁהוּא נוֹחֵת לִפְנֵי שֶׁהוּא מַמְרִיא! רַק פַּקָּח אֶחָד רָאָה אוֹתוֹ.' },
  { id: 43, emoji: '💎',  name: 'מָטוֹס הַיַּהֲלוֹם',   rarity: 'gold',
    funFact: 'הַכָּנָפַיִם שֶׁלּוֹ מַבְרִיקוֹת כְּמוֹ יַהֲלוֹם, וְהוּא מְשַׁקֵּף אֶת אוֹר הַשֶּׁמֶשׁ לְכׇל הַכִּוּוּנִים.' },
  { id: 44, emoji: '🌌',  name: 'חֲלָלִית בֵּין־כּוֹכָבִית', rarity: 'legendary',
    funFact: 'טָסָה מֵעֵבֶר לְכׇל כּוֹכְבֵי הַלֶּכֶת, וְעוֹד מְשַׁדֶּרֶת לָנוּ מִמֶּרְחָק שֶׁל מִילְיַארְדֵי ק"מ.' },
];

// Rarity presentation. 'normal' is the absence of a rarity field.
const RARITY = {
  normal:    { label: 'מָטוֹס חָדָשׁ',            cls: '',           weight: 60 },
  silver:    { label: '⚪ מָטוֹס כֶּסֶף',          cls: 'silver',     weight: 25 },
  gold:      { label: '✨ כֶּרְטִיס זָהָב נָדִיר', cls: 'gold',       weight: 12 },
  legendary: { label: '🌟 מָטוֹס אַגָּדִי!',       cls: 'legendary',  weight: 3  },
};

// Every line the game ever says out loud lives here, not in game.js, so that
// tools/generate-audio.js has one place to enumerate. Adding a line here and
// re-running the generator is all it takes to give it a voice.
const MESSAGES = {
  correct: [
    'מְצֻיָּן מִגְדַּל הַפִּיקּוּחַ! יוֹרְדִים לִנְחִיתָה!',
    'כׇּל הַכָּבוֹד! הַמָּטוֹס נוֹחֵת בְּבִטָּחָה!',
    'עֲבוֹדָה מְצֻיֶּנֶת פַּקָּח! אִישּׁוּר נְחִיתָה!',
    'מְעֻלֶּה! הַמָּטוֹס מְקַבֵּל אִישּׁוּר!',
    'פַנְטַסְטִי! נְחִיתָה חֲלָקָה!'
  ],

  // Said instead of the plain "correct" line while a streak is running. The
  // escalation is the point: the child hears his own momentum.
  combo: {
    3: 'שְׁלוֹשָׁה בָּרָצַף! הַמַּסְלוּל פָּנוּי בִּשְׁבִילְךָ!',
    5: 'חֲמִשָּׁה בָּרָצַף! כׇּל הַמְּטוֹסִים מְבַקְשִׁים דַּוְקָא אוֹתְךָ!',
    7: 'שִׁבְעָה בָּרָצַף! הַמִּגְדָּל כֻּלּוֹ מוֹחֵא לְךָ כַּפַּיִם!',
  },

  retry: [
    'מִגְדַּל הַפִּיקּוּחַ, חֲזוֹר — לֹא קָלַטְנוּ הֵיטֵב.',
    'מִגְדַּל הַפִּיקּוּחַ, אֱמוֹר שָׁנִית?',
    'מִגְדַּל הַפִּיקּוּחַ, יֵשׁ הַפְרָעוֹת בַּקֶּשֶׁר — חֲזוֹר בְּבַקָּשָׁה.',
  ],

  reveal: 'הַתְּשׁוּבָה הִיא {result}. הַמָּטוֹס נוֹחֵת בְּכׇל זֹאת — כׇּל הַכָּבוֹד שֶׁנִּיסִּיתָ!',

  landing: {
    normal: '🎉 נְחִיתָה מוּשְׁלֶמֶת! כׇּל הַכָּבוֹד!',
    gold:   '✨ נְחִיתַת זָהָב מוּשְׁלֶמֶת! אַתָּה מַדְהִים! ✨',
  },

  // ===== תחנת העשרה — הסולם =====
  // The scaffold for crossing a ten. Shown on demand ("פָּרֵק לִי") and opened
  // automatically after a first wrong answer. Every prompt is a real question
  // the child answers, so the method is walked, not watched.
  bridge: {
    down: {
      intro: 'נַעֲבֹר דֶּרֶךְ תַּחֲנַת הָעֲשָׂרָה. קֹדֶם יוֹרְדִים בְּדִיּוּק עַד גּוֹבַהּ {stop}.',
      step1: 'מִגּוֹבַהּ {a} — כַּמָּה יְחִידוֹת לָרֶדֶת כְּדֵי לַעֲצוֹר בְּגוֹבַהּ {stop}?',
      step2: 'יָרַדְנוּ {s1} מִתּוֹךְ {b}. כַּמָּה עוֹד נִשְׁאַר לָרֶדֶת?',
      step3: 'מִגּוֹבַהּ {stop} יוֹרְדִים {s2}. לְאֵיזֶה גּוֹבַהּ מַגִּיעִים?',
      done:  'זֶהוּ הַסּוֹד! {a} פָּחוֹת {b} שָׁוֶה {result}. עָבַרְנוּ דֶּרֶךְ תַּחֲנַת הָעֲשָׂרָה.',
    },
    up: {
      intro: 'נַעֲבֹר דֶּרֶךְ תַּחֲנַת הָעֲשָׂרָה. קֹדֶם מְטַפְּסִים בְּדִיּוּק עַד גּוֹבַהּ {stop}.',
      step1: 'מִגּוֹבַהּ {a} — כַּמָּה יְחִידוֹת לְטַפֵּס כְּדֵי לְהַגִּיעַ לְגוֹבַהּ {stop}?',
      step2: 'טִיפַּסְנוּ {s1} מִתּוֹךְ {b}. כַּמָּה עוֹד נִשְׁאַר לְטַפֵּס?',
      step3: 'מִגּוֹבַהּ {stop} מְטַפְּסִים {s2}. לְאֵיזֶה גּוֹבַהּ מַגִּיעִים?',
      done:  'זֶהוּ הַסּוֹד! {a} וְעוֹד {b} שָׁוֶה {result}. עָבַרְנוּ דֶּרֶךְ תַּחֲנַת הָעֲשָׂרָה.',
    },
  },

  // ===== משימות יומיות =====
  // Chosen by the calendar day, so it is the same mission all day and a new one
  // tomorrow. Never punishing: an unfinished mission simply stays open.
  missions: [
    { id: 'shift',  text: 'הַשְׁלֵם מִשְׁמֶרֶת שְׁלֵמָה', check: r => r.answered >= r.total },
    { id: 'six',    text: 'עֲנֵה נָכוֹן עַל 6 קְרִיאוֹת בְּמִשְׁמֶרֶת אַחַת', check: r => r.correct >= 6 },
    { id: 'combo4', text: 'הַשֵּׂג רֶצֶף שֶׁל 4 תְּשׁוּבוֹת נְכוֹנוֹת', check: r => r.bestCombo >= 4 },
    { id: 'first',  text: 'עֲנֵה נָכוֹן בַּנִּסָּיוֹן הָרִאשׁוֹן 5 פְּעָמִים', check: r => r.firstTry >= 5 },
    { id: 'perfect',text: 'מִשְׁמֶרֶת עִם 7 נְחִיתוֹת בְּטוּחוֹת', check: r => r.correct >= 7 },
  ],
};

// Radio text uses {a}, {b}, {result} as placeholders — replaced at runtime.
// visual: 'planes' shows plane dots on radar, 'altitude' shows the altitude meter.
// altMax: top of the altitude meter (20 for the units ports, 100 for flight levels).
// hint: 'dots' shows a dot grid, 'decompose' shows the 10+units split,
//       'bridge' opens the safety-station ladder.

const CURRICULUM = {
  stages: [
    {
      id: 1,
      name: 'נָמֵל תֵּל אָבִיב',
      title: 'חִיבּוּר עַד 10',
      visual: 'planes',
      questions: [
        { type: 'addition', a: 2, b: 3, result: 5,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ, כָּאן טִיסָה 1. יֵשׁ לִי {a} מְטוֹסִים בַּצָּפוֹן וְעוֹד {b} מַגִּיעִים מֵהַדָּרוֹם. כַּמָּה מְטוֹסִים סַךְ הַכֹּל?' },
        { type: 'addition', a: 1, b: 4, result: 5,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ! {a} מָטוֹס מְמַתִּין וְעוֹד {b} בַּדֶּרֶךְ אֵלֵינוּ. כַּמָּה יִהְיוּ בַּשָּׁמַיִם?' },
        { type: 'addition', a: 3, b: 3, result: 6,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ, כָּאן טִיסָה 7. {a} מְטוֹסִים מִמִּזְרָח וְעוֹד {b} מִמַּעֲרָב. כַּמָּה בְּסַךְ הַכֹּל?' },
        { type: 'addition', a: 4, b: 2, result: 6,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ! מוֹנֶה {a} מְטוֹסִים עַל הַמָּסָךְ וְעוֹד {b} בַּדֶּרֶךְ. כַּמָּה יִהְיוּ?' },
        { type: 'addition', a: 3, b: 4, result: 7,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ, {a} מְטוֹסִים נִמְצָאִים אִיתָּנוּ וְעוֹד {b} הִזְמִינוּ נְחִיתָה. כַּמָּה סַךְ הַכֹּל?' },
        { type: 'addition', a: 5, b: 2, result: 7,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ! {a} מְטוֹסִים בַּשָּׁמַיִם, עוֹד {b} בַּדֶּרֶךְ. כַּמָּה יִהְיוּ?' },
        { type: 'addition', a: 4, b: 4, result: 8,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ, {a} מְטוֹסִים בַּדֶּרֶךְ מִצָּפוֹן וְ-{b} מִדָּרוֹם. כַּמָּה בְּסַךְ הַכֹּל?' },
        { type: 'addition', a: 2, b: 6, result: 8,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ! {a} מְטוֹסִים כְּבָר כָּאן וְעוֹד {b} הִזְמִינוּ כְּנִיסָה. כַּמָּה יִהְיוּ?' },
        { type: 'addition', a: 5, b: 4, result: 9,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ, {a} מְטוֹסִים מְמַתִּינִים, עוֹד {b} מִתְקָרְבִים. כַּמָּה סַךְ הַכֹּל?' },
        { type: 'addition', a: 3, b: 6, result: 9,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ! {a} מְטוֹסִים בַּשָּׁמַיִם, עוֹד {b} בַּדֶּרֶךְ. כַּמָּה יִהְיוּ?' },
        { type: 'addition', a: 5, b: 5, result: 10, hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ, {a} מְטוֹסִים בְּצַד יָמִין וְ-{b} בְּצַד שְׂמֹאל. כַּמָּה בְּסַךְ הַכֹּל?' },
        { type: 'addition', a: 6, b: 4, result: 10, hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ! {a} מְטוֹסִים גְּדוֹלִים וְעוֹד {b} קְטַנִּים. כַּמָּה מְטוֹסִים יֵשׁ לְפַקֵּחַ?' },
      ]
    },
    {
      id: 2,
      name: 'נָמֵל חֵיפָה',
      title: 'חִיסוּר עַד 10',
      visual: 'planes',
      questions: [
        { type: 'subtraction', a: 5,  b: 2, result: 3,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ, הָיוּ {a} מְטוֹסִים בַּשָּׁמַיִם. {b} כְּבָר נָחֲתוּ בְּבִטָּחָה. כַּמָּה עוֹד בַּדֶּרֶךְ?' },
        { type: 'subtraction', a: 6,  b: 3, result: 3,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ! {a} מְטוֹסִים הָיוּ בַּמָּסָךְ, {b} סִיְּמוּ מִשְׁמֶרֶת. כַּמָּה נוֹתְרוּ?' },
        { type: 'subtraction', a: 7,  b: 4, result: 3,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ, עָקַבְתִּי אַחֲרֵי {a} מְטוֹסִים. {b} נָחֲתוּ. כַּמָּה עֲדַיִין בַּשָּׁמַיִם?' },
        { type: 'subtraction', a: 8,  b: 3, result: 5,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ! {a} מְטוֹסִים הָיוּ, {b} הִגִּיעוּ לַיַּעַד. כַּמָּה נִשְׁאֲרוּ?' },
        { type: 'subtraction', a: 9,  b: 4, result: 5,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ, {a} מְטוֹסִים בַּשָּׁמַיִם, {b} קִבְּלוּ אִישּׁוּר נְחִיתָה. כַּמָּה מְמַתִּינִים?' },
        { type: 'subtraction', a: 8,  b: 2, result: 6,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ! {a} מְטוֹסִים הָיוּ, {b} יָצְאוּ. כַּמָּה נִשְׁאֲרוּ?' },
        { type: 'subtraction', a: 10, b: 4, result: 6,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ, {a} מְטוֹסִים בַּשָּׁמַיִם, {b} נָחֲתוּ. כַּמָּה עוֹד?' },
        { type: 'subtraction', a: 10, b: 3, result: 7,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ! {a} מְטוֹסִים, {b} סִיְּמוּ. כַּמָּה מַמְשִׁיכִים?' },
        { type: 'subtraction', a: 9,  b: 2, result: 7,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ, {a} מְטוֹסִים, {b} נָחֲתוּ. כַּמָּה נִשְׁאֲרוּ?' },
        { type: 'subtraction', a: 10, b: 2, result: 8,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ! {a} מְטוֹסִים בַּשָּׁמַיִם, {b} קִבְּלוּ אִישּׁוּר. כַּמָּה מְמַתִּינִים עוֹד?' },
        { type: 'subtraction', a: 9,  b: 1, result: 8,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ, {a} מְטוֹסִים, {b} יָצָא. כַּמָּה נִשְׁאֲרוּ?' },
        { type: 'subtraction', a: 10, b: 1, result: 9,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ! {a} מְטוֹסִים, {b} נָחַת. כַּמָּה עוֹד בַּשָּׁמַיִם?' },
      ]
    },
    {
      id: 3,
      name: 'נָמֵל יְרוּשָׁלַיִם',
      title: 'תַּחֲנַת הַבִּטָּחוֹן — יְרִידָה לְ-10',
      visual: 'altitude',
      altMax: 20,
      safetyStation: true,
      questions: [
        { type: 'decompose',   a: 11, b: 10,  result: 1,  destAlt: 10, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֲנִי בְּגוֹבַה {a}. צָרִיךְ לְהַגִּיעַ לְרָמַת הַבִּטָּחוֹן — גוֹבַה 10. כַּמָּה לְהוֹרִיד?' },
        { type: 'decompose',   a: 12, b: 10,  result: 2,  destAlt: 10, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גוֹבַה {a}. כַּמָּה לְהוֹרִיד כְּדֵי לְהַגִּיעַ לְגוֹבַה הַבִּטָּחוֹן — גוֹבַה 10?' },
        { type: 'decompose',   a: 13, b: 10,  result: 3,  destAlt: 10, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גוֹבַה {a}. כַּמָּה יְחִידוֹת לָרֶדֶת כְּדֵי לְהַגִּיעַ לְרָמַת הַבִּטָּחוֹן?' },
        { type: 'decompose',   a: 14, b: 10,  result: 4,  destAlt: 10, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! אֲנִי בְּגוֹבַה {a}. כַּמָּה צָרִיךְ לְהוֹרִיד כְּדֵי לְהַגִּיעַ לְגוֹבַה 10?' },
        { type: 'decompose',   a: 15, b: 10,  result: 5,  destAlt: 10, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גוֹבַה {a}. הַמָּטוֹס חַיָּב לַעֲצוֹר בְּגוֹבַה 10. כַּמָּה לְהוֹרִיד?' },
        { type: 'decompose',   a: 16, b: 10,  result: 6,  destAlt: 10, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גוֹבַה {a}. כַּמָּה לְהוֹרִיד כְּדֵי לְהַגִּיעַ לְרָמַת הַבִּטָּחוֹן?' },
        { type: 'decompose',   a: 17, b: 10,  result: 7,  destAlt: 10, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֲנִי בְּגוֹבַה {a}. כַּמָּה יְחִידוֹת לְהוֹרִיד כְּדֵי לְהַגִּיעַ לְגוֹבַה 10?' },
        { type: 'decompose',   a: 18, b: 10,  result: 8,  destAlt: 10, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גוֹבַה {a}. כַּמָּה לָרֶדֶת עַד לְרָמַת הַבִּטָּחוֹן?' },
        { type: 'decompose',   a: 19, b: 10,  result: 9,  destAlt: 10, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גוֹבַה {a}. כַּמָּה יְחִידוֹת גוֹבַה לְהוֹרִיד כְּדֵי לַעֲצוֹר בְּגוֹבַה 10?' },
      ]
    },
    {
      id: 4,
      name: 'נָמֵל בְּאֵר שֶׁבַע',
      title: 'תַּחֲנַת הַבִּטָּחוֹן — עֲלִיָּה מִ-10',
      visual: 'altitude',
      altMax: 20,
      safetyStation: true,
      questions: [
        { type: 'addition', a: 10, b: 1,  result: 11, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֲנִי בְּרָמַת הַבִּטָּחוֹן — גוֹבַה 10. צָרִיךְ לִטְפֹּס {b} יְחִידוֹת. לְאֵיזֶה גוֹבַה אַגִּיעַ?' },
        { type: 'addition', a: 10, b: 2,  result: 12, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גוֹבַה 10, מְטַפֵּס {b} יְחִידוֹת. מַה הַגּוֹבַהּ הֶחָדָשׁ?' },
        { type: 'addition', a: 10, b: 3,  result: 13, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, מֵרָמַת הַבִּטָּחוֹן אֲנִי עוֹלֶה {b} יְחִידוֹת. לְאֵיזֶה גוֹבַה אַגִּיעַ?' },
        { type: 'addition', a: 10, b: 4,  result: 14, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גוֹבַה 10, עוֹלֶה {b}. לְאֵיזֶה גוֹבַה?' },
        { type: 'addition', a: 10, b: 5,  result: 15, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, מִגוֹבַה 10 אֲנִי מְטַפֵּס {b} יְחִידוֹת. לְאֵיזֶה גוֹבַה אַגִּיעַ?' },
        { type: 'addition', a: 10, b: 6,  result: 16, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! בְּרָמַת הַבִּטָּחוֹן — גוֹבַה 10. עוֹלֶה {b}. לְאֵיזֶה גוֹבַה?' },
        { type: 'addition', a: 10, b: 7,  result: 17, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גוֹבַה 10, מְטַפֵּס {b} יְחִידוֹת. מַה הַגּוֹבַהּ?' },
        { type: 'addition', a: 10, b: 8,  result: 18, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! מִגוֹבַה 10 עוֹלֶה {b}. לְאֵיזֶה גוֹבַה אַגִּיעַ?' },
        { type: 'addition', a: 10, b: 9,  result: 19, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גוֹבַה 10. טִיפּוּס שֶׁל {b} יְחִידוֹת. לְאֵיזֶה גוֹבַה?' },
      ]
    },
    {
      id: 5,
      name: 'נָמֵל אֵילַת',
      title: 'פֵּירוּק מִסְפָּרִים — 10 וְעוֹד',
      visual: 'altitude',
      altMax: 20,
      safetyStation: true,
      questions: [
        { type: 'decompose', a: 11, b: 10, result: 1,  destAlt: 10,  hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֲנִי בְּגוֹבַה {a}. יָדוּעַ שֶׁיֵּשׁ לִי 10 יְחִידוֹת בָּסִיס. כַּמָּה יְחִידוֹת יֵשׁ לִי מֵעַל גוֹבַה 10?' },
        { type: 'decompose', a: 12, b: 10, result: 2,  destAlt: 10,  hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גוֹבַה {a} — זֶה 10 וְעוֹד כַּמָּה?' },
        { type: 'decompose', a: 13, b: 10, result: 3,  destAlt: 10,  hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, {a} זֶה 10 בַּתַּחְתִּית וְעוֹד כַּמָּה יְחִידוֹת מֵעַל?' },
        { type: 'decompose', a: 14, b: 10, result: 4,  destAlt: 10,  hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גוֹבַה {a} — כַּמָּה יְחִידוֹת יֵשׁ מֵעַל רָמַת הַבִּטָּחוֹן?' },
        { type: 'decompose', a: 15, b: 10, result: 5,  destAlt: 10,  hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, {a} שָׁוֶה 10 וְעוֹד כַּמָּה?' },
        { type: 'decompose', a: 16, b: 10, result: 6,  destAlt: 10,  hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גוֹבַה {a}. פָּרֵק לִי אֶת הַגּוֹבַהּ — 10 וְעוֹד כַּמָּה?' },
        { type: 'decompose', a: 17, b: 10, result: 7,  destAlt: 10,  hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גוֹבַה {a}. כַּמָּה יְחִידוֹת מֵעַל לְגוֹבַה 10?' },
        { type: 'decompose', a: 18, b: 10, result: 8,  destAlt: 10,  hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! {a} זֶה 10 וְעוֹד כַּמָּה יְחִידוֹת?' },
        { type: 'decompose', a: 19, b: 10, result: 9,  destAlt: 10,  hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גוֹבַה {a} — פָּרֵק לִי — 10 וְעוֹד כַּמָּה?' },
      ]
    },
    {
      id: 6,
      name: 'נָמֵל הַצָּפוֹן',
      title: 'חִיסוּר בָּעֶשֶׂרֶת הַשְּׁנִיָּה',
      visual: 'altitude',
      altMax: 20,
      safetyStation: true,
      questions: [
        { type: 'subtraction', a: 14, b: 3,  result: 11, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גוֹבַה {a}. יוֹרֵד {b} יְחִידוֹת. מַה הַגּוֹבַהּ הֶחָדָשׁ?' },
        { type: 'subtraction', a: 15, b: 4,  result: 11, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גוֹבַה {a}, יוֹרֵד {b}. לְאֵיזֶה גוֹבַה?' },
        { type: 'subtraction', a: 16, b: 5,  result: 11, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, מִגוֹבַה {a} אֲנִי יוֹרֵד {b} יְחִידוֹת. לְאֵיזֶה גוֹבַה?' },
        { type: 'subtraction', a: 15, b: 3,  result: 12, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גוֹבַה {a}, יְרִידָה שֶׁל {b}. מַה הַגּוֹבַהּ?' },
        { type: 'subtraction', a: 16, b: 4,  result: 12, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, {a} פָּחוֹת {b}. לְאֵיזֶה גוֹבַה אַגִּיעַ?' },
        { type: 'subtraction', a: 17, b: 5,  result: 12, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גוֹבַה {a}, יוֹרֵד {b} יְחִידוֹת. לְאָן?' },
        { type: 'subtraction', a: 18, b: 5,  result: 13, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גוֹבַה {a}. יְרִידָה שֶׁל {b}. לְאֵיזֶה גוֹבַה?' },
        { type: 'subtraction', a: 17, b: 4,  result: 13, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! {a} יוֹרֵד {b}. מַה הַגּוֹבַהּ הֶחָדָשׁ?' },
        { type: 'subtraction', a: 19, b: 4,  result: 15, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גוֹבַה {a}. יוֹרֵד {b}. לְאֵיזֶה גוֹבַה?' },
        { type: 'subtraction', a: 18, b: 3,  result: 15, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! {a} פָּחוֹת {b}. לְאָן מַגִּיעַ?' },
      ]
    },

    // ===== 7 =====
    // Crossing a ten upward, taught through the safety station the child already
    // trusts: climb to exactly 10 first, then climb the rest. The ladder is a
    // hint, not a forced march — the question is asked straight, and the
    // scaffold opens on demand or after a first miss.
    {
      id: 7,
      name: 'נָמֵל הַבִּירָה',
      title: 'חֲצִיַּת עֲשָׂרָה — חִיבּוּר',
      visual: 'altitude',
      altMax: 20,
      bridge: 'up',
      questions: [
        { type: 'bridge-add', a: 8, b: 5, result: 13, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֲנִי בְּגוֹבַהּ {a} וּמְטַפֵּס {b} יְחִידוֹת. לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
        { type: 'bridge-add', a: 7, b: 6, result: 13, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גּוֹבַהּ {a}, טִיפּוּס שֶׁל {b} יְחִידוֹת. לְאֵיזֶה גּוֹבַהּ?' },
        { type: 'bridge-add', a: 9, b: 4, result: 13, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ, מִגּוֹבַהּ {a} אֲנִי עוֹלֶה {b} יְחִידוֹת. מַה הַגּוֹבַהּ הֶחָדָשׁ?' },
        { type: 'bridge-add', a: 9, b: 5, result: 14, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גּוֹבַהּ {a} וְעוֹד {b} יְחִידוֹת טִיפּוּס. לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
        { type: 'bridge-add', a: 6, b: 8, result: 14, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֲנִי בְּגוֹבַהּ {a} וְצָרִיךְ לַעֲלוֹת {b}. לְאֵיזֶה גּוֹבַהּ?' },
        { type: 'bridge-add', a: 9, b: 6, result: 15, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ! מִגּוֹבַהּ {a} מְטַפֵּס {b} יְחִידוֹת. מַה הַגּוֹבַהּ?' },
        { type: 'bridge-add', a: 7, b: 8, result: 15, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גּוֹבַהּ {a}, עוֹלֶה {b} יְחִידוֹת. לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
        { type: 'bridge-add', a: 8, b: 7, result: 15, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ! אֲנִי בְּגוֹבַהּ {a} וּמְטַפֵּס {b}. לְאֵיזֶה גּוֹבַהּ?' },
        { type: 'bridge-add', a: 8, b: 4, result: 12, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גּוֹבַהּ {a}, טִיפּוּס {b} יְחִידוֹת. מַה הַגּוֹבַהּ הֶחָדָשׁ?' },
        { type: 'bridge-add', a: 7, b: 5, result: 12, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ! מִגּוֹבַהּ {a} אֲנִי עוֹלֶה {b}. לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
        { type: 'bridge-add', a: 9, b: 8, result: 17, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גּוֹבַהּ {a} וְעוֹד {b} יְחִידוֹת. לְאֵיזֶה גּוֹבַהּ?' },
        { type: 'bridge-add', a: 6, b: 7, result: 13, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ! אֲנִי בְּגוֹבַהּ {a}, מְטַפֵּס {b} יְחִידוֹת. מַה הַגּוֹבַהּ?' },
      ]
    },

    // ===== 8 =====
    // The port this whole update was built for: 16 − 9. Same station, downward.
    {
      id: 8,
      name: 'נָמֵל הַגָּלִיל',
      title: 'חֲצִיַּת עֲשָׂרָה — חִיסוּר',
      visual: 'altitude',
      altMax: 20,
      bridge: 'down',
      questions: [
        { type: 'bridge-sub', a: 16, b: 9, result: 7, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֲנִי בְּגוֹבַהּ {a} וְיוֹרֵד {b} יְחִידוֹת. לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
        { type: 'bridge-sub', a: 15, b: 8, result: 7, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גּוֹבַהּ {a}, יְרִידָה שֶׁל {b} יְחִידוֹת. לְאֵיזֶה גּוֹבַהּ?' },
        { type: 'bridge-sub', a: 14, b: 7, result: 7, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ, מִגּוֹבַהּ {a} אֲנִי יוֹרֵד {b}. מַה הַגּוֹבַהּ הֶחָדָשׁ?' },
        { type: 'bridge-sub', a: 13, b: 5, result: 8, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ! אֲנִי בְּגוֹבַהּ {a} וְיוֹרֵד {b} יְחִידוֹת. לְאֵיזֶה גּוֹבַהּ?' },
        { type: 'bridge-sub', a: 17, b: 9, result: 8, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גּוֹבַהּ {a}, יוֹרֵד {b} יְחִידוֹת. לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
        { type: 'bridge-sub', a: 12, b: 8, result: 4, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ! מִגּוֹבַהּ {a} יְרִידָה שֶׁל {b}. מַה הַגּוֹבַהּ?' },
        { type: 'bridge-sub', a: 15, b: 9, result: 6, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֲנִי בְּגוֹבַהּ {a} וְצָרִיךְ לָרֶדֶת {b}. לְאֵיזֶה גּוֹבַהּ?' },
        { type: 'bridge-sub', a: 13, b: 6, result: 7, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גּוֹבַהּ {a}, יוֹרֵד {b}. לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
        { type: 'bridge-sub', a: 14, b: 8, result: 6, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ, מִגּוֹבַהּ {a} אֲנִי יוֹרֵד {b} יְחִידוֹת. מַה הַגּוֹבַהּ הֶחָדָשׁ?' },
        { type: 'bridge-sub', a: 16, b: 7, result: 9, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ! אֲנִי בְּגוֹבַהּ {a} וְיוֹרֵד {b}. לְאֵיזֶה גּוֹבַהּ?' },
        { type: 'bridge-sub', a: 11, b: 4, result: 7, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גּוֹבַהּ {a}, יְרִידָה שֶׁל {b} יְחִידוֹת. לְאֵיזֶה גּוֹבַהּ?' },
        { type: 'bridge-sub', a: 18, b: 9, result: 9, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ! מִגּוֹבַהּ {a} אֲנִי יוֹרֵד {b} יְחִידוֹת. לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
        { type: 'bridge-sub', a: 12, b: 5, result: 7, hint: 'bridge', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֲנִי בְּגוֹבַהּ {a} וְיוֹרֵד {b}. מַה הַגּוֹבַהּ?' },
      ]
    },

    // ===== 9 =====
    // The meter now runs to 100 and every ten is a marked flight level. Whole
    // tens only: the child reads 40, 60, 80 as landmarks before he computes with
    // anything in between.
    {
      id: 9,
      name: 'נָמֵל הָעֲנָנִים',
      title: 'רָמוֹת טִיסָה — עֲשָׂרוֹת עַד 100',
      visual: 'altitude',
      altMax: 100,
      flightLevels: true,
      questions: [
        { type: 'addition',    a: 40, b: 20, result: 60,  hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֲנִי בְּרָמַת טִיסָה {a} וּמְטַפֵּס {b}. לְאֵיזוֹ רָמַת טִיסָה אַגִּיעַ?' },
        { type: 'addition',    a: 30, b: 50, result: 80,  hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! רָמַת טִיסָה {a}, טִיפּוּס שֶׁל {b}. לְאֵיזוֹ רָמָה?' },
        { type: 'addition',    a: 60, b: 20, result: 80,  hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, מֵרָמָה {a} אֲנִי עוֹלֶה {b}. מַה הָרָמָה הַחֲדָשָׁה?' },
        { type: 'addition',    a: 50, b: 30, result: 80,  hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! אֲנִי בְּרָמָה {a} וּמְטַפֵּס {b}. לְאֵיזוֹ רָמַת טִיסָה?' },
        { type: 'addition',    a: 70, b: 30, result: 100, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, רָמָה {a}, טִיפּוּס {b}. לְאֵיזוֹ רָמָה אַגִּיעַ?' },
        { type: 'addition',    a: 20, b: 20, result: 40,  hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! מֵרָמָה {a} עוֹלֶה {b}. מַה הָרָמָה?' },
        { type: 'subtraction', a: 80, b: 30, result: 50,  hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֲנִי בְּרָמַת טִיסָה {a} וְיוֹרֵד {b}. לְאֵיזוֹ רָמָה אַגִּיעַ?' },
        { type: 'subtraction', a: 70, b: 40, result: 30,  hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! רָמָה {a}, יְרִידָה שֶׁל {b}. לְאֵיזוֹ רָמַת טִיסָה?' },
        { type: 'subtraction', a: 90, b: 20, result: 70,  hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, מֵרָמָה {a} אֲנִי יוֹרֵד {b}. מַה הָרָמָה הַחֲדָשָׁה?' },
        { type: 'subtraction', a: 100, b: 40, result: 60, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! אֲנִי בְּרָמָה {a} וְיוֹרֵד {b}. לְאֵיזוֹ רָמַת טִיסָה?' },
        { type: 'subtraction', a: 60, b: 30, result: 30,  hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, רָמָה {a}, יוֹרֵד {b}. לְאֵיזוֹ רָמָה?' },
        { type: 'subtraction', a: 50, b: 20, result: 30,  hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! מֵרָמָה {a} יְרִידָה שֶׁל {b}. מַה הָרָמָה?' },
      ]
    },

    // ===== 10 =====
    // Place value. A two-digit altitude is a flight level plus units — the same
    // "10 and some more" idea the child already owns, one size up.
    {
      id: 10,
      name: 'נָמֵל הַכַּרְמֶל',
      title: 'מִבְנֶה עֲשָׂרוֹנִי — עֲשָׂרוֹת וִיחִידוֹת',
      visual: 'altitude',
      altMax: 100,
      flightLevels: true,
      questions: [
        { type: 'split',  a: 47, b: 40, result: 7,  hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֲנִי בְּגוֹבַהּ {a}. זֶה רָמַת טִיסָה {b} וְעוֹד כַּמָּה יְחִידוֹת?' },
        { type: 'split',  a: 63, b: 60, result: 3,  hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גּוֹבַהּ {a} — זֶה {b} וְעוֹד כַּמָּה?' },
        { type: 'split',  a: 85, b: 80, result: 5,  hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, פָּרֵק לִי אֶת גּוֹבַהּ {a} — {b} וְעוֹד כַּמָּה יְחִידוֹת?' },
        { type: 'split',  a: 29, b: 20, result: 9,  hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! אֲנִי בְּגוֹבַהּ {a}. כַּמָּה יְחִידוֹת יֵשׁ לִי מֵעַל רָמַת טִיסָה {b}?' },
        { type: 'split',  a: 74, b: 70, result: 4,  hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גּוֹבַהּ {a} — כַּמָּה יְחִידוֹת מֵעַל רָמָה {b}?' },
        { type: 'split',  a: 56, b: 50, result: 6,  hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! {a} זֶה {b} וְעוֹד כַּמָּה יְחִידוֹת?' },
        { type: 'tens',   a: 60,        result: 6,  hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, רָמַת טִיסָה {a}. כַּמָּה עֲשָׂרוֹת שְׁלֵמוֹת יֵשׁ בָּהּ?' },
        { type: 'tens',   a: 40,        result: 4,  hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! רָמָה {a} — כַּמָּה עֲשָׂרוֹת זֶה?' },
        { type: 'tens',   a: 90,        result: 9,  hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, כַּמָּה עֲשָׂרוֹת שְׁלֵמוֹת יֵשׁ בְּרָמַת טִיסָה {a}?' },
        { type: 'addition', a: 50, b: 3, result: 53, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! רָמַת טִיסָה {a} וְעוֹד {b} יְחִידוֹת — לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
        { type: 'addition', a: 80, b: 6, result: 86, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, מֵרָמָה {a} מְטַפֵּס {b} יְחִידוֹת. מַה הַגּוֹבַהּ?' },
        { type: 'addition', a: 30, b: 8, result: 38, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! רָמָה {a} וְעוֹד {b}. לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
      ]
    },

    // ===== 11 =====
    // Two-digit ± units, no crossing. The tens digit sits still and only the
    // units move — that is the whole lesson, and the meter shows it.
    {
      id: 11,
      name: 'נָמֵל הַשָּׁרוֹן',
      title: 'דּוּ־סִפְרָתִי וִיחִידוֹת',
      visual: 'altitude',
      altMax: 100,
      flightLevels: true,
      questions: [
        { type: 'addition',    a: 43, b: 5, result: 48, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֲנִי בְּגוֹבַהּ {a} וּמְטַפֵּס {b} יְחִידוֹת. לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
        { type: 'addition',    a: 52, b: 6, result: 58, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גּוֹבַהּ {a}, טִיפּוּס שֶׁל {b}. מַה הַגּוֹבַהּ הֶחָדָשׁ?' },
        { type: 'addition',    a: 61, b: 7, result: 68, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, מִגּוֹבַהּ {a} אֲנִי עוֹלֶה {b}. לְאֵיזֶה גּוֹבַהּ?' },
        { type: 'addition',    a: 34, b: 5, result: 39, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! אֲנִי בְּגוֹבַהּ {a} וְעוֹד {b} יְחִידוֹת טִיפּוּס. לְאֵיזֶה גּוֹבַהּ?' },
        { type: 'addition',    a: 75, b: 4, result: 79, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גּוֹבַהּ {a}, מְטַפֵּס {b}. מַה הַגּוֹבַהּ?' },
        { type: 'addition',    a: 22, b: 6, result: 28, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! מִגּוֹבַהּ {a} עוֹלֶה {b} יְחִידוֹת. לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
        { type: 'subtraction', a: 68, b: 4, result: 64, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֲנִי בְּגוֹבַהּ {a} וְיוֹרֵד {b} יְחִידוֹת. לְאֵיזֶה גּוֹבַהּ?' },
        { type: 'subtraction', a: 76, b: 3, result: 73, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גּוֹבַהּ {a}, יְרִידָה שֶׁל {b}. מַה הַגּוֹבַהּ הֶחָדָשׁ?' },
        { type: 'subtraction', a: 87, b: 5, result: 82, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, מִגּוֹבַהּ {a} אֲנִי יוֹרֵד {b}. לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
        { type: 'subtraction', a: 95, b: 4, result: 91, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! אֲנִי בְּגוֹבַהּ {a} וְיוֹרֵד {b} יְחִידוֹת. מַה הַגּוֹבַהּ?' },
        { type: 'subtraction', a: 49, b: 6, result: 43, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גּוֹבַהּ {a}, יוֹרֵד {b}. לְאֵיזֶה גּוֹבַהּ?' },
        { type: 'subtraction', a: 58, b: 7, result: 51, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! מִגּוֹבַהּ {a} יְרִידָה שֶׁל {b} יְחִידוֹת. לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
      ]
    },

    // ===== 12 =====
    // Two-digit ± whole tens. Now the units sit still and the tens move — the
    // mirror image of port 11, which is exactly how the place-value idea lands.
    {
      id: 12,
      name: 'נָמֵל הַמֶּרְכָּז',
      title: 'דּוּ־סִפְרָתִי וַעֲשָׂרוֹת',
      visual: 'altitude',
      altMax: 100,
      flightLevels: true,
      questions: [
        { type: 'addition',    a: 34, b: 20, result: 54, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֲנִי בְּגוֹבַהּ {a} וּמְטַפֵּס {b}. לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
        { type: 'addition',    a: 46, b: 30, result: 76, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גּוֹבַהּ {a}, טִיפּוּס שֶׁל {b}. מַה הַגּוֹבַהּ הֶחָדָשׁ?' },
        { type: 'addition',    a: 23, b: 40, result: 63, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, מִגּוֹבַהּ {a} אֲנִי עוֹלֶה {b}. לְאֵיזֶה גּוֹבַהּ?' },
        { type: 'addition',    a: 51, b: 20, result: 71, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! אֲנִי בְּגוֹבַהּ {a} וּמְטַפֵּס {b} יְחִידוֹת גּוֹבַהּ. לְאֵיזֶה גּוֹבַהּ?' },
        { type: 'addition',    a: 15, b: 30, result: 45, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גּוֹבַהּ {a}, עוֹלֶה {b}. מַה הַגּוֹבַהּ?' },
        { type: 'addition',    a: 62, b: 30, result: 92, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! מִגּוֹבַהּ {a} טִיפּוּס שֶׁל {b}. לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
        { type: 'subtraction', a: 75, b: 30, result: 45, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֲנִי בְּגוֹבַהּ {a} וְיוֹרֵד {b}. לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
        { type: 'subtraction', a: 82, b: 50, result: 32, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גּוֹבַהּ {a}, יְרִידָה שֶׁל {b}. מַה הַגּוֹבַהּ הֶחָדָשׁ?' },
        { type: 'subtraction', a: 67, b: 20, result: 47, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, מִגּוֹבַהּ {a} אֲנִי יוֹרֵד {b}. לְאֵיזֶה גּוֹבַהּ?' },
        { type: 'subtraction', a: 94, b: 40, result: 54, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! אֲנִי בְּגוֹבַהּ {a} וְיוֹרֵד {b} יְחִידוֹת גּוֹבַהּ. מַה הַגּוֹבַהּ?' },
        { type: 'subtraction', a: 58, b: 30, result: 28, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גּוֹבַהּ {a}, יוֹרֵד {b}. לְאֵיזֶה גּוֹבַהּ?' },
        { type: 'subtraction', a: 43, b: 20, result: 23, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! מִגּוֹבַהּ {a} יְרִידָה שֶׁל {b}. לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
      ]
    },

    // ===== 13 =====
    // The number line to 100: what comes next, what came before, and jumps of
    // ten. Reading the line is a separate skill from computing on it.
    {
      id: 13,
      name: 'נָמֵל הַמִּזְרָח',
      title: 'יָשָׁר הַמִּסְפָּרִים עַד 100',
      visual: 'altitude',
      altMax: 100,
      flightLevels: true,
      questions: [
        { type: 'after',  a: 79, result: 80, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֲנִי בְּגוֹבַהּ {a} וְעוֹלֶה יְחִידָה אַחַת. אֵיזֶה מִסְפָּר בָּא אַחֲרֵי {a}?' },
        { type: 'after',  a: 59, result: 60, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! אֵיזֶה גּוֹבַהּ בָּא מִיָּד אַחֲרֵי {a}?' },
        { type: 'after',  a: 39, result: 40, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, מָה הַמִּסְפָּר שֶׁבָּא אַחֲרֵי {a}?' },
        { type: 'after',  a: 89, result: 90, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! אֲנִי בְּגוֹבַהּ {a}, עוֹד יְחִידָה אַחַת לְמַעְלָה. לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
        { type: 'before', a: 60, result: 59, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֵיזֶה מִסְפָּר בָּא לִפְנֵי {a}?' },
        { type: 'before', a: 30, result: 29, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! אֲנִי בְּגוֹבַהּ {a} וְיוֹרֵד יְחִידָה אַחַת. לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
        { type: 'before', a: 70, result: 69, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, מָה הַמִּסְפָּר שֶׁבָּא לִפְנֵי {a}?' },
        { type: 'before', a: 100, result: 99, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! אֵיזֶה גּוֹבַהּ בָּא מִיָּד לִפְנֵי {a}?' },
        { type: 'addition',    a: 35, b: 10, result: 45, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, קְפִיצָה שֶׁל {b} מִגּוֹבַהּ {a} — לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
        { type: 'addition',    a: 62, b: 10, result: 72, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! מִגּוֹבַהּ {a} מְטַפֵּס {b} יְחִידוֹת. מַה הַגּוֹבַהּ?' },
        { type: 'subtraction', a: 48, b: 10, result: 38, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, מִגּוֹבַהּ {a} אֲנִי יוֹרֵד {b}. לְאֵיזֶה גּוֹבַהּ?' },
        { type: 'subtraction', a: 91, b: 10, result: 81, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גּוֹבַהּ {a}, יְרִידָה שֶׁל {b}. לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
      ]
    },

    // ===== 14 =====
    // The check ride. Everything the child owns, in one shift, mixed.
    {
      id: 14,
      name: 'נָמֵל הַבֵּינְלְאֻמִּי',
      title: 'מִבְחַן טִיסָה — הַכֹּל בְּיַחַד',
      visual: 'altitude',
      altMax: 100,
      flightLevels: true,
      questions: [
        { type: 'bridge-sub', a: 16, b: 9,  result: 7,  hint: 'bridge', altMax: 20, radioText: 'מִגְדַּל הַפִּיקּוּחַ, מִבְחַן טִיסָה! אֲנִי בְּגוֹבַהּ {a} וְיוֹרֵד {b}. לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
        { type: 'bridge-add', a: 8,  b: 6,  result: 14, hint: 'bridge', altMax: 20, radioText: 'מִגְדַּל הַפִּיקּוּחַ! מִבְחַן טִיסָה — גּוֹבַהּ {a}, מְטַפֵּס {b}. לְאֵיזֶה גּוֹבַהּ?' },
        { type: 'bridge-sub', a: 14, b: 6,  result: 8,  hint: 'bridge', altMax: 20, radioText: 'מִגְדַּל הַפִּיקּוּחַ, גּוֹבַהּ {a}, יְרִידָה שֶׁל {b} יְחִידוֹת. מַה הַגּוֹבַהּ הֶחָדָשׁ?' },
        { type: 'addition',   a: 50, b: 40, result: 90, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! מִבְחַן טִיסָה — מֵרָמָה {a} מְטַפֵּס {b}. לְאֵיזוֹ רָמַת טִיסָה?' },
        { type: 'subtraction', a: 90, b: 60, result: 30, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, מֵרָמַת טִיסָה {a} אֲנִי יוֹרֵד {b}. לְאֵיזוֹ רָמָה אַגִּיעַ?' },
        { type: 'split',      a: 68, b: 60, result: 8,  hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! פָּרֵק לִי אֶת גּוֹבַהּ {a} — {b} וְעוֹד כַּמָּה יְחִידוֹת?' },
        { type: 'addition',   a: 45, b: 4,  result: 49, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֲנִי בְּגוֹבַהּ {a} וּמְטַפֵּס {b} יְחִידוֹת. מַה הַגּוֹבַהּ?' },
        { type: 'subtraction', a: 77, b: 5, result: 72, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גּוֹבַהּ {a}, יוֹרֵד {b} יְחִידוֹת. לְאֵיזֶה גּוֹבַהּ אַגִּיעַ?' },
        { type: 'addition',   a: 36, b: 20, result: 56, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, מִגּוֹבַהּ {a} טִיפּוּס שֶׁל {b}. לְאֵיזֶה גּוֹבַהּ?' },
        { type: 'subtraction', a: 84, b: 40, result: 44, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! מִגּוֹבַהּ {a} יְרִידָה שֶׁל {b}. מַה הַגּוֹבַהּ הֶחָדָשׁ?' },
        { type: 'after',      a: 69, result: 70, hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֵיזֶה מִסְפָּר בָּא אַחֲרֵי {a}?' },
        { type: 'tens',       a: 80, result: 8,  hint: 'levels', radioText: 'מִגְדַּל הַפִּיקּוּחַ! כַּמָּה עֲשָׂרוֹת שְׁלֵמוֹת יֵשׁ בְּרָמַת טִיסָה {a}?' },
      ]
    },
  ]
};

// ===== SHARED HELPERS =====
// game.js, tests and tools/generate-audio.js all go through these, so a prompt
// the child hears can never drift from the prompt the generator voiced.

/** Fill {a} {b} {result} and any extra values into a template. */
function fillTemplate(template, values) {
  return String(template).replace(/{(\w+)}/g, (m, k) =>
    values[k] !== undefined ? values[k] : m);
}

/** The ten a bridging question passes through. 10 for the units ports. */
function bridgeStop(q) {
  return q.type === 'bridge-add'
    ? (Math.floor(q.a / 10) + 1) * 10
    : Math.floor(q.a / 10) * 10;
}

/**
 * The safety-station ladder for a bridging question, as three real questions.
 * 16 − 9 →  [ down to 10: 6 ] [ still to drop: 3 ] [ 10 − 3: 7 ]
 *  8 + 5 →  [  up to 10:  2 ] [ still to climb: 3 ] [ 10 + 3: 13 ]
 */
function bridgeSteps(q) {
  const up   = q.type === 'bridge-add';
  const stop = bridgeStop(q);
  const s1   = up ? stop - q.a : q.a - stop;   // reach the station
  const s2   = q.b - s1;                        // the rest of the move
  const t    = up ? MESSAGES.bridge.up : MESSAGES.bridge.down;
  const v    = { a: q.a, b: q.b, result: q.result, stop, s1, s2 };

  return {
    stop, s1, s2,
    intro: fillTemplate(t.intro, v),
    done:  fillTemplate(t.done,  v),
    steps: [
      { prompt: fillTemplate(t.step1, v), answer: s1,       alt: stop },
      { prompt: fillTemplate(t.step2, v), answer: s2,       alt: stop },
      { prompt: fillTemplate(t.step3, v), answer: q.result, alt: q.result },
    ],
  };
}

/** Every distinct line the game can ever speak. One source of truth. */
function collectSpokenLines() {
  const out = new Set();
  const add = t => { if (t) out.add(t); };

  CURRICULUM.stages.forEach(stage => {
    stage.questions.forEach(q => {
      add(fillTemplate(q.radioText, q));
      add(fillTemplate(MESSAGES.reveal, { result: q.result }));
      if (q.type === 'bridge-add' || q.type === 'bridge-sub') {
        const b = bridgeSteps(q);
        add(b.intro);
        add(b.done);
        b.steps.forEach(s => add(s.prompt));
      }
    });
  });

  MESSAGES.correct.forEach(add);
  MESSAGES.retry.forEach(add);
  Object.values(MESSAGES.combo).forEach(add);
  add(MESSAGES.landing.normal);
  add(MESSAGES.landing.gold);

  return [...out];
}

// Consumed by tools/generate-audio.js and tests/run.js.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PLANE_TYPES, RARITY, MESSAGES, CURRICULUM,
                     fillTemplate, bridgeStop, bridgeSteps, collectSpokenLines };
}
