/* ============================================================
   MUNDA — StripRenderer.js
   The MUNDA flexible textile LED lighting strip.
   A wavy, fabric-like band whose nodes light up as connections
   are completed. Illuminates end-to-end on completion, and
   flickers out on a quality-control failure.
   ============================================================ */
(function (global) {
  'use strict';
  const MUNDA = global.MUNDA;
  const U = MUNDA;

  const S = {
    canvas: null,
    ctx: null,
    cssW: 0, cssH: 0,
    dpr: 1,
    count: 0,
    nodes: [],          // {cur, target}
    band: 0, bandTarget: 0,
    flicker: null,      // {active, fail, t}
    sweep: null,        // {active, t}
    raf: null,
    lastT: 0,

    init: function () {
      this.canvas = document.getElementById('strip');
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      this.loop = this.loop.bind(this);
      this.raf = requestAnimationFrame(this.loop);
    },

    resize: function () {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      this.dpr = Math.min(global.devicePixelRatio || 1, 3);
      this.cssW = Math.max(rect.width, 10);
      this.cssH = Math.max(rect.height, 10);
      this.canvas.width = Math.round(rect.width * this.dpr);
      this.canvas.height = Math.round(rect.height * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    },

    setPuzzle: function (count) {
      this.count = count;
      this.nodes = [];
      for (let i = 0; i < count; i++) this.nodes.push({ cur: 0.18, target: 0.18 });
      this.band = 0.18; this.bandTarget = 0.18;
      this.flicker = null;
      this.sweep = null;
    },
    reset: function () {
      this.setPuzzle(this.count);
    },

    brighten: function (connected, total) {
      if (!this.nodes.length) return;
      // briefly brighten the strip, then settle to proportional level
      const ratio = connected / total;
      for (let i = 0; i < this.nodes.length; i++) {
        this.nodes[i].target = i < connected ? 1 : 0.18;
      }
      this.bandTarget = 0.3 + ratio * 0.7;
    },

    illuminate: function (ok) {
      if (ok) {
        this.sweep = { active: true, t: 0 };
        for (const n of this.nodes) n.target = 1;
        this.bandTarget = 1;
      } else {
        this.flicker = { active: true, t: 0, fail: true };
      }
    },

    loop: function (t) {
      this.lastT = t;
      this.step(16);
      this.draw();
      this.raf = requestAnimationFrame(this.loop);
    },

    step: function (dt) {
      const k = dt / 220;
      for (const n of this.nodes) n.cur = U.lerp(n.cur, n.target, Math.min(1, k));
      this.band = U.lerp(this.band, this.bandTarget, Math.min(1, k));

      if (this.sweep && this.sweep.active) {
        this.sweep.t += dt / 900;
        if (this.sweep.t >= 1) this.sweep.active = false;
      }
      if (this.flicker && this.flicker.active) {
        this.flicker.t += dt / 1000;
      }
    },

    nodeX: function (i) {
      const pad = 30;
      const span = this.cssW - pad * 2;
      return pad + (this.count <= 1 ? span / 2 : span * (i / (this.count - 1)));
    },
    bandY: function (x) {
      const amp = Math.min(4, this.cssH * 0.06);
      return this.cssH / 2 + Math.sin(x / this.cssW * Math.PI * 2 + 0.6) * amp;
    },

    ledColor: function () { return MUNDA.state.custom.ledColor || '#ffd9a0'; },
    ledSecond: function () { return MUNDA.state.custom.ledSecond || '#ffb347'; },

    draw: function () {
      const c = this.ctx;
      if (this.cssW === 0) return;
      c.clearRect(0, 0, this.cssW, this.cssH);

      const led = this.ledColor();
      const led2 = this.ledSecond();
      let band = this.band;

      // flicker on failure
      if (this.flicker && this.flicker.active) {
        const t = this.flicker.t;
        let m = 1;
        if (t < 0.7) m = 0.25 + 0.75 * Math.abs(Math.sin(t * 55));       // chaotic flicker
        else m = 0.05;                                                    // shut down
        band *= m;
        if (t > 0.75) band = 0;
      }

      // sweep highlight on completion
      let sweepX = -1;
      if (this.sweep && this.sweep.active) {
        sweepX = 30 + (this.cssW - 60) * U.easeInOut(this.sweep.t);
      }

      // textile underlay band (dark fabric edge)
      this.bandPath(c, 7, 'rgba(0,0,0,0.35)');

      // main glowing band
      c.save();
      c.globalAlpha = 0.35 + band * 0.65;
      c.shadowColor = led;
      c.shadowBlur = 18 + band * 20;
      this.bandPath(c, 4.5, U.mix(led2, led, band));
      // bright core
      if (band > 0.2) {
        c.globalAlpha = 0.8 * band;
        c.shadowBlur = 10;
        this.bandPath(c, 1.8, '#ffffff');
      }
      c.restore();

      // sweep leading spark
      if (sweepX >= 0) {
        c.save();
        c.shadowBlur = 24; c.shadowColor = '#ffffff';
        c.fillStyle = '#ffffff';
        c.beginPath(); c.arc(sweepX, this.bandY(sweepX), 4, 0, Math.PI * 2); c.fill();
        c.restore();
      }

      // LED nodes
      for (let i = 0; i < this.nodes.length; i++) {
        const n = this.nodes[i];
        const x = this.nodeX(i), y = this.bandY(x);
        c.save();
        c.globalAlpha = 0.25 + n.cur * 0.75;
        c.shadowColor = led;
        c.shadowBlur = n.cur * 22;
        const g = c.createRadialGradient(x, y, 0, x, y, 7);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.5, led);
        g.addColorStop(1, led2);
        c.fillStyle = g;
        c.beginPath(); c.arc(x, y, 3.2 + n.cur * 2, 0, Math.PI * 2); c.fill();
        c.restore();
      }
    },

    bandPath: function (c, width, color) {
      c.save();
      c.strokeStyle = color;
      c.lineWidth = width;
      c.lineCap = 'round';
      c.lineJoin = 'round';
      const steps = 32;
      c.beginPath();
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * this.cssW;
        const y = this.bandY(x);
        if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.stroke();
      c.restore();
    },
  };

  MUNDA.StripRenderer = S;

})(typeof window !== 'undefined' ? window : this);
