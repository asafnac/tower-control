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

  // ===== INSTALLING TO THE HOME SCREEN =====
  // Chrome will offer this in a menu, eventually, several items down, under a
  // name that changes between versions — and not at all inside the in-app
  // browser that a link from a chat opens in. A parent standing in front of a
  // tablet should not have to hunt for it. The browser hands us the prompt; we
  // put it behind a button in the game where it can be found.
  _installEvent: null,

  /** True once the browser has told us it is willing to install this page. */
  installable() { return !!this._installEvent; },

  /** Already running as an installed app — nothing left to offer. */
  installed() {
    try {
      return (window.matchMedia &&
              (window.matchMedia('(display-mode: standalone)').matches ||
               window.matchMedia('(display-mode: fullscreen)').matches)) ||
             window.navigator.standalone === true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Show the browser's own install dialog.
   *
   * The saved event is single-use: once prompted it is spent, whatever the
   * child's parent then taps, so it is cleared before the await rather than
   * after — a second press on a dead event throws.
   */
  async promptInstall() {
    const evt = this._installEvent;
    if (!evt) return { ok: false, reason: this.installed() ? 'already-installed' : 'not-offered' };
    this._installEvent = null;
    try {
      evt.prompt();
      const choice = await evt.userChoice;
      return { ok: choice && choice.outcome === 'accepted', outcome: choice && choice.outcome };
    } catch (e) {
      return { ok: false, reason: e.message || 'failed' };
    }
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

// Chrome fires this once, early, and only if it has decided the page qualifies.
// It has to be caught at load: by the time the parent opens the report the
// event is long gone, and an uncaught one shows Chrome's own banner instead.
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    OFFLINE._installEvent = e;
    // The report screen may already be open and showing "not offered".
    if (typeof renderInstallButton === 'function') {
      try { renderInstallButton(); } catch (err) { /* the report is not open */ }
    }
  });
  window.addEventListener('appinstalled', () => { OFFLINE._installEvent = null; });
}

if (typeof module !== 'undefined' && module.exports) module.exports = OFFLINE;
