// analytics.js — what the child actually knows, measured from how he plays.
//
// WHY THIS EXISTS
// "He's doing fine" is not a plan. A parent needs to know which of the twelve
// skills the ports teach are solid, which are being carried by the scaffold,
// and which specific facts still cost him three tries — and to know it from
// evidence rather than impression.
//
// PRIVACY IS UNCHANGED
// Every record stays in this browser's localStorage, exactly like the progress
// save. Nothing is sent anywhere, there is no account, and the analysis runs
// on the same machine that produced it. Sharing is an explicit act: the parent
// presses a button and gets a file.
//
// WHAT IS RECORDED
// One small row per answered call — port, question type, the numbers, how many
// tries it took, whether the ladder was opened, how long it took, when. That is
// enough to compute everything below and small enough that a year of daily play
// fits comfortably in a save.
//
// This file is pure: analyse() takes a log and returns a report, with no DOM
// and no globals. That is what lets tools/analyze.js run the identical analysis
// over an exported file.

const ANALYTICS = {
  // A rolling window. Old rows are dropped from the front; the report cares
  // about where he is now, and a save must never grow without bound.
  MAX_ROWS: 1500,

  // Response times are a fluency signal, but a child who walks off mid-question
  // would otherwise poison the median. Anything past this is treated as "he
  // left the room", not "he thought hard".
  MAX_THINK_MS: 90000,

  /**
   * The twelve things the ports actually teach, in teaching order.
   * `label` is for the screen; `plain` is for a terminal, where nikud is
   * zero-width combining marks that make every padded column drift.
   */
  SKILLS: [
    { id: 'add10',         label: 'חִיבּוּר עַד 10',                    plain: 'חיבור עד 10',              port: 1  },
    { id: 'sub10',         label: 'חִיסוּר עַד 10',                     plain: 'חיסור עד 10',              port: 2  },
    { id: 'decompose',     label: 'פֵּירוּק לְ-10 וְעוֹד',              plain: 'פירוק ל-10 ועוד',           port: 5  },
    { id: 'teenAdd',       label: 'עֲלִיָּה מִ-10',                     plain: 'עלייה מ-10',               port: 4  },
    { id: 'teenSub',       label: 'חִיסוּר בָּעֶשְׂרִים, בְּלִי חֲצִיָּה', plain: 'חיסור בעשרים, בלי חצייה', port: 6  },
    { id: 'bridgeAdd',     label: 'חֲצִיַּת עֲשָׂרָה — חִיבּוּר',       plain: 'חציית עשרה — חיבור',       port: 7  },
    { id: 'bridgeSub',     label: 'חֲצִיַּת עֲשָׂרָה — חִיסוּר',        plain: 'חציית עשרה — חיסור',       port: 8  },
    { id: 'tensWhole',     label: 'עֲשָׂרוֹת שְׁלֵמוֹת עַד 100',        plain: 'עשרות שלמות עד 100',       port: 9  },
    { id: 'place',         label: 'מִבְנֶה עֲשָׂרוֹנִי',                plain: 'מבנה עשרוני',              port: 10 },
    { id: 'twoDigitUnits', label: 'דּוּ־סִפְרָתִי וִיחִידוֹת',          plain: 'דו-ספרתי ויחידות',         port: 11 },
    { id: 'twoDigitTens',  label: 'דּוּ־סִפְרָתִי וַעֲשָׂרוֹת',         plain: 'דו-ספרתי ועשרות',          port: 12 },
    { id: 'numberLine',    label: 'לִפְנֵי וְאַחֲרֵי',                  plain: 'לפני ואחרי',               port: 13 },
  ],

  /**
   * Which skill an answered question exercised.
   *
   * Deliberately derived from the numbers, not from the port: the check ride
   * mixes everything, and practice runs revisit old ports. What matters is what
   * the child had to do, not where he happened to be standing.
   */
  skillOf(rec) {
    const { q, a, b, r } = rec;
    switch (q) {
      case 'bridge-add': return 'bridgeAdd';
      case 'bridge-sub': return 'bridgeSub';
      case 'decompose':  return 'decompose';
      case 'split':
      case 'tens':       return 'place';
      case 'after':
      case 'before':     return 'numberLine';

      case 'addition':
        if (a <= 10 && b <= 10 && r <= 10)   return 'add10';
        if (a === 10)                        return 'teenAdd';
        if (a % 10 === 0 && b % 10 === 0)    return 'tensWhole';
        if (b % 10 === 0)                    return 'twoDigitTens';
        if (a > 20)                          return 'twoDigitUnits';
        return 'teenAdd';

      case 'subtraction':
        if (a <= 10)                         return 'sub10';
        if (a % 10 === 0 && b % 10 === 0)    return 'tensWhole';
        if (b % 10 === 0)                    return 'twoDigitTens';
        if (a <= 20)                         return 'teenSub';
        return 'twoDigitUnits';

      default: return 'other';
    }
  },

  /** Human-readable form of one exercise, for the "hardest facts" list. */
  factOf(rec) {
    const { q, a, b } = rec;
    if (q === 'after')  return `אַחֲרֵי ${a}`;
    if (q === 'before') return `לִפְנֵי ${a}`;
    if (q === 'tens')   return `עֲשָׂרוֹת בְּ-${a}`;
    if (q === 'split')  return `${a} = ${b} + ?`;
    if (q === 'decompose') return `${a} = 10 + ?`;
    const op = (q === 'subtraction' || q === 'bridge-sub') ? '−' : '+';
    return `${a} ${op} ${b}`;
  },

  // ===== RECORDING =====
  /** Append one answered call to the save's log. Mutates and returns save. */
  record(save, rec) {
    if (!Array.isArray(save.log)) save.log = [];
    save.log.push({
      t: rec.t,                                   // epoch ms
      s: rec.s,                                   // port id
      q: rec.q,                                   // question type
      a: rec.a, b: rec.b === undefined ? null : rec.b, r: rec.r,
      n: rec.n,                                   // wrong answers before getting it (0 = first try)
      l: rec.l ? 1 : 0,                           // ladder opened
      v: rec.v ? 1 : 0,                           // answer was revealed
      d: Math.min(Math.max(0, Math.round(rec.d || 0)), this.MAX_THINK_MS),
    });
    if (save.log.length > this.MAX_ROWS) {
      save.log.splice(0, save.log.length - this.MAX_ROWS);
    }
    return save;
  },

  // ===== ANALYSIS =====
  _median(nums) {
    if (!nums.length) return 0;
    const s = [...nums].sort((x, y) => x - y);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
  },

  _pct(part, whole) { return whole ? Math.round((part / whole) * 100) : 0; },

  /** Local YYYY-MM-DD for a timestamp. */
  _day(t) {
    const d = new Date(t);
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  },

  /**
   * Turn a log into a report.
   *
   * A skill needs MIN_SAMPLES before it is judged at all. Calling a skill weak
   * off three attempts would send a parent drilling something the child may
   * simply not have met yet — the most expensive mistake this report could make.
   */
  analyse(log, opts = {}) {
    const MIN_SAMPLES = opts.minSamples || 6;
    const rows = (log || []).filter(r => r && typeof r.n === 'number');

    const report = {
      total: rows.length,
      enough: rows.length >= 12,
      firstTryPct: 0,
      revealPct: 0,
      medianSeconds: 0,
      days: 0,
      from: null, to: null,
      skills: [],
      hardest: [],
      trend: null,
      recentByDay: [],
      recommendations: [],
    };
    if (!rows.length) return report;

    report.from = rows[0].t;
    report.to   = rows[rows.length - 1].t;
    report.days = new Set(rows.map(r => this._day(r.t))).size;
    report.firstTryPct   = this._pct(rows.filter(r => r.n === 0 && !r.v).length, rows.length);
    report.revealPct     = this._pct(rows.filter(r => r.v).length, rows.length);
    report.medianSeconds = Math.round(this._median(rows.map(r => r.d)) / 100) / 10;

    // ===== per skill =====
    for (const def of this.SKILLS) {
      const mine = rows.filter(r => this.skillOf(r) === def.id);
      if (!mine.length) {
        report.skills.push({ ...def, samples: 0, status: 'unseen' });
        continue;
      }
      const firstTry = mine.filter(r => r.n === 0 && !r.v).length;
      const solved   = mine.filter(r => !r.v).length;
      const ladder   = mine.filter(r => r.l).length;
      const pct      = this._pct(firstTry, mine.length);
      const seconds  = Math.round(this._median(mine.map(r => r.d)) / 100) / 10;

      // Recency matters more than history: 20 attempts ago is who he was.
      const recent    = mine.slice(-12);
      const recentPct = this._pct(recent.filter(r => r.n === 0 && !r.v).length, recent.length);

      let status = 'thin';
      if (mine.length >= MIN_SAMPLES) {
        if (recentPct >= 85 && seconds <= 12)      status = 'solid';
        else if (recentPct >= 85)                  status = 'accurate-slow';
        else if (recentPct >= 60)                  status = 'working';
        else                                       status = 'weak';
      }

      report.skills.push({
        ...def,
        samples: mine.length,
        firstTryPct: pct,
        recentPct,
        solvedPct: this._pct(solved, mine.length),
        ladderPct: this._pct(ladder, mine.length),
        seconds,
        status,
      });
    }

    // ===== hardest individual facts =====
    const byFact = new Map();
    rows.forEach(r => {
      const key = this.factOf(r);
      const e = byFact.get(key) || { fact: key, seen: 0, missed: 0, skill: this.skillOf(r) };
      e.seen++;
      if (r.n > 0 || r.v) e.missed++;
      byFact.set(key, e);
    });
    report.hardest = [...byFact.values()]
      .filter(f => f.seen >= 2 && f.missed > 0)
      .map(f => ({ ...f, missPct: this._pct(f.missed, f.seen) }))
      .sort((x, y) => y.missPct - x.missPct || y.seen - x.seen)
      .slice(0, 6);

    // ===== trend =====
    // Compared over equal halves of the log, so a long history cannot drown a
    // recent change of direction.
    if (rows.length >= 24) {
      const half = Math.floor(rows.length / 2);
      const early = this._pct(rows.slice(0, half).filter(r => r.n === 0 && !r.v).length, half);
      const late  = this._pct(rows.slice(half).filter(r => r.n === 0 && !r.v).length, rows.length - half);
      report.trend = {
        early, late, delta: late - early,
        direction: late - early >= 6 ? 'up' : (late - early <= -6 ? 'down' : 'flat'),
      };
    }

    // ===== activity per day (last 14) =====
    const byDay = new Map();
    rows.forEach(r => {
      const d = this._day(r.t);
      const e = byDay.get(d) || { day: d, answered: 0, firstTry: 0 };
      e.answered++;
      if (r.n === 0 && !r.v) e.firstTry++;
      byDay.set(d, e);
    });
    report.recentByDay = [...byDay.values()].slice(-14)
      .map(d => ({ ...d, pct: this._pct(d.firstTry, d.answered) }));

    report.recommendations = this.recommend(report);
    return report;
  },

  /**
   * Turn the numbers into things a parent can actually do this week.
   *
   * Ordered by priority and capped: a list of twelve recommendations is a list
   * of none. Every entry names the port to open, because "practise subtraction"
   * is advice and "open port 8" is an action.
   */
  recommend(report) {
    const out = [];
    const byId = Object.fromEntries(report.skills.map(s => [s.id, s]));
    const push = (priority, title, detail) => out.push({ priority, title, detail });

    if (!report.enough) {
      push(1, 'עוֹד אֵין מַסְפִּיק נְתוּנִים',
        'צָרִיךְ בְּעֵרֶךְ שְׁתֵּי מִשְׁמָרוֹת כְּדֵי שֶׁהַדּוּחַ יַגִּיד מַשֶּׁהוּ אָמִין. שַׂחֲקוּ עוֹד קְצָת וְתַחְזְרוּ.');
      return out;
    }

    // 1. Weak skills — the actual work, hardest first.
    const weak = report.skills.filter(s => s.status === 'weak')
      .sort((a, b) => a.recentPct - b.recentPct);
    weak.slice(0, 2).forEach(s => {
      push(1, `לְחַזֵּק: ${s.label}`,
        `${s.recentPct}% נְכוֹנוֹת בַּנִּסָּיוֹן הָרִאשׁוֹן בַּ-12 הָאַחֲרוֹנוֹת (${s.samples} תַּרְגִּילִים סַךְ הַכֹּל). ` +
        `פִּתְחוּ אֶת נָמֵל ${s.port} מֵהַמַּפָּה לְמִשְׁמֶרֶת אִימּוּן.`);
    });

    // 2. The ladder: is the method still being carried, or has it been absorbed?
    ['bridgeSub', 'bridgeAdd'].forEach(id => {
      const s = byId[id];
      if (!s || s.samples < 6) return;
      if (s.ladderPct >= 55) {
        push(2, `${s.label}: עֲדַיִין נִשְׁעָן עַל הַסֻּלָּם`,
          `הַסֻּלָּם נִפְתַּח בְּ-${s.ladderPct}% מֵהַתַּרְגִּילִים. זֶה בְּדִיּוּק תַּפְקִידוֹ בַּשָּׁלָב הַזֶּה — ` +
          `הַסִּימָן שֶׁהַשִּׁיטָה נִקְלְטָה יִהְיֶה יְרִידָה בָּאָחוּז הַזֶּה, לֹא עֲלִיָּה בַּמְּהִירוּת.`);
      } else if (s.ladderPct <= 20 && s.recentPct >= 80) {
        push(3, `${s.label}: הַשִּׁיטָה נִקְלְטָה`,
          `${s.recentPct}% נְכוֹנוֹת לְבַד, וְהַסֻּלָּם נִפְתָּח רַק בְּ-${s.ladderPct}% מֵהַתַּרְגִּילִים. ` +
          `אֶפְשָׁר לְהִתְקַדֵּם הָלְאָה בְּבִטָּחוֹן.`);
      }
    });

    // 3. Accurate but slow — the difference between knowing and knowing by heart.
    const slow = report.skills.filter(s => s.status === 'accurate-slow');
    if (slow.length) {
      push(2, 'נָכוֹן אֲבָל עוֹד לֹא אוֹטוֹמָטִי',
        `${slow.map(s => s.label).join(', ')} — הַתְּשׁוּבוֹת נְכוֹנוֹת אֲבָל לוֹקְחוֹת זְמַן (חֲצִי מֵהֶן מֵעַל ` +
        `${Math.max(...slow.map(s => s.seconds))} שְׁנִיּוֹת). מָה שֶׁעוֹזֵר כָּאן זֶה תְּדִירוּת, לֹא אֹרֶךְ: ` +
        `מִשְׁמֶרֶת קְצָרָה כׇּל יוֹם עֲדִיפָה עַל שָׁלוֹשׁ בְּשַׁבָּת.`);
    }

    // 4. Specific facts worth naming out loud.
    if (report.hardest.length >= 3) {
      const top = report.hardest.slice(0, 4).map(f => f.fact).join(' · ');
      push(2, 'הַתַּרְגִּילִים שֶׁחוֹזְרִים וְנִתְקָעִים',
        `${top}. שָׁוֶה לַעֲבֹר עֲלֵיהֶם יַחַד מִחוּץ לַמִּשְׂחָק, בְּלִי לַחַץ שֶׁל זְמַן.`);
    }

    // 5. Direction of travel.
    if (report.trend) {
      if (report.trend.direction === 'up') {
        push(3, 'הַמְּגַמָּה עוֹלָה',
          `מִ-${report.trend.early}% לְ-${report.trend.late}% נְכוֹנוֹת בַּנִּסָּיוֹן הָרִאשׁוֹן. מָה שֶׁעוֹשִׂים — עוֹבֵד.`);
      } else if (report.trend.direction === 'down') {
        push(1, 'הַמְּגַמָּה יוֹרֶדֶת',
          `מִ-${report.trend.early}% לְ-${report.trend.late}% נְכוֹנוֹת בַּנִּסָּיוֹן הָרִאשׁוֹן. ` +
          `בְּדֶרֶךְ כְּלָל זֶה אוֹמֵר שֶׁהַנָּמֵל הַנּוֹכְחִי קָפַץ מַדְרֵגָה מֻקְדָּם מִדַּי — ` +
          `כַּמָּה מִשְׁמָרוֹת אִימּוּן בַּנָּמֵל הַקּוֹדֵם יַחְזִירוּ אֶת הַבִּטָּחוֹן.`);
      }
    }

    // 6. Consistency beats intensity at this age.
    if (report.days >= 3) {
      const perDay = Math.round(report.total / report.days);
      if (perDay > 40) {
        push(3, 'מִשְׁמָרוֹת אֲרֻכּוֹת',
          `בְּמֻצָּע ${perDay} תַּרְגִּילִים בְּיוֹם מִשְׂחָק. בְּגִיל הַזֶּה שְׁתֵּי מִשְׁמָרוֹת קְצָרוֹת בְּיוֹם ` +
          `שׁוֹמְרוֹת עַל הָרָצוֹן לַחְזוֹר יוֹתֵר טוֹב מֵאַחַת אֲרֻכָּה.`);
      }
    }

    // 7. Ready to move on.
    const solid = report.skills.filter(s => s.status === 'solid');
    if (solid.length >= 3) {
      push(4, 'מָה שֶׁכְּבָר יוֹשֵׁב',
        solid.map(s => s.label).join(' · ') + '. אֵין צֹרֶךְ לַחְזוֹר עֲלֵיהֶם.');
    }

    return out.sort((a, b) => a.priority - b.priority).slice(0, 6);
  },

  /**
   * The exact payload the export button writes to a file.
   *
   * `save` is the complete save, so this file is both a report to hand to
   * someone and a working backup to restore from — the two things a parent
   * would otherwise need two buttons and two explanations for.
   */
  exportPayload(save) {
    return {
      game: 'tower-control',
      version: 3,
      exportedAt: new Date().toISOString(),
      // Readable summary, for a human or a script that only wants the headline.
      player: save.playerName || '',
      currentStage: save.currentStage,
      stagesCompleted: save.stagesCompleted,
      shiftsCompleted: save.shiftsCompleted,
      flightHours: save.flightHours,
      streakDays: save.streakDays,
      planesCollected: (save.planesCollected || []).length,
      log: save.log || [],
      // The restorable part.
      save,
    };
  },
};

if (typeof module !== 'undefined' && module.exports) module.exports = ANALYTICS;
