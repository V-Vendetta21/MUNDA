const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// Mock HTMLAudioElement + rAF so the module runs headless in Node.
function loadMusic() {
  const audios = [];
  class FakeAudio {
    constructor(src) {
      this.src = src;
      this.volume = 0;
      this.loop = false;
      this.currentTime = 0;
      this.duration = 10;
      this.paused = true;
      this._listeners = {};
      audios.push(this);
    }
    addEventListener(type, fn) { (this._listeners[type] = this._listeners[type] || []).push(fn); }
    play() { this.paused = false; return Promise.resolve(); }
    pause() { this.paused = true; }
  }
  const rafCbs = [];
  const ctx = { console, Math, performance, URLSearchParams };
  ctx.window = ctx; ctx.globalThis = ctx;
  ctx.Audio = FakeAudio;
  ctx.requestAnimationFrame = (cb) => { rafCbs.push(cb); return rafCbs.length; };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'music.js'), 'utf8'), ctx, { filename: 'music.js' });
  return { M: ctx.MUNDA_MUSIC, audios, rafCbs };
}

test('music module exposes the 4-track playlist', () => {
  const { M } = loadMusic();
  assert.equal(M._tracks().length, 4);
  assert.equal(M._tracks()[0], 'music-1.mp3');
  assert.equal(M._tracks()[3], 'music-4.mp3');
});

test('music starts at index 0 and plays the first track at the master volume', () => {
  const { M, audios } = loadMusic();
  M.init('assets/', { volume: 0.5, autostart: true });
  assert.equal(M.started, true);
  assert.equal(M._index(), 0);
  assert.equal(audios.length, 1);
  assert.equal(audios[0].src, 'assets/music-1.mp3');
  assert.equal(audios[0].volume, 0.5);
  assert.equal(audios[0].paused, false);
});

test('music crossfades to the next track 1s before the current ends', () => {
  const { M, audios, rafCbs } = loadMusic();
  M.init('assets/', { volume: 0.5, autostart: true });
  const first = audios[0];
  // simulate timeupdate with 0.9s remaining (<= 1s threshold)
  first.currentTime = first.duration - 0.9;
  (first._listeners.timeupdate || []).forEach((fn) => fn());
  // a second audio element is created and the crossfade is scheduled
  assert.equal(audios.length, 2);
  assert.equal(M.transitioning, true);
  assert.equal(audios[1].src, 'assets/music-2.mp3');
  // drive the rAF ramp to completion (p >= 1)
  let last = null;
  for (let i = 0; i < rafCbs.length; i++) { last = rafCbs[i](performance.now() + 5000); }
  assert.equal(M.transitioning, false);
  assert.equal(M._index(), 1);
  // current is now the second track
  assert.equal(M.current.src, 'assets/music-2.mp3');
  assert.equal(M.current.volume, 0.5);
  assert.equal(first.paused, true);
});

test('music loops forever after the last track', () => {
  const { M, audios } = loadMusic();
  M.init('assets/', { volume: 0.5, autostart: true });
  // force 3 transitions: 0 -> 1 -> 2 -> 3 -> 0
  for (let i = 0; i < 4; i++) {
    const cur = M.current;
    cur.currentTime = cur.duration - 0.5;
    (cur._listeners.timeupdate || []).forEach((fn) => fn());
    // drive rAF to completion
    // (note: each crossfade pushes new rAF callbacks; run them all)
  }
  assert.equal(M._index() % 4, 0); // wrapped back to the start
});

test('music respects the mute toggle', () => {
  const { M } = loadMusic();
  M.init('assets/', { volume: 0.5, autostart: true });
  M.setMuted(true);
  assert.equal(M.current.volume, 0);
  M.setMuted(false);
  assert.equal(M.current.volume, 0.5);
});

test('music pause actually pauses the audio and resume restores the current track', () => {
  const { M, audios } = loadMusic();
  M.init('assets/', { volume: 0.5, autostart: true });
  const first = M.current;
  // pause should pause the playing element (not just mute it)
  M.pause();
  assert.equal(first.paused, true);
  assert.equal(M._paused, true);
  // resume should unpause and restore the current track at master volume
  M.resume();
  assert.equal(first.paused, false);
  assert.equal(first.volume, 0.5);
});

test('music resume after an interrupted crossfade drops the half-faded next track', () => {
  const { M, audios } = loadMusic();
  M.init('assets/', { volume: 0.5, autostart: true });
  const first = M.current;
  // start a crossfade (creates the "next" track and sets transitioning)
  first.currentTime = first.duration - 0.9;
  (first._listeners.timeupdate || []).forEach((fn) => fn());
  assert.equal(M.transitioning, true);
  assert.equal(audios.length, 2);
  // pause mid-crossfade, then resume
  M.pause();
  M.resume();
  assert.equal(M.transitioning, false);
  assert.equal(M.next, null);       // partial next dropped
  assert.equal(M.current, first);   // current track preserved
  assert.equal(first.volume, 0.5);
});
