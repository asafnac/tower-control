// progress.js — localStorage persistence layer
// localStorage key: 'tower_control_save'
// Schema:
// {
//   playerName: string,
//   currentStage: number (1-7),
//   planesCollected: number[],    // PLANE_TYPES ids
//   stagesCompleted: number[],    // stage ids
//   shiftsCompleted: number,
//   currentStageShifts: number,  // resets to 0 on stage advance
//   rank: string
// }

const RANKS = [
  { name: 'מתלמד',       emoji: '⭐',  minStage: 1 },
  { name: 'פקח',         emoji: '✈️', minStage: 2 },
  { name: 'פקח בכיר',   emoji: '🛫', minStage: 4 },
  { name: 'מפקח',        emoji: '🏆', minStage: 6 },
  { name: 'מפקח ראשי',  emoji: '👑', minStage: 8 }, // achieved after stage 7 done
];

const PROGRESS = {
  _key: 'tower_control_save',

  _default() {
    return {
      playerName: '',
      currentStage: 1,
      planesCollected: [],
      stagesCompleted: [],
      shiftsCompleted: 0,
      currentStageShifts: 0,
      rank: 'מתלמד'
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
    localStorage.setItem(this._key, JSON.stringify(data));
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
      data.currentStage = Math.min(next, 7);
    }
    const rank = PROGRESS.getRankForStage(data.currentStage);
    data.rank = rank.name;
    return data;
  }
};
