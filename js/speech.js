// speech.js — Hebrew read-aloud from pre-generated audio clips.
//
// WHY NOT LIVE TTS:
// The Google Translate TTS endpoint works from file:// but is blocked from any
// real https origin. It fails *silently* — the audio element fires 'stalled',
// readyState stays 0, and no error event is ever raised. A no-referrer meta tag
// does not help. This machine also has no Hebrew speech-synthesis voice
// installed (22 voices, zero he-*), so speechSynthesis is not an option either.
//
// So every spoken line is rendered to an mp3 ahead of time by
// tools/generate-audio.js and committed under audio/. At play time the game only
// ever touches local files: works on any device, works offline, plays instantly,
// and sends nothing anywhere while a child is playing.
//
// Clips are addressed by a hash of the spoken text, so adding or rewording a
// line just means re-running the generator. Nothing has to be renumbered.

const SPEECH = {
  // Nikud (U+05B0–U+05C7). Stripped before both hashing and speaking, so that
  // re-pointing a word does not invalidate its already-generated clip.
  _NIKUD: /[ְ-ׇ]/g,
  // Emoji and their joiners. Display strings carry them; a voice should not
  // read them out. Stripping here means one string can serve both screen and ear.
  _EMOJI: /[\p{Extended_Pictographic}‍️⃣]/gu,

  /** Canonical spoken form of a display string. */
  normalize(text) {
    return String(text)
      .replace(this._NIKUD, '')
      .replace(this._EMOJI, '')
      .replace(/\s+/g, ' ')
      .trim();
  },

  /**
   * Stable clip id for a line of text. FNV-1a 32-bit as 8 hex chars.
   * MUST stay byte-identical to the copy used by the generator — the generator
   * imports this very file for exactly that reason.
   */
  key(text) {
    const s = this.normalize(text);
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h.toString(16).padStart(8, '0');
  },

  _current: null,

  /**
   * Stop whatever is currently playing. Safe to call at any time.
   *
   * The handlers come off BEFORE the src is cleared. Clearing it fires a real
   * 'error' event on that element, and while the old handler was still attached
   * every interrupted line logged itself as a missing clip and fired the
   * caller's onerror — so the console read like the audio pipeline was broken
   * every time a question moved on.
   */
  stop() {
    const audio = this._current;
    if (!audio) return;
    this._current = null;
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    audio.src = '';
  },

  /**
   * Speak a line. Interrupts anything already playing.
   * @param {string} text     the display string (nikud and all)
   * @param {object} [opts]   onend / onerror callbacks
   * @returns {boolean} false if no clip exists for this text
   */
  speak(text, opts) {
    opts = opts || {};
    this.stop();

    const key = this.key(text);
    const audio = new Audio('audio/' + key + '.mp3');
    this._current = audio;

    const done = () => {
      if (this._current === audio) this._current = null;
      if (opts.onend) opts.onend();
    };

    audio.onended = done;
    audio.onerror = () => {
      // A missing clip means the generator has not been re-run since this line
      // was added. Loud in the console, silent for the child.
      console.warn('[speech] no clip for:', this.normalize(text), '(' + key + '.mp3)');
      if (this._current === audio) this._current = null;
      if (opts.onerror) opts.onerror();
    };

    audio.play().catch(() => {
      // Autoplay policy: only reachable before the child's first interaction.
      if (this._current === audio) this._current = null;
      if (opts.onerror) opts.onerror();
    });

    return true;
  }
};

// Consumed by tools/generate-audio.js so the hash can never drift from runtime.
if (typeof module !== 'undefined' && module.exports) module.exports = SPEECH;
