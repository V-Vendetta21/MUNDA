/* ============================================================
   MUNDA — BoardRenderer.js
   Canvas rendering for the wiring board: terminals, curved
   glowing textile wires, selection/drag states and animations.
   Works in CSS-pixel coordinates; backing store scaled by DPR.
   ============================================================ */
(function (global) {
  'use strict';
  const MUNDA = global.MUNDA;
  const U = MUNDA;

  const R = {
    canvas: null,
    ctx: null,
    cssW: 0, cssH: 0,
    dpr: 1,
    puzzle: null,
    params: null,
    selection: null,
    drag: null,
    hover: null,
    connectPulses: {},
    complete: null,
    failure: null,
    raf: null,
    lastT: 0,

    init: function () {
      this.canvas = document.getElementById('wires');
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      this.loop = this.loop.bind(this);
      this.raf = requestAnimationFrame(this.loop);
    },

    resize: function () {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      this.dpr = Math.min(global.devicePixelRatio || 1, 3);
      this.cssW = rect.width;
      this.cssH = rect.height;
      this.canvas.width = Math.round(rect.width * this.dpr);
      this.canvas.height = Math.round(rect.height * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    },

    setPuzzle: function (puzzle) {
      this.puzzle = puzzle;
      this.params = puzzle.params;
      this.selection = null;
      this.drag = null;
      this.hover = null;
      this.connectPulses = {};
      this.complete = null;
      this.failure = null;
    },

    setSelection: function (sel) { this.selection = sel; },
    setDrag: function (drag) { this.drag = drag; },

    setHover: function (x, y) {
      if (x < 0) { this.hover = null; this.hoverPos = null; return; }
      this.hover = this.hitTest(x, y);
      this.hoverPos = { x, y };
    },

    // ---- geometry ----
    radius: function () {
      const r = this.params ? this.params.terminalRadius : 20;
      const min = this.cssW < 500 ? 17 : 15;
      let rad = Math.max(r, min);
      // fit-clamp so terminals never overlap at high wire counts
      if (this.puzzle && this.cssH > 0) {
        const spacing = (this.cssH * 0.82) / Math.max(1, this.puzzle.count);
        rad = Math.min(rad, Math.max(min, spacing * 0.28));
      }
      return rad;
    },
    railX: function () { return Math.max(0.11 * this.cssW, 30 + this.radius()); },
    railX2: function () { return this.cssW - Math.max(0.11 * this.cssW, 30 + this.radius()); },

    termPos: function (wire, side) {
      const p = this.puzzle.wires[wire];
      const x = side === 'left' ? this.railX() : this.railX2();
      const y = U.clamp(p.leftYfrac * this.cssH, this.radius() + 6, this.cssH - this.radius() - 6);
      return { x, y };
    },
    termPosRight: function (wire) {
      const p = this.puzzle.wires[wire];
      const y = U.clamp(p.rightYfrac * this.cssH, this.radius() + 6, this.cssH - this.radius() - 6);
      return { x: this.railX2(), y };
    },

    hitTest: function (x, y) {
      if (!this.puzzle) return null;
      const tol = this.radius() + 8;
      for (const t of this.puzzle.right) {
        const pos = this.termPosRight(t.wire);
        if (U.dist(x, y, pos.x, pos.y) <= tol) return { wire: t.wire, side: 'right' };
      }
      for (const t of this.puzzle.left) {
        const pos = this.termPos(t.wire, 'left');
        if (U.dist(x, y, pos.x, pos.y) <= tol) return { wire: t.wire, side: 'left' };
      }
      return null;
    },

    wirePath: function (wire) {
      const p = this.puzzle.wires[wire];
      const x0 = this.railX(), y0 = U.clamp(p.leftYfrac * this.cssH, this.radius() + 6, this.cssH - this.radius() - 6);
      const x3 = this.railX2(), y3 = U.clamp(p.rightYfrac * this.cssH, this.radius() + 6, this.cssH - this.radius() - 6);
      const midX = (x0 + x3) / 2;
      const C = this.params ? this.params.curve : 0.5;
      const wav = (this.params ? this.params.routeNoise : 0) * 26;
      const wiggle = Math.sin(wire * 7.3 + 1.7) * wav;
      const c1y = y0 + (y3 - y0) * 0.22 * C + wiggle;
      const c2y = y3 - (y3 - y0) * 0.22 * C + wiggle;
      return { x0, y0, x3, y3, c1: { x: midX - this.cssW * 0.10, y: c1y }, c2: { x: midX + this.cssW * 0.10, y: c2y } };
    },

    _tracePath: function (path) {
      const c = this.ctx;
      c.beginPath();
      c.moveTo(path.x0, path.y0);
      c.bezierCurveTo(path.c1.x, path.c1.y, path.c2.x, path.c2.y, path.x3, path.y3);
    },

    // ---- animation triggers ----
    animateConnect: function (index) {
      this.connectPulses[index] = { t: 0 };
    },
    completeAnimation: function (cb) {
      this.complete = { active: true, t: 0, cb, done: false };
    },
    failureSequence: function (a, b, cb) {
      const sparks = [];
      for (let i = 0; i < 14; i++) {
        const src = Math.random() < 0.5 ? a : b;
        const pos = Math.random() < 0.5 ? this.termPos(src, 'left') : this.termPosRight(src);
        const ang = Math.random() * Math.PI * 2;
        const sp = U.rand(20, 70);
        sparks.push({ x: pos.x, y: pos.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 1, decay: U.rand(0.012, 0.03), size: U.rand(1.5, 3.5) });
      }
      this.failure = { active: true, t: 0, a, b, sparks, cb };
    },

    // ---- main loop ----
    loop: function (t) {
      this.lastT = t;
      this.draw();
      this.raf = requestAnimationFrame(this.loop);
    },

    draw: function () {
      const c = this.ctx;
      if (!this.puzzle || this.cssW === 0) return;
      c.clearRect(0, 0, this.cssW, this.cssH);
      const dt = 16;

      for (const k in this.connectPulses) {
        this.connectPulses[k].t += dt / 600;
        if (this.connectPulses[k].t >= 1) delete this.connectPulses[k];
      }
      if (this.complete && this.complete.active) {
        this.complete.t += dt / 1100;
        if (this.complete.t >= 1 && !this.complete.done) {
          this.complete.done = true;
          const cb = this.complete.cb;
          setTimeout(cb, 250);
        }
      }
      if (this.failure && this.failure.active) {
        this.failure.t += dt / 1000;
        for (const s of this.failure.sparks) {
          s.x += s.vx * dt / 16; s.y += s.vy * dt / 16;
          s.vy += 60 * dt / 16;
          s.life -= s.decay;
        }
        this.failure.sparks = this.failure.sparks.filter((s) => s.life > 0);
        if (this.failure.t >= 1) {
          this.failure.active = false;
          const cb = this.failure.cb;
          this.failure.cb = null;
          if (cb) setTimeout(cb, 120);
        }
      }

      this.drawRailBases(c);
      this.drawWires(c);
      if (this.drag && this.selection) this.drawDragLine(c);
      this.drawTerminals(c);
      if (this.failure && this.failure.active) this.drawSparks(c);
    },

    drawRailBases: function (c) {
      c.strokeStyle = 'rgba(255,255,255,0.05)';
      c.lineWidth = 2;
      const pad = this.radius() * 1.5;
      for (const x of [this.railX(), this.railX2()]) {
        c.beginPath();
        c.moveTo(x, pad);
        c.lineTo(x, this.cssH - pad);
        c.stroke();
      }
    },

    drawWires: function (c) {
      const p = this.puzzle;
      const order = [];
      for (let i = 0; i < p.count; i++) order.push(i);
      const drawOrder = order.slice().sort((a, b) => {
        const pa = p.wires[a].connected ? 1 : 0;
        const pb = p.wires[b].connected ? 1 : 0;
        if (pa !== pb) return pa - pb;
        const sa = (this.selection && this.selection.wire === a) ? 1 : 0;
        const sb = (this.selection && this.selection.wire === b) ? 1 : 0;
        if (sa !== sb) return sa - sb;
        return a - b;
      });
      for (const i of drawOrder) {
        if (p.wires[i].connected) this.drawWire(c, i);
      }
    },

    drawWire: function (c, index) {
      const w = this.puzzle.wires[index];
      const path = this.wirePath(index);
      const isSel = this.selection && this.selection.wire === index;
      const isErr = this.failure && this.failure.active && (this.failure.a === index || this.failure.b === index);
      const connected = w.connected;
      const completeT = this.complete ? U.clamp(this.complete.t * this.puzzle.count - index, 0, 1) : 0;
      const lit = connected || isSel || (this.complete && this.complete.active && completeT > 0);
      const baseW = connected ? 3.6 : 2.6;
      const lineW = (isSel ? baseW + 1.2 : baseW) * (lit ? 1 : 0.9);
      const alpha = connected ? 1 : (isSel ? 1 : 0.62);
      const errFlash = isErr ? (Math.sin(this.lastT / 30) * 0.5 + 0.5) : 0;

      let color = w.base;
      if (isErr) color = U.mix(w.base, '#ff1a1a', errFlash * 0.7);
      if (this.complete && this.complete.active && !connected) {
        color = U.mix(w.dark, w.base, completeT);
      }

      c.save();
      c.globalAlpha = alpha;
      c.shadowColor = w.glow;
      c.shadowBlur = (lit ? 16 : 6) * (1 + errFlash * 2);
      c.lineCap = 'round';
      c.strokeStyle = w.dark;
      c.lineWidth = lineW + 1.6;
      this._tracePath(path); c.stroke();
      c.strokeStyle = color;
      c.lineWidth = lineW;
      this._tracePath(path); c.stroke();
      if (lit && !isErr) {
        c.strokeStyle = 'rgba(255,255,255,0.5)';
        c.lineWidth = lineW * 0.35;
        this._tracePath(path); c.stroke();
      }
      c.restore();

      if (this.connectPulses[index]) {
        const pt = U.easeInOut(this.connectPulses[index].t);
        const ppos = this.bezierPoint(path, pt);
        c.save();
        c.globalAlpha = (1 - this.connectPulses[index].t) * 0.9 + 0.1;
        c.shadowColor = '#ffffff';
        c.shadowBlur = 18;
        c.fillStyle = '#ffffff';
        c.beginPath(); c.arc(ppos.x, ppos.y, 5.5, 0, Math.PI * 2); c.fill();
        c.restore();
      }
    },

    bezierPoint: function (path, t) {
      const u = 1 - t;
      const x = u * u * u * path.x0 + 3 * u * u * t * path.c1.x + 3 * u * t * t * path.c2.x + t * t * t * path.x3;
      const y = u * u * u * path.y0 + 3 * u * u * t * path.c1.y + 3 * u * t * t * path.c2.y + t * t * t * path.y3;
      return { x, y };
    },

    drawDragLine: function (c) {
      if (!this.drag) return;
      const w = this.puzzle.wires[this.drag.wire];
      const srcPos = this.drag.side === 'left' ? this.termPos(this.drag.wire, 'left') : this.termPosRight(this.drag.wire);
      const end = { x: this.drag.lastX, y: this.drag.lastY };
      const midX = (srcPos.x + end.x) / 2;
      c.save();
      c.shadowColor = w.glow;
      c.shadowBlur = 20;
      c.strokeStyle = w.dark; c.lineWidth = 6; c.lineCap = 'round';
      c.beginPath(); c.moveTo(srcPos.x, srcPos.y);
      c.bezierCurveTo(midX, srcPos.y, midX, end.y, end.x, end.y); c.stroke();
      c.strokeStyle = w.base; c.lineWidth = 4.2;
      c.beginPath(); c.moveTo(srcPos.x, srcPos.y);
      c.bezierCurveTo(midX, srcPos.y, midX, end.y, end.x, end.y); c.stroke();
      c.shadowBlur = 22;
      c.fillStyle = '#d8d8d4';
      c.beginPath(); c.arc(end.x, end.y, 6, 0, Math.PI * 2); c.fill();
      c.fillStyle = w.base;
      c.beginPath(); c.arc(end.x, end.y, 3.6, 0, Math.PI * 2); c.fill();
      c.restore();
    },

    drawTerminals: function (c) {
      const p = this.puzzle;
      const r = this.radius();
      for (const t of p.left) this.drawTerminal(c, t.wire, 'left', this.termPos(t.wire, 'left'), r);
      for (const t of p.right) this.drawTerminal(c, t.wire, 'right', this.termPosRight(t.wire), r);
    },

    drawTerminal: function (c, wireIndex, side, pos, r) {
      const w = this.puzzle.wires[wireIndex];
      const connected = w.connected;
      const isSel = this.selection && this.selection.wire === wireIndex && this.selection.side === side;
      const isHover = this.hover && this.hover.wire === wireIndex && this.hover.side === side;
      const isErr = this.failure && this.failure.active && (this.failure.a === wireIndex || this.failure.b === wireIndex);
      const completeT = this.complete ? U.clamp(this.complete.t * this.puzzle.count - wireIndex, 0, 1) : 0;
      const lit = connected || isSel || (this.complete && this.complete.active && completeT > 0);
      const errFlash = isErr ? (Math.sin(this.lastT / 30) * 0.5 + 0.5) : 0;
      const pulse = isSel ? (Math.sin(this.lastT / 260) * 0.5 + 0.5) : 0;

      c.save();
      c.shadowBlur = lit ? 18 : (isSel ? 12 : 6);
      c.shadowColor = isErr ? '#ff1a1a' : w.glow;
      c.globalAlpha = connected ? 1 : (isSel ? 1 : 0.85);

      const mountR = r + 7;
      this.roundRect(pos.x - mountR, pos.y - mountR, mountR * 2, mountR * 2, 9);
      const plateGrad = c.createLinearGradient(pos.x, pos.y - mountR, pos.x, pos.y + mountR);
      plateGrad.addColorStop(0, 'rgba(255,255,255,0.10)');
      plateGrad.addColorStop(0.5, 'rgba(255,255,255,0.03)');
      plateGrad.addColorStop(1, 'rgba(0,0,0,0.22)');
      c.fillStyle = plateGrad;
      c.fill();
      c.strokeStyle = isErr ? U.rgba('#ff1a1a', 0.8) : (isSel ? U.rgba(MUNDA.accentColor(), 0.9) : 'rgba(255,255,255,0.16)');
      c.lineWidth = 1.4;
      c.stroke();

      const portGrad = c.createRadialGradient(pos.x, pos.y, r * 0.1, pos.x, pos.y, r);
      portGrad.addColorStop(0, U.mix(w.base, '#ffffff', 0.25));
      portGrad.addColorStop(1, w.dark);
      c.beginPath(); c.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      c.fillStyle = portGrad;
      c.fill();
      c.lineWidth = 2.2;
      c.strokeStyle = isErr ? '#ff2b2b' : (lit ? w.base : U.rgba('#ffffff', 0.35));
      c.stroke();
      if (lit) { c.shadowBlur = 20; c.shadowColor = w.glow; c.stroke(); }

      if (isSel && !connected) {
        c.save();
        c.shadowBlur = 0;
        c.strokeStyle = U.rgba(MUNDA.accentColor(), 0.6 + pulse * 0.4);
        c.lineWidth = 2.4;
        c.beginPath(); c.arc(pos.x, pos.y, r + 4 + pulse * 3, 0, Math.PI * 2); c.stroke();
        c.restore();
      }

      this.drawSymbol(c, w.sym, pos.x, pos.y, r * 0.5, w.dark, lit ? w.base : '#d8d8d4');
      this.drawBadge(c, w.label, pos, side, r, connected, isErr, isSel);
      c.restore();
    },

    drawSymbol: function (c, sym, x, y, s, colorA, colorB) {
      c.save();
      c.lineWidth = Math.max(1.6, s * 0.16);
      c.strokeStyle = colorA;
      c.fillStyle = colorB;
      c.shadowBlur = 0;
      const cc = { x, y };
      switch (sym) {
        case 'circle': c.beginPath(); c.arc(cc.x, cc.y, s, 0, Math.PI * 2); c.stroke(); break;
        case 'square': c.strokeRect(cc.x - s, cc.y - s, s * 2, s * 2); break;
        case 'triangle':
          c.beginPath();
          c.moveTo(cc.x, cc.y - s); c.lineTo(cc.x - s * 0.9, cc.y + s * 0.75); c.lineTo(cc.x + s * 0.9, cc.y + s * 0.75);
          c.closePath(); c.stroke(); break;
        case 'diamond':
          c.beginPath();
          c.moveTo(cc.x, cc.y - s); c.lineTo(cc.x + s, cc.y); c.lineTo(cc.x, cc.y + s); c.lineTo(cc.x - s, cc.y);
          c.closePath(); c.stroke(); break;
        case 'hex':
          c.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = i / 6 * Math.PI * 2 - Math.PI / 2;
            const px = cc.x + Math.cos(a) * s, py = cc.y + Math.sin(a) * s;
            if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
          }
          c.closePath(); c.stroke(); break;
        case 'cross':
          c.beginPath();
          c.moveTo(cc.x - s, cc.y); c.lineTo(cc.x + s, cc.y);
          c.moveTo(cc.x, cc.y - s); c.lineTo(cc.x, cc.y + s);
          c.stroke(); break;
        case 'ring': c.beginPath(); c.arc(cc.x, cc.y, s, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.arc(cc.x, cc.y, s * 0.4, 0, Math.PI * 2); c.stroke(); break;
        case 'star':
          c.beginPath();
          for (let i = 0; i < 10; i++) {
            const a = i / 10 * Math.PI * 2 - Math.PI / 2;
            const rr = i % 2 === 0 ? s : s * 0.45;
            const px = cc.x + Math.cos(a) * rr, py = cc.y + Math.sin(a) * rr;
            if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
          }
          c.closePath(); c.stroke(); break;
        case 'plus':
          c.beginPath();
          c.moveTo(cc.x - s, cc.y); c.lineTo(cc.x + s, cc.y);
          c.moveTo(cc.x, cc.y - s); c.lineTo(cc.x, cc.y + s);
          c.stroke(); break;
      }
      c.restore();
    },

    drawBadge: function (c, num, pos, side, r, connected, isErr, isSel) {
      const bx = pos.x;
      const by = pos.y + r + 12;
      const bx2 = side === 'right' ? pos.x - r - 8 : pos.x + r + 8;
      const by2 = pos.y;
      c.save();
      c.font = '600 11px Roboto, Arial, sans-serif';
      const txt = String(num);
      const tw = c.measureText(txt).width + 12;
      const chipW = Math.max(18, tw);
      c.shadowBlur = connected ? 10 : 4;
      c.shadowColor = connected ? '#d8d8d4' : 'rgba(0,0,0,0.5)';
      c.fillStyle = connected ? U.mix('#d8d8d4', '#000', 0.15) : 'rgba(255,255,255,0.10)';
      this.roundRect(bx - chipW / 2, by - 8, chipW, 16, 8);
      c.fill();
      c.strokeStyle = connected ? '#d8d8d4' : 'rgba(255,255,255,0.25)';
      c.lineWidth = 1;
      c.stroke();
      c.shadowBlur = 0;
      c.fillStyle = connected ? '#000000' : '#dfe6f0';
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(txt, bx, by + 0.5);

      c.shadowBlur = 0;
      c.globalAlpha = 0.55;
      c.strokeStyle = '#ffffff';
      c.lineWidth = 1.4;
      const s = 5;
      c.beginPath();
      if (side === 'right') { c.moveTo(bx2 + s, by2); c.lineTo(bx2 - s, by2); }
      else { c.moveTo(bx2 - s, by2); c.lineTo(bx2 + s, by2); }
      c.moveTo(bx2, by2 - s); c.lineTo(bx2, by2 + s);
      c.stroke();
      c.restore();
    },

    drawSparks: function (c) {
      if (!this.failure) return;
      c.save();
      for (const s of this.failure.sparks) {
        c.globalAlpha = Math.max(0, s.life);
        c.fillStyle = s.life > 0.6 ? '#fff4d0' : '#ff8a2a';
        c.shadowBlur = 12; c.shadowColor = '#ffb03a';
        c.beginPath(); c.arc(s.x, s.y, s.size, 0, Math.PI * 2); c.fill();
      }
      c.restore();
    },

    roundRect: function (x, y, w, h, r) {
      const c = this.ctx;
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    },
  };

  MUNDA.BoardRenderer = R;

})(typeof window !== 'undefined' ? window : this);
