/* ============================================================
   MUNDA — Background music (js/music.js)
   Crossfading playlist loop for the website and the game.
   Plays each track in sequence; 1 second before a track ends it
   crossfades into the next, and the playlist loops forever.

   Shared by both pages:
     - website index.html   -> js/music.js  (base 'assets/')
     - game  game/index.html -> ../js/music.js (base '../assets/')
   ============================================================ */
(function (global) {
  'use strict';

  const Music = {
    tracks: [
      'music-1.mp3',
      'music-2.mp3',
      'music-3.mp3',
      'music-4.mp3',
    ],
    base: '',            // path prefix, set in init()
    index: 0,
    current: null,       // HTMLAudioElement now playing
    next: null,          // HTMLAudioElement fading in
    master: 0.5,         // target volume
    muted: false,
    started: false,
    transitioning: false,
    fadeMs: 1000,        // crossfade duration (1s)

    // base: 'assets/' or '../assets/'
    // opts: { volume: 0..1, autostart: bool }
    init: function (base, opts) {
      opts = opts || {};
      this.base = base || '';
      if (typeof opts.volume === 'number') this.master = opts.volume;
      if (opts.autostart) this.start();
    },

    _url: function (name) {
      return this.base + name;
    },

    _make: function (name) {
      const a = new Audio(this._url(name));
      a.preload = 'auto';
      a.loop = false;
      a.volume = 0;
      a.addEventListener('ended', () => { if (!this.transitioning) this.forceNext(); });
      a.addEventListener('timeupdate', () => this._maybeTransition(a));
      return a;
    },

    start: function () {
      if (this.started) return;
      this.started = true;
      this.index = 0;
      this.current = this._make(this.tracks[0]);
      this.current.volume = this.muted ? 0 : this.master;
      const p = this.current.play();
      if (p && p.catch) p.catch(() => { /* autoplay blocked until gesture */ });
    },

    // fade to silence (respect mute) without stopping the loop engine
    pause: function () {
      if (this.current) this.current.volume = 0;
    },
    resume: function () {
      if (this.current && this.started) {
        this.current.volume = this.muted ? 0 : this.master;
        const p = this.current.play();
        if (p && p.catch) p.catch(() => {});
      }
    },

    setMuted: function (m) {
      this.muted = !!m;
      if (this.current) this.current.volume = this.muted ? 0 : this.master;
    },

    // called on timeupdate: start crossfade 1s before the track ends
    _maybeTransition: function (src) {
      if (src !== this.current || this.transitioning) return;
      if (!isFinite(src.duration) || src.duration <= 0) return;
      const remain = src.duration - src.currentTime;
      if (remain <= this.fadeMs / 1000) this._crossfade();
    },

    _crossfade: function () {
      if (this.transitioning || !this.current) return;
      this.transitioning = true;
      const nextIndex = (this.index + 1) % this.tracks.length;
      this.next = this._make(this.tracks[nextIndex]);
      this.next.volume = 0;
      const np = this.next.play();
      if (np && np.catch) np.catch(() => {});

      const out = this.current;
      const inEl = this.next;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / this.fadeMs);
        if (this.muted) { out.volume = 0; inEl.volume = 0; }
        else { out.volume = this.master * (1 - p); inEl.volume = this.master * p; }
        if (p < 1) { requestAnimationFrame(step); return; }
        // fade complete: swap
        try { out.pause(); } catch (e) {}
        this.current = inEl;
        this.next = null;
        this.index = nextIndex;
        this.transitioning = false;
      };
      requestAnimationFrame(step);
    },

    // hard jump (fallback if a track ends before the crossfade kicked in)
    forceNext: function () {
      if (!this.current) return;
      const nextIndex = (this.index + 1) % this.tracks.length;
      try { this.current.pause(); } catch (e) {}
      this.index = nextIndex;
      this.current = this._make(this.tracks[nextIndex]);
      this.current.volume = this.muted ? 0 : this.master;
      const p = this.current.play();
      if (p && p.catch) p.catch(() => {});
      this.transitioning = false;
    },

    // expose for testing
    _tracks: function () { return this.tracks; },
    _index: function () { return this.index; },
  };

  global.MUNDA_MUSIC = Music;
})(typeof window !== 'undefined' ? window : this);
