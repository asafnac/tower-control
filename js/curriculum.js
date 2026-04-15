// curriculum.js
// All question data. Loaded before progress.js and game.js.

const PLANE_TYPES = [
  { id: 1,  emoji: '✈️',  name: 'בּוֹאִינְג' },
  { id: 2,  emoji: '🛩️', name: 'מָטוֹס קָטָן' },
  { id: 3,  emoji: '🚁',  name: 'מָסוֹק' },
  { id: 4,  emoji: '🛫',  name: 'מָטוֹס מַמְרִיא' },
  { id: 5,  emoji: '🛬',  name: 'מָטוֹס נוֹחֵת' },
  { id: 6,  emoji: '🚀',  name: 'טִיל מֶחְקָר' },
  { id: 7,  emoji: '⛵',  name: 'סְפִינַת יָם' },
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
      safetyStation: true,
      questions: [
        { type: 'subtraction', a: 11, b: 1,  result: 10, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֲנִי בְּגוֹבַה {a}. צָרִיךְ לְהַגִּיעַ לְרָמַת הַבִּטָּחוֹן — גוֹבַה 10. כַּמָּה לְהוֹרִיד?' },
        { type: 'subtraction', a: 12, b: 2,  result: 10, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גוֹבַה {a}. כַּמָּה לְהוֹרִיד כְּדֵי לְהַגִּיעַ לְגוֹבַה הַבִּטָּחוֹן — גוֹבַה 10?' },
        { type: 'subtraction', a: 13, b: 3,  result: 10, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גוֹבַה {a}. כַּמָּה יְחִידוֹת לָרֶדֶת כְּדֵי לְהַגִּיעַ לְרָמַת הַבִּטָּחוֹן?' },
        { type: 'subtraction', a: 14, b: 4,  result: 10, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! אֲנִי בְּגוֹבַה {a}. כַּמָּה צָרִיךְ לְהוֹרִיד כְּדֵי לְהַגִּיעַ לְגוֹבַה 10?' },
        { type: 'subtraction', a: 15, b: 5,  result: 10, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גוֹבַה {a}. הַמָּטוֹס חַיָּב לַעֲצוֹר בְּגוֹבַה 10. כַּמָּה לְהוֹרִיד?' },
        { type: 'subtraction', a: 16, b: 6,  result: 10, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גוֹבַה {a}. כַּמָּה לְהוֹרִיד כְּדֵי לְהַגִּיעַ לְרָמַת הַבִּטָּחוֹן?' },
        { type: 'subtraction', a: 17, b: 7,  result: 10, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֲנִי בְּגוֹבַה {a}. כַּמָּה יְחִידוֹת לְהוֹרִיד כְּדֵי לְהַגִּיעַ לְגוֹבַה 10?' },
        { type: 'subtraction', a: 18, b: 8,  result: 10, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גוֹבַה {a}. כַּמָּה לָרֶדֶת עַד לְרָמַת הַבִּטָּחוֹן?' },
        { type: 'subtraction', a: 19, b: 9,  result: 10, hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גוֹבַה {a}. כַּמָּה יְחִידוֹת גוֹבַה לְהוֹרִיד כְּדֵי לַעֲצוֹר בְּגוֹבַה 10?' },
      ]
    },
    {
      id: 4,
      name: 'נָמֵל בְּאֵר שֶׁבַע',
      title: 'תַּחֲנַת הַבִּטָּחוֹן — עֲלִיָּה מִ-10',
      visual: 'altitude',
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
      safetyStation: true,
      questions: [
        { type: 'decompose', a: 11, b: 10, result: 1,  hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, אֲנִי בְּגוֹבַה {a}. יָדוּעַ שֶׁיֵּשׁ לִי 10 יְחִידוֹת בָּסִיס. כַּמָּה יְחִידוֹת יֵשׁ לִי מֵעַל גוֹבַה 10?' },
        { type: 'decompose', a: 12, b: 10, result: 2,  hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גוֹבַה {a} — זֶה 10 וְעוֹד כַּמָּה?' },
        { type: 'decompose', a: 13, b: 10, result: 3,  hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, {a} זֶה 10 בַּתַּחְתִּית וְעוֹד כַּמָּה יְחִידוֹת מֵעַל?' },
        { type: 'decompose', a: 14, b: 10, result: 4,  hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גוֹבַה {a} — כַּמָּה יְחִידוֹת יֵשׁ מֵעַל רָמַת הַבִּטָּחוֹן?' },
        { type: 'decompose', a: 15, b: 10, result: 5,  hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, {a} שָׁוֶה 10 וְעוֹד כַּמָּה?' },
        { type: 'decompose', a: 16, b: 10, result: 6,  hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! גוֹבַה {a}. פָּרֵק לִי אֶת הַגּוֹבַהּ — 10 וְעוֹד כַּמָּה?' },
        { type: 'decompose', a: 17, b: 10, result: 7,  hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גוֹבַה {a}. כַּמָּה יְחִידוֹת מֵעַל לְגוֹבַה 10?' },
        { type: 'decompose', a: 18, b: 10, result: 8,  hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ! {a} זֶה 10 וְעוֹד כַּמָּה יְחִידוֹת?' },
        { type: 'decompose', a: 19, b: 10, result: 9,  hint: 'decompose', radioText: 'מִגְדַּל הַפִּיקּוּחַ, גוֹבַה {a} — פָּרֵק לִי לְ-10 וְעוֹד מַשֶּׁהוּ. הַכַּמָּה?' },
      ]
    },
    {
      id: 6,
      name: 'נָמֵל הַצָּפוֹן',
      title: 'חִיסוּר בָּעֶשֶׂרֶת הַשְּׁנִיָּה',
      visual: 'altitude',
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
    {
      id: 7,
      name: 'נָמֵל הַבִּירָה',
      title: 'חִיבּוּר וְחִיסוּר — חֲצִיַּת עֲשָׂרוֹת',
      visual: 'planes',
      questions: [
        { type: 'addition',    a: 8,  b: 5,  result: 13, hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ, {a} מְטוֹסִים מִצָּפוֹן וְעוֹד {b} מִדָּרוֹם. כַּמָּה סַךְ הַכֹּל?' },
        { type: 'addition',    a: 7,  b: 6,  result: 13, hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ! {a} מְטוֹסִים מִמִּזְרָח וְ-{b} מִמַּעֲרָב. כַּמָּה?' },
        { type: 'addition',    a: 9,  b: 4,  result: 13, hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ, {a} מְמַתִּינִים וְעוֹד {b} מִתְקָרְבִים. כַּמָּה בְּסַךְ הַכֹּל?' },
        { type: 'addition',    a: 9,  b: 5,  result: 14, hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ! {a} גְּדוֹלִים וְ-{b} קְטַנִּים. כַּמָּה מְטוֹסִים?' },
        { type: 'addition',    a: 6,  b: 8,  result: 14, hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ, {a} מְטוֹסִים בְּצַד יָמִין, {b} בְּצַד שְׂמֹאל. כַּמָּה?' },
        { type: 'addition',    a: 9,  b: 6,  result: 15, hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ! {a} מְטוֹסִים וְעוֹד {b}. כַּמָּה?' },
        { type: 'addition',    a: 7,  b: 8,  result: 15, hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ, {a} וְעוֹד {b}. כַּמָּה סַךְ הַכֹּל?' },
        { type: 'subtraction', a: 13, b: 4,  result: 9,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ, הָיוּ {a} מְטוֹסִים. {b} נָחֲתוּ. כַּמָּה נִשְׁאֲרוּ?' },
        { type: 'subtraction', a: 12, b: 5,  result: 7,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ! {a} מְטוֹסִים, {b} סִיְּמוּ. כַּמָּה מַמְשִׁיכִים?' },
        { type: 'subtraction', a: 14, b: 6,  result: 8,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ, {a} מְטוֹסִים בַּשָּׁמַיִם, {b} קִבְּלוּ אִישּׁוּר נְחִיתָה. כַּמָּה עוֹד?' },
        { type: 'subtraction', a: 15, b: 7,  result: 8,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ! {a} מְטוֹסִים, {b} נָחֲתוּ. כַּמָּה בַּשָּׁמַיִם?' },
        { type: 'subtraction', a: 11, b: 4,  result: 7,  hint: 'dots', radioText: 'מִגְדַּל הַפִּיקּוּחַ, {a} פָּחוֹת {b}. כַּמָּה נִשְׁאֲרוּ?' },
      ]
    }
  ]
};
