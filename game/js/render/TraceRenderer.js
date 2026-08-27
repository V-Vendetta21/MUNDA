/* ============================================================
   MUNDA — TraceRenderer.js
   Renders the "print a MUNDA circuit" pre-assembly phase on the
   wiring board canvas: a dotted target circuit in an ASCII/terminal
   aesthetic, the pointer's live trace trail, a tracking head that
   sweeps along the path, and a coverage readout.
   ============================================================ */
(function (global) {
  'use strict';
  const MUNDA = global.MUNDA;
  const U = MUNDA;

  const R = {
    active: false,
    trace: null,        // { shape, points }
    pointsPx: [],       // target points mapped to px
    tracePath: [],      // pointer trail in px
    coverage: 0,        // 0..1
    onDone: null,
    canvas: null, ctx: null,
    cssW: 0, cssH: 0, dpr: 1,
    raf: null, lastT: 0,
    head: 0,            // animated head position 0..1
    held: false,        // pointer is down and actively drawing
    done: false,

    init: function () {
      this.canvas = document.getElementById('wires');
      this.ctx = this.canvas.getContext('2d');
    },

    begin: function (trace, cb) {
      this.active = true;
      this.trace = trace;
      this.onDone = cb;
      this.tracePath = [];
      this.coverage = 0;
      this.head = 0;
      this.held = false;
      this.done = false;
      this.resize();
      if (!this.raf) { this.loop = this.loop.bind(this); this.raf = requestAnimationFrame(this.loop); }
      const btn = document.getElementById('trace-print');
      if (btn) btn.hidden = false;
      MUNDA.Screens.setStripStatus(MUNDA.t('hint.trace.hold'));
      MUNDA.Screens.setHint(MUNDA.t('hint.trace.hold'));
    },

    // ---- hold-to-draw input ----
    pointerDown: function (x, y) {
      if (!this.active || this.done) return;
      this.held = true;
      this.tracePath = [{ x, y }];
      this.coverage = 0;
      this.head = 0;
      MUNDA.audio.select?.();
      MUNDA.Screens.setHint(MUNDA.t('hint.trace') + ' · 0%');
    },

    // draw while the pointer is held down
    pointer: function (x, y) {
      if (!this.active || this.done || !this.held) return;
      const p = { x, y };
      const last = this.tracePath[this.tracePath.length - 1];
      if (!last || Math.hypot(x - last.x, y - last.y) > 3) this.tracePath.push(p);
      // recompute coverage: fraction of target points within tol of the trail
      const tol = Math.max(18, Math.min(30, this.cssW * 0.035));
      let traced = 0;
      for (const t of this.pointsPx) {
        for (const q of this.tracePath) { if (Math.hypot(q.x - t.x, q.y - t.y) <= tol) { traced++; break; } }
      }
      this.coverage = this.pointsPx.length ? traced / this.pointsPx.length : 0;
      const acc = MUNDA.CircuitTrace.accuracy(this.coverage);
      MUNDA.Screens.setHint(MUNDA.t('hint.trace') + ' · ' + acc + '%');
      MUNDA.audio.trace?.();
      if (this.coverage >= 1) { this.done = true; this.held = false; this.complete(); }
    },

    // release prints what was drawn
    pointerUp: function (x, y) {
      if (!this.active || this.done) return;
      this.held = false;
      this.complete();
    },

    // Finalize the trace now with the current coverage (lets the player
    // lock in a partial/imperfect print — down to the 10% floor).
    printNow: function () {
      if (!this.active || this.done) return;
      this.held = false;
      this.complete();
    },

    resize: function () {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      this.dpr = Math.min(global.devicePixelRatio || 1, 3);
      this.cssW = rect.width; this.cssH = rect.height;
      this.canvas.width = Math.round(rect.width * this.dpr);
      this.canvas.height = Math.round(rect.height * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      if (this.trace) this.pointsPx = this.trace.points.map((p) => ({ x: p.x * this.cssW, y: p.y * this.cssH }));
    },

    complete: function () {
      if (!this.active) return;
      const acc = MUNDA.CircuitTrace.accuracy(this.coverage);
      this.active = false;
      MUNDA.audio.print?.();
      const cb = this.onDone;
      this.onDone = null;
      if (cb) cb(acc);
    },

    cancel: function () {
      this.active = false;
      this.trace = null;
      const btn = document.getElementById('trace-print');
      if (btn) btn.hidden = true;
    },

    // ---- animation loop ----
    loop: function (t) {
      if (!this.active) { this.raf = null; return; }
      this.lastT = t;
      this.draw();
      this.raf = requestAnimationFrame(this.loop);
    },

    draw: function () {
      const c = this.ctx;
      if (!this.trace || this.cssW === 0) return;
      c.clearRect(0, 0, this.cssW, this.cssH);

      // subtle terminal grid background
      c.strokeStyle = 'rgba(255,255,255,0.03)';
      c.lineWidth = 1;
      for (let x = 0; x < this.cssW; x += 28) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, this.cssH); c.stroke(); }
      for (let y = 0; y < this.cssH; y += 28) { c.beginPath(); c.moveTo(0, y); c.lineTo(this.cssW, y); c.stroke(); }

      // target circuit: dotted line (dimmer, static)
      this.drawTarget(c);
      // trace trail: bright printed path
      this.drawTrail(c);
      // tracking head sweeping along the target
      this.drawHead(c);
    },

    drawTarget: function (c) {
      const pts = this.pointsPx;
      // dotted outline
      c.save();
      c.setLineDash([2, 9]);
      c.strokeStyle = 'rgba(255,255,255,0.30)';
      c.lineWidth = 1.4;
      c.beginPath();
      pts.forEach((p, i) => { if (i === 0) c.moveTo(p.x, p.y); else c.lineTo(p.x, p.y); });
      c.closePath(); c.stroke();
      c.setLineDash([]);
      // dots at each sample point
      for (const p of pts) {
        c.beginPath(); c.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        c.fillStyle = 'rgba(255,255,255,0.55)'; c.fill();
      }
      c.restore();
      // ASCII-art shape label in the corner
      c.save();
      c.fillStyle = 'rgba(255,255,255,0.5)';
      c.font = '700 10px "Roboto Mono", monospace';
      c.textAlign = 'left';
      const shape = String(this.trace.shape).toUpperCase();
      c.fillText('▓ PRINT CIRCUIT ▓ ' + shape, 14, 22);
      c.restore();
    },

    drawTrail: function (c) {
      if (this.tracePath.length < 2) return;
      c.save();
      c.shadowColor = '#ffffff';
      c.shadowBlur = 12;
      c.strokeStyle = 'rgba(255,255,255,0.9)';
      c.lineWidth = 3;
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath();
      this.tracePath.forEach((p, i) => { if (i === 0) c.moveTo(p.x, p.y); else c.lineTo(p.x, p.y); });
      c.stroke();
      c.restore();
    },

    drawHead: function (c) {
      if (!this.pointsPx.length) return;
      // animate head along target path; faster with more coverage
      const speed = 0.0009 + this.coverage * 0.0016;
      this.head = (this.head + speed) % 1;
      const idx = Math.floor(this.head * this.pointsPx.length);
      const p = this.pointsPx[Math.min(idx, this.pointsPx.length - 1)];
      const pulse = Math.sin(this.lastT / 90) * 0.5 + 0.5;
      c.save();
      c.shadowColor = '#fff'; c.shadowBlur = 16 + pulse * 10;
      c.fillStyle = 'rgba(255,255,255,' + (0.7 + pulse * 0.3) + ')';
      c.beginPath(); c.arc(p.x, p.y, 5 + pulse * 1.5, 0, Math.PI * 2); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1;
      c.beginPath(); c.arc(p.x, p.y, 9 + pulse * 3, 0, Math.PI * 2); c.stroke();
      c.restore();
    },

  };

  MUNDA.TraceRenderer = R;
})(typeof window !== 'undefined' ? window : this);
