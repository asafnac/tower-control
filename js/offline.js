// offline.js — the page's side of the service worker.
//
// Registration is deliberately quiet: if it fails, or the game is running from
// a disk where service workers are not allowed at all, nothing here complains
// and nothing changes. Offline play is an addition, never a dependency.

const OFFLINE = {
  _reg: null,

  /** Service workers need a real origin — file:// will never have one. */
  possible() {
    return 'serviceWorker' in navigator &&
           (location.protocol === 'https:' || location.hostname === 'localhost');
  },

  async register() {
    if (!this.possible()) return null;
    try {
      this._reg = await navigator.serviceWorker.register('./sw.js');
      return this._reg;
    } catch (e) {
      console.warn('[offline] service worker not registered:', e.message);
      return null;
    }
  },

  async ready() {
    if (!this.possible()) return null;
    try { return await navigator.serviceWorker.ready; } catch (e) { return null; }
  },

  /**
   * Every clip the game could ever need, derived from the curriculum itself.
   *
   * Not a hand-kept list: it is the same collectSpokenLines() the generator and
   * the tests use, hashed the same way the player hashes it. A line added to the
   * curriculum is in this list automatically, and a list that could drift from
   * what the game asks for would be a list that silently under-caches.
   */
  audioUrls() {
    return collectSpokenLines().map(line => 'audio/' + SPEECH.key(line) + '.mp3');
  },

  /** Download the whole voice track. Progress arrives through onProgress. */
  async downloadAll(onProgress) {
    const reg = await this.ready();
    if (!reg || !reg.active) return { ok: false, reason: 'no-worker' };

    const urls = this.audioUrls();
    return new Promise(resolve => {
      const listener = e => {
        const m = e.data || {};
        if (m.type === 'PRECACHE_PROGRESS' && onProgress) onProgress(m.done, m.total, m.failed);
        if (m.type === 'PRECACHE_DONE') {
          navigator.serviceWorker.removeEventListener('message', listener);
          if (onProgress) onProgress(m.done, m.total, m.failed);
          resolve({ ok: true, ...m });
        }
      };
      navigator.serviceWorker.addEventListener('message', listener);
      reg.active.postMessage({ type: 'PRECACHE_AUDIO', urls });
    });
  },

  /** How much of the voice track is already on this device. */
  async cachedCount() {
    const reg = await this.ready();
    if (!reg || !reg.active) return null;
    return new Promise(resolve => {
      const listener = e => {
        if ((e.data || {}).type !== 'AUDIO_COUNT') return;
        navigator.serviceWorker.removeEventListener('message', listener);
        resolve(e.data.cached);
      };
      navigator.serviceWorker.addEventListener('message', listener);
      reg.active.postMessage({ type: 'AUDIO_COUNT' });
      setTimeout(() => resolve(null), 3000);
    });
  },

  /**
   * The escape hatch.
   *
   * A cache that has gone wrong is the one failure mode of this whole feature
   * that a parent cannot debug, so there is a button that removes every trace
   * of it — caches and worker both — and reloads clean. The save is untouched:
   * it lives in localStorage, which none of this goes near.
   */
  async reset() {
    try {
      const reg = await this.ready();
      if (reg && reg.active) {
        reg.active.postMessage({ type: 'CLEAR' });
        await new Promise(r => setTimeout(r, 400));
      }
      const names = await caches.keys();
      await Promise.all(names.filter(n => n.startsWith('tower-')).map(n => caches.delete(n)));
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    } catch (e) {
      console.warn('[offline] reset problem:', e.message);
    }
    location.reload();
  },
};

if (typeof module !== 'undefined' && module.exports) module.exports = OFFLINE;
