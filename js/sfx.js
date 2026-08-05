// sfx.js — the game's sound effects, synthesised in the browser.
//
// Deliberately file-free. The read-aloud clips under audio/ are the voice; these
// are the cockpit. Generating them with WebAudio means no extra download, no
// extra latency, nothing to keep in sync with the curriculum, and they still
// work with the tab offline.
//
// Nothing here ever plays over a spoken line for long: every effect is under
// half a second except the rank-up fanfare.

const SFX = {
  _ctx: null,
  enabled: true,

  /** Browsers only allow an AudioContext after a gesture, so create it lazily. */
  _audio() {
    if (!this.enabled) return null;
    if (!this._ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { this._ctx = new AC(); } catch (e) { return null; }
    }
    if (this._ctx.state === 'suspended') this._ctx.resume();
    return this._ctx;
  },

  /** One shaped tone. gain stays low — this plays next to a child's ears. */
  _tone(freq, start, dur, { type = 'sine', gain = 0.14, glide = null } = {}) {
    const ctx = this._audio();
    if (!ctx) return;
    const t0  = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (glide) osc.frequency.exponentialRampToValueAtTime(glide, t0 + dur);

    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  },

  /** Filtered white noise — wind, tyres, radio hiss. */
  _noise(start, dur, { gain = 0.05, freq = 900, q = 0.7 } = {}) {
    const ctx = this._audio();
    if (!ctx) return;
    const t0     = ctx.currentTime + start;
    const frames = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf    = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data   = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = freq;
    filt.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    src.connect(filt).connect(g).connect(ctx.destination);
    src.start(t0);
    src.stop(t0 + dur);
  },

  // ===== the effects =====

  /** Every numpad press. Short and dry so fast typing does not smear. */
  click() { this._tone(660, 0, 0.05, { type: 'square', gain: 0.05 }); },

  /** A digit joining the answer — a touch higher than a plain click. */
  key(n) { this._tone(520 + n * 28, 0, 0.06, { type: 'triangle', gain: 0.07 }); },

  /** Correct. The chord climbs with the streak, so momentum is audible. */
  correct(combo = 0) {
    const base = 523.25 * Math.pow(2, Math.min(combo, 6) / 12); // up a semitone per streak step
    [0, 4, 7].forEach((semi, i) =>
      this._tone(base * Math.pow(2, semi / 12), i * 0.07, 0.28, { type: 'triangle', gain: 0.11 }));
  },

  /** Wrong. A radio squelch, not a buzzer — nothing here says "you failed". */
  retry() {
    this._noise(0, 0.13, { gain: 0.045, freq: 1400, q: 1.2 });
    this._tone(300, 0.02, 0.12, { type: 'sine', gain: 0.06, glide: 240 });
  },

  /** The answer being handed over after three tries. Warm, not final. */
  reveal() {
    this._tone(392, 0,    0.22, { type: 'sine', gain: 0.1 });
    this._tone(523, 0.14, 0.30, { type: 'sine', gain: 0.1 });
  },

  /** Wheels down. */
  land() {
    this._noise(0, 0.42, { gain: 0.075, freq: 420, q: 0.5 });
    this._tone(140, 0, 0.32, { type: 'sine', gain: 0.1, glide: 90 });
  },

  /** A plane crossing the screen, a level opening. */
  whoosh() { this._noise(0, 0.3, { gain: 0.04, freq: 700, q: 0.4 }); },

  /** Radio keyed on, before a new call comes in. */
  radio() {
    this._noise(0, 0.07, { gain: 0.035, freq: 2000, q: 2 });
    this._tone(880, 0.05, 0.06, { type: 'square', gain: 0.04 });
  },

  /** Promotion. The only effect allowed to take its time. */
  rankUp() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      this._tone(f, i * 0.11, 0.42, { type: 'triangle', gain: 0.12 }));
  },

  /** A rare card turning over. */
  rare() {
    [784, 988, 1319].forEach((f, i) =>
      this._tone(f, i * 0.06, 0.5, { type: 'sine', gain: 0.09 }));
  },
};

if (typeof module !== 'undefined' && module.exports) module.exports = SFX;
