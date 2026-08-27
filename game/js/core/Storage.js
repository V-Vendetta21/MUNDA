/* ============================================================
   MUNDA — Storage.js
   Persistence via localStorage with graceful fallback.
   ============================================================ */
(function (global) {
  'use strict';
  const MUNDA = global.MUNDA;

  const Memory = {};
  let available = false;
  try {
    const k = '__munda_test__';
    global.localStorage.setItem(k, '1');
    global.localStorage.removeItem(k);
    available = true;
  } catch (e) {
    available = false;
  }

  function read(key, fallback) {
    if (!available) return Memory[key] !== undefined ? Memory[key] : fallback;
    try {
      const raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    if (!available) { Memory[key] = value; return; }
    try { global.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  function loadState() {
    const D = MUNDA.DEFAULTS;
    const settings = Object.assign({}, D.settings, read(MUNDA.KEYS.SETTINGS, {}));
    const custom = Object.assign({}, D.custom, read(MUNDA.KEYS.CUSTOM, {}));
    const progress = Object.assign({}, D.progress, read(MUNDA.KEYS.PROGRESS, {}));
    progress.tutorialsSeen = Object.assign({}, D.progress.tutorialsSeen, progress.tutorialsSeen || {});
    progress.dailyResults = Object.assign({}, D.progress.dailyResults, progress.dailyResults || {});
    progress.schemaVersion = 2;
    const sound = Object.assign({}, read(MUNDA.KEYS.SOUND, {}), {});
    return { settings, custom, progress, sound };
  }

  function saveSettings(s) { write(MUNDA.KEYS.SETTINGS, s); }
  function saveCustom(c) { write(MUNDA.KEYS.CUSTOM, c); }
  function saveProgress(p) { write(MUNDA.KEYS.PROGRESS, p); }
  function saveSound(s) { write(MUNDA.KEYS.SOUND, s); }

  function resetAll() {
    write(MUNDA.KEYS.SETTINGS, MUNDA.DEFAULTS.settings);
    write(MUNDA.KEYS.CUSTOM, MUNDA.DEFAULTS.custom);
    write(MUNDA.KEYS.PROGRESS, MUNDA.DEFAULTS.progress);
    write(MUNDA.KEYS.SOUND, {});
  }

  MUNDA.storage = {
    available,
    read, write,
    loadState, saveSettings, saveCustom, saveProgress, saveSound, resetAll,
  };

})(typeof window !== 'undefined' ? window : this);
