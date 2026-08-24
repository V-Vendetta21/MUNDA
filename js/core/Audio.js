/* ============================================================
   MUNDA — Audio.js
   Procedural sound design via Web Audio API.
   Subtle industrial/electronic effects — no external assets.
   Context is created lazily on first user gesture (autoplay policy).
   ============================================================ */
(function (global) {
  'use strict';
  const MUNDA = global.MUNDA;

  const Audio = {
    ctx: null,
    master: null,
    ready: false,

    // must be called from a user gesture at least once
    init() {
      if (this.ready) { this.resume(); return; }
      try {
        const AC = global.AudioContext || global.webkitAudioContext;
        if (!AC) { this.ready = false; return; }
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.volume();
        this.master.connect(this.ctx.destination);
        this.ready = true;
      } catch (e) { this.ready = false; }
    },

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },

    volume() {
      const s = MUNDA.state.settings;
      return s.muted ? 0 : (s.soundVolume || 0.7);
    },

    setVolume() {
      if (this.master) this.master.gain.setTargetAtTime(this.volume(), this.ctx.currentTime, 0.02);
    },

    // ---- low-level helpers ----
    _tone(freq, t, dur, type, gain) {
      if (!this.ready) return;
      const c = this.ctx;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + dur + 0.02);
    },

    _noise(t, dur, gain, freq) {
      if (!this.ready) return;
      const c = this.ctx;
      const len = Math.max(1, Math.floor(c.sampleRate * dur));
      const buf = c.createBuffer(1, len, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = c.createBufferSource(); src.buffer = buf;
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 0.8;
      const g = c.createGain();
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(bp); bp.connect(g); g.connect(this.master);
      src.start(t);
    },

    _schedule(fn, offset) {
      if (!this.ready) return;
      this.resume();
      fn(this.ctx.currentTime + (offset || 0));
    },

    // ---- public SFX ----
    click() { this._schedule((t) => this._tone(1150, t, 0.07, 'triangle', 0.22)); },
    hover() { this._schedule((t) => this._tone(760, t, 0.05, 'sine', 0.10)); },
    select() { this._schedule((t) => { this._tone(520, t, 0.09, 'sine', 0.16); this._tone(700, t + 0.03, 0.07, 'sine', 0.10); }); },
    connect() { this._schedule((t) => { this._tone(660, t, 0.11, 'sine', 0.20); this._tone(990, t + 0.07, 0.16, 'sine', 0.18); }); },
    disconnect() { this._schedule((t) => this._tone(330, t, 0.08, 'sine', 0.10)); },
    wrong() { this._schedule((t) => { this._tone(210, t, 0.18, 'square', 0.12); this._tone(150, t + 0.05, 0.22, 'square', 0.10); }); },
    fail() {
      this._schedule((t) => {
        this._tone(320, t, 0.22, 'sawtooth', 0.10);
        this._tone(180, t + 0.10, 0.35, 'sawtooth', 0.09);
        this._tone(110, t + 0.20, 0.6, 'triangle', 0.12);
        this._noise(t, 0.4, 0.10, 900);
      });
    },
    complete() {
      this._schedule((t) => {
        const notes = [523, 659, 784, 1047];
        notes.forEach((f, i) => this._tone(f, t + i * 0.10, 0.30, 'sine', 0.16));
        this._noise(t + 0.42, 0.25, 0.05, 4000);
      });
    },
    perfect() {
      this._schedule((t) => {
        const notes = [784, 988, 1175, 1568];
        notes.forEach((f, i) => { this._tone(f, t + i * 0.07, 0.22, 'sine', 0.14); this._tone(f * 2, t + i * 0.07, 0.16, 'triangle', 0.06); });
      });
    },
    spark() { this._schedule((t) => this._noise(t, 0.18, 0.16, 2600)); },
    streak() { this._schedule((t) => this._tone(880, t, 0.08, 'sine', 0.14)); },
    back() { this._schedule((t) => this._tone(600, t, 0.08, 'triangle', 0.14)); },
  };

  MUNDA.audio = Audio;

})(typeof window !== 'undefined' ? window : this);
