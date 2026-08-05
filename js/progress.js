// progress.js — localStorage persistence layer
// localStorage key: 'tower_control_save'
// Schema:
// {
//   playerName: string,
//   currentStage: number (1..CURRICULUM.stages.length),
//   planesCollected: number[],    // PLANE_TYPES ids
//   stagesCompleted: number[],    // stage ids
//   shiftsCompleted: number,
//   currentStageShifts: number,   // resets to 0 on stage advance
//   rank: string,
//   flightHours: number,          // cumulative score — only ever goes up
//   bestCombo: number,            // longest run of correct answers, ever
//   streakDays: number,           // consecutive calendar days played
//   lastPlayedDay: string,        // 'YYYY-MM-DD', local time
//   soundOn: boolean,
//   mission: { day: string, id: string, done: boolean }
// }
//
// Every field is additive: an older save loads through Object.assign onto the
// defaults, so a child who played last month keeps his planes and his rank.

const RANKS = [
  { name: 'מִתְלַמֵּד',              emoji: '⭐',  minStage: 1 },
  { name: 'פַּקָּח',                  emoji: '✈️', minStage: 2 },
  { name: 'פַּקָּח בְּכִיר',         emoji: '🛫', minStage: 4 },
  { name: 'מְפַקֵּחַ',                emoji: '🏆', minStage: 6 },
  { name: 'מְפַקֵּחַ רָאשִׁי',       emoji: '👑', minStage: 8 },
  { name: 'מְפַקֵּד מִגְדָּל',        emoji: '🎖️', minStage: 10 },
  { name: 'מְפַקֵּד מֶרְחָב אֲוִירִי', emoji: '🛰️', minStage: 12 },
  { name: 'אַלּוּף הַשָּׁמַיִם',      emoji: '🌟', minStage: 14 },
];

const PROGRESS = {
  _key: 'tower_control_save',

  /** Highest port that exists. Read from the curriculum so adding a port here
   *  needs no change there. */
  maxStage() {
    return (typeof CURRICULUM !== 'undefined') ? CURRICULUM.stages.length : 14;
  },

  /** Local calendar day. Not UTC: a child playing at 22:00 must not roll over. */
  today(now) {
    const d = now || new Date();
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  },

  _default() {
    return {
      playerName: '',
      currentStage: 1,
      planesCollected: [],
      stagesCompleted: [],
      shiftsCompleted: 0,
      currentStageShifts: 0,
      rank: 'מִתְלַמֵּד',
      flightHours: 0,
      bestCombo: 0,
      streakDays: 0,
      lastPlayedDay: '',
      soundOn: true,
      mission: null,
      bridgeTaught: false,   // has the ladder introduced itself once?
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this._key);
      if (!raw) return this._default();
      return Object.assign(this._default(), JSON.parse(raw));
    } catch (e) {
      return this._default();
    }
  },

  save(data) {
    try {
      localStorage.setItem(this._key, JSON.stringify(data));
    } catch (e) {
      // A full or blocked localStorage must never interrupt a shift.
      console.warn('[progress] could not save:', e.message);
    }
  },

  getRankForStage(currentStage) {
    let rank = RANKS[0];
    for (const r of RANKS) {
      if (currentStage >= r.minStage) rank = r;
    }
    return rank;
  },

  addPlane(data, planeId) {
    if (!data.planesCollected.includes(planeId)) {
      data.planesCollected.push(planeId);
    }
    return data;
  },

  completeStage(data, stageId) {
    if (!data.stagesCompleted.includes(stageId)) {
      data.stagesCompleted.push(stageId);
    }
    const next = stageId + 1;
    if (next > data.currentStage) {
      data.currentStage = Math.min(next, this.maxStage());
    }
    data.rank = this.getRankForStage(data.currentStage).name;
    return data;
  },

  /**
   * Register a day of play and return the streak that should be shown.
   * Same day → unchanged. Yesterday → +1. Anything older → back to 1.
   * A broken streak is never announced; the counter simply starts again.
   */
  touchDay(data, now) {
    const today = this.today(now);
    if (data.lastPlayedDay === today) return data.streakDays;

    const yesterday = new Date((now || new Date()).getTime() - 86400000);
    data.streakDays = (data.lastPlayedDay === this.today(yesterday))
      ? (data.streakDays || 0) + 1
      : 1;
    data.lastPlayedDay = today;
    return data.streakDays;
  },

  /** The mission for today. Same one all day, a new one tomorrow. */
  missionForDay(day) {
    const list = MESSAGES.missions;
    // Sum of the digits in the date — a stable, dependency-free day index.
    const n = day.split('-').reduce((s, part) => s + parseInt(part, 10), 0);
    return list[n % list.length];
  },

  /** Today's mission plus whether it has already been completed today. */
  currentMission(data, now) {
    const day = this.today(now);
    const def = this.missionForDay(day);
    const done = !!(data.mission && data.mission.day === day && data.mission.done);
    return { day, id: def.id, text: def.text, check: def.check, done };
  },

  markMissionDone(data, day) {
    data.mission = { day, id: this.missionForDay(day).id, done: true };
    return data;
  },

  /**
   * Fold another device's save into this one, losing nothing from either.
   *
   * This is what makes a tablet and a laptop one child rather than two. Every
   * field takes the side that represents more play — never "the newer file
   * wins", because the newer file may be the one from the device he used once.
   *
   * Answer rows are unioned on their timestamp: they are millisecond-stamped at
   * the moment a question ends, so a collision between two devices is not a
   * thing that happens, and re-importing the same file twice is a no-op.
   */
  merge(local, incoming) {
    if (!incoming || typeof incoming !== 'object') return local;
    const out = Object.assign(this._default(), local);
    const union = (a, b) => [...new Set([...(a || []), ...(b || [])])].sort((x, y) => x - y);
    const maxOf = (a, b) => Math.max(Number(a) || 0, Number(b) || 0);

    out.playerName        = local.playerName || incoming.playerName || '';
    out.currentStage      = Math.min(maxOf(local.currentStage, incoming.currentStage) || 1,
                                     this.maxStage());
    out.stagesCompleted   = union(local.stagesCompleted, incoming.stagesCompleted);
    out.planesCollected   = union(local.planesCollected, incoming.planesCollected);
    out.shiftsCompleted   = maxOf(local.shiftsCompleted, incoming.shiftsCompleted);
    out.flightHours       = maxOf(local.flightHours, incoming.flightHours);
    out.bestCombo         = maxOf(local.bestCombo, incoming.bestCombo);
    out.streakDays        = maxOf(local.streakDays, incoming.streakDays);
    out.currentStageShifts = maxOf(local.currentStageShifts, incoming.currentStageShifts);
    out.bridgeTaught      = !!(local.bridgeTaught || incoming.bridgeTaught);
    // Settings belong to the device you are holding.
    out.soundOn           = local.soundOn !== false;
    out.lastPlayedDay     = [local.lastPlayedDay, incoming.lastPlayedDay]
                              .filter(Boolean).sort().pop() || '';
    // A mission counts as done if either device finished it today.
    const today = this.today();
    const doneToday = m => m && m.day === today && m.done;
    out.mission = doneToday(local.mission) ? local.mission
                : (doneToday(incoming.mission) ? incoming.mission : local.mission || null);

    const seen = new Set();
    out.log = [...(local.log || []), ...(incoming.log || [])]
      .filter(r => r && typeof r.t === 'number')
      .filter(r => { const k = r.t + ':' + r.a + ':' + r.b; if (seen.has(k)) return false;
                     seen.add(k); return true; })
      .sort((x, y) => x.t - y.t);
    const cap = (typeof ANALYTICS !== 'undefined') ? ANALYTICS.MAX_ROWS : 1500;
    if (out.log.length > cap) out.log = out.log.slice(-cap);

    out.rank = this.getRankForStage(out.currentStage).name;
    return out;
  },

  addFlightHours(data, n) {
    data.flightHours = (data.flightHours || 0) + n;
    return data;
  },
};

if (typeof module !== 'undefined' && module.exports) module.exports = { PROGRESS, RANKS };
