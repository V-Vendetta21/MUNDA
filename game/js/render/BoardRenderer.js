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
    hazards: [],
    virusHit: null,
    reveal: null,
    dragCable: null,
    branchReady: {},
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

    setPuzzle: function (puzzle, level) {
      this.puzzle = puzzle;
      this.params = puzzle.params;
      this.selection = null;
      this.drag = null;
      this.hover = null;
      this.connectPulses = {};
      this.complete = null;
      this.failure = null;
      this.virusHit = null;
      this.reveal = null;
      this.dragCable = null;
      this.branchReady = {};
      this.hazards = this.createVirusHazards(level || 1);
    },

    setSelection: function (sel) { this.selection = sel; },
    setDrag: function (drag) {
      this.drag = drag;
      if (drag && !this.dragCable) {
        const start = drag.side === 'left' ? this.termPos(drag.wire, 'left') : this.termPosRight(drag.wire);
        this.dragCable = MUNDA.CablePhysics.create(start, { x: drag.lastX || drag.x, y: drag.lastY || drag.y }, this.cssW < 600 ? 8 : 12);
      }
      if (!drag) this.dragCable = null;
    },
    revealDestination: function (wire, duration) { this.reveal = { wire, until: performance.now() + (duration || 1000) }; },
    repairPulse: function (wire) { this.connectPulses[wire] = { t: 0, repair: true }; },
    setBranchReady: function (wire) { this.branchReady[wire] = true; this.connectPulses[wire] = { t: 0 }; },

    setHover: function (x, y) {
      if (x < 0) { this.hover = null; this.hoverPos = null; return; }
      this.hover = this.hitTest(x, y);
      this.hoverPos = { x, y };
    },

    // ---- geometry ----
    radius: function () {
      const r = this.params ? this.params.terminalRadius : 20;
      const min = this.cssW < 500 ? 17 : 15;
      let rad = Math.max(r, min) + (MUNDA.state && MUNDA.state.settings.largeTerminals ? 4 : 0);
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
      const terminal = this.puzzle.right.find((t) => t.wire === wire);
      let yf = p.rightYfrac;
      if (terminal && terminal.motion && !(MUNDA.game && MUNDA.game.drag)) {
        const m = terminal.motion;
        yf += Math.sin(this.lastT * m.speed + m.phase) * m.amplitude;
      }
      const y = U.clamp(yf * this.cssH, this.radius() + 6, this.cssH - this.radius() - 6);
      return { x: this.railX2(), y };
    },

    normalizeRoute: function (points, wire, fromSide, toSide) {
      let route = MUNDA.Routing.simplify(points, 7);
      const start = fromSide === 'left' ? this.termPos(wire, 'left') : this.termPosRight(wire);
      const end = toSide === 'right' ? this.termPosRight(wire) : this.termPos(wire, 'left');
      route[0] = start; route[route.length - 1] = end;
      if (fromSide === 'right') route = route.reverse();
      return route;
    },
    defaultRoute: function (wire) {
      const p = this.puzzle.routes && this.puzzle.routes[wire];
      return p ? p.map((q) => ({ x: q.x * this.cssW, y: q.y * this.cssH })) : [this.termPos(wire, 'left'), this.termPosRight(wire)];
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

    createVirusHazards: function (level) {
      const layouts = [
        { nx: 0.50, ny: 0.36 },
        { nx: 0.40, ny: 0.66 },
        { nx: 0.62, ny: 0.53 },
      ];
      const count = Math.min(3, 1 + Math.floor((Math.max(1, level) - 1) / 3));
      return layouts.slice(0, count).map((position, index) => ({
        id: 'virus-' + index,
        nx: position.nx,
        ny: position.ny,
        r: 9 + Math.min(2, Math.floor(level / 4)),
        phase: index * 1.9,
      }));
    },

    virusPos: function (hazard) {
      return { x: hazard.nx * this.cssW, y: hazard.ny * this.cssH };
    },

    hitTestVirusSegment: function (x1, y1, x2, y2) {
      if (!this.hazards || !this.hazards.length) return null;
      const dx = x2 - x1, dy = y2 - y1;
      const lengthSq = dx * dx + dy * dy;
      for (const hazard of this.hazards) {
        const pos = this.virusPos(hazard);
        const t = lengthSq > 0
          ? U.clamp(((pos.x - x1) * dx + (pos.y - y1) * dy) / lengthSq, 0, 1)
          : 0;
        const closestX = x1 + dx * t;
        const closestY = y1 + dy * t;
        if (U.dist(closestX, closestY, pos.x, pos.y) <= hazard.r + 5) return hazard;
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

    _tracePolyline: function (points) {
      const c = this.ctx; c.beginPath();
      points.forEach((p, i) => {
        if (!i) c.moveTo(p.x, p.y);
        else { const prev = points[i - 1]; c.quadraticCurveTo(prev.x, prev.y, (prev.x + p.x) / 2, (prev.y + p.y) / 2); }
      });
      const last = points[points.length - 1]; if (last) c.lineTo(last.x, last.y);
    },

    _dashFor: function (pattern) {
      if (MUNDA.state && MUNDA.state.settings.strongPatterns && pattern === 'solid') return [12, 5];
      return pattern === 'dashed' ? [12, 7] : pattern === 'dotted' ? [2, 7] : pattern === 'segmented' ? [18, 5] : pattern === 'braided' ? [5, 3] : pattern === 'tech' ? [16, 4, 3, 4] : [];
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

    virusFailureSequence: function (hazard, cb) {
      const pos = this.virusPos(hazard);
      const particles = [];
      for (let i = 0; i < 20; i++) {
        const angle = i / 20 * Math.PI * 2 + U.rand(-0.12, 0.12);
        const speed = U.rand(0.7, 2.4);
        particles.push({
          x: pos.x, y: pos.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          size: U.rand(1.2, 2.8),
        });
      }
      this.virusHit = { active: true, t: 0, hazard, particles, cb, done: false };
    },

    // ---- main loop ----
    loop: function (t) {
      this.lastT = t;
      if (MUNDA.game && MUNDA.game.tick) MUNDA.game.tick(t);
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
      if (this.virusHit && this.virusHit.active) {
        this.virusHit.t += dt / 760;
        for (const particle of this.virusHit.particles) {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.life -= 0.025;
        }
        if (this.virusHit.t >= 1 && !this.virusHit.done) {
          this.virusHit.done = true;
          this.virusHit.active = false;
          const cb = this.virusHit.cb;
          if (cb) setTimeout(cb, 100);
        }
      }

      this.drawRailBases(c);
      this.drawRoutingHardware(c);
      this.drawWires(c);
      this.drawVirusHazards(c);
      if (this.drag && this.selection) this.drawDragLine(c);
      this.drawTerminals(c);
      if (this.failure && this.failure.active) this.drawSparks(c);
      if (this.virusHit) this.drawVirusParticles(c);
    },

    drawRoutingHardware: function (c) {
      c.save();
      for (const o of this.puzzle.obstacles || []) {
        const x=o.x*this.cssW,y=o.y*this.cssH,w=o.w*this.cssW,h=o.h*this.cssH;
        const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#d9d9d6');g.addColorStop(.16,'#5e5e5c');g.addColorStop(.55,'#171717');g.addColorStop(1,'#050505');
        this.roundRect(x,y,w,h,8);c.fillStyle=g;c.shadowColor='rgba(0,0,0,.8)';c.shadowBlur=18;c.fill();c.shadowBlur=0;c.strokeStyle='rgba(255,255,255,.28)';c.lineWidth=1.2;c.stroke();
        c.fillStyle='rgba(255,255,255,.58)';c.font='600 8px Roboto,Arial';c.textAlign='center';c.fillText(o.type,x+w/2,y+h/2+3);
        for(const q of [[x+8,y+8],[x+w-8,y+8],[x+8,y+h-8],[x+w-8,y+h-8]]){c.beginPath();c.arc(q[0],q[1],2.5,0,Math.PI*2);c.fillStyle='#1b1b1b';c.fill();c.strokeStyle='#c4c4c0';c.stroke()}
      }
      for (const g of this.puzzle.guides || []) {
        const x=g.x*this.cssW,y=g.y*this.cssH,r=g.required?13:10;c.save();c.translate(x,y);c.shadowColor='#fff';c.shadowBlur=g.required?12:5;c.strokeStyle=g.required?'#fff':'#8b8b88';c.lineWidth=g.required?2:1.2;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.stroke();c.beginPath();c.arc(0,0,r-5,0,Math.PI*2);c.stroke();c.fillStyle='#090909';c.fill();c.fillStyle='#d7d7d4';c.font='700 7px Roboto,Arial';c.textAlign='center';c.fillText(g.required?'REQ':'OPT',0,2.5);c.restore();
      }
      for(const d of this.puzzle.decoys||[]){const x=d.x*this.cssW,y=d.y*this.cssH;c.setLineDash([2,4]);c.strokeStyle='#777';c.lineWidth=1;c.beginPath();c.arc(x,y,14,0,Math.PI*2);c.stroke();c.setLineDash([]);c.fillStyle='#777';c.font='600 7px Roboto,Arial';c.textAlign='center';c.fillText(d.clue,x,y+25)}
      for(const s of this.puzzle.splitters||[]){const x=s.x*this.cssW,y=s.y*this.cssH;c.translate(0,0);c.fillStyle='#0b0b0b';c.strokeStyle='#eee';c.lineWidth=1.4;this.roundRect(x-16,y-11,32,22,5);c.fill();c.stroke();c.fillStyle='#eee';c.font='700 9px Roboto,Arial';c.textAlign='center';c.fillText('J'+String(s.wire+1),x,y+3)}
      c.restore();
    },

    drawVirusHazards: function (c) {
      for (const hazard of this.hazards) {
        const pos = this.virusPos(hazard);
        const pulse = Math.sin(this.lastT / 430 + hazard.phase) * 0.5 + 0.5;
        const r = hazard.r + pulse * 0.8;
        c.save();
        c.translate(pos.x, pos.y);
        c.rotate(this.lastT / 9000 + hazard.phase);
        c.globalAlpha = 0.82 + pulse * 0.16;
        c.shadowColor = '#ffffff';
        c.shadowBlur = 9 + pulse * 5;
        c.strokeStyle = '#dededb';
        c.lineWidth = 1.3;
        for (let i = 0; i < 8; i++) {
          const angle = i / 8 * Math.PI * 2;
          const x1 = Math.cos(angle) * (r - 1);
          const y1 = Math.sin(angle) * (r - 1);
          const x2 = Math.cos(angle) * (r + 4);
          const y2 = Math.sin(angle) * (r + 4);
          c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
          c.beginPath(); c.arc(x2, y2, 1.7, 0, Math.PI * 2); c.fillStyle = '#ffffff'; c.fill();
        }
        const grad = c.createRadialGradient(-r * 0.25, -r * 0.3, 1, 0, 0, r);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.45, '#a5a5a2');
        grad.addColorStop(1, '#242424');
        c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fillStyle = grad; c.fill();
        c.shadowBlur = 0;
        c.strokeStyle = '#090909'; c.lineWidth = 1.4; c.stroke();
        c.fillStyle = 'rgba(5,5,5,.72)';
        c.beginPath(); c.arc(-r * .28, -r * .12, 1.7, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(r * .24, r * .20, 1.4, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(r * .18, -r * .30, 1.1, 0, Math.PI * 2); c.fill();
        c.restore();
      }
    },

    drawVirusParticles: function (c) {
      const state = this.virusHit;
      if (!state) return;
      c.save();
      for (const particle of state.particles) {
        if (particle.life <= 0) continue;
        c.globalAlpha = particle.life;
        c.fillStyle = '#ffffff';
        c.shadowColor = '#bcbcb8';
        c.shadowBlur = 10;
        c.beginPath(); c.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2); c.fill();
      }
      c.restore();
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
      const points = w.route ? w.route.map((p) => ({ x: p.x * this.cssW, y: p.y * this.cssH })) : null;
      const path = points ? null : this.wirePath(index);
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
      c.setLineDash(this._dashFor(w.pattern));
      c.strokeStyle = w.dark;
      c.lineWidth = lineW + 1.6;
      points ? this._tracePolyline(points) : this._tracePath(path); c.stroke();
      c.strokeStyle = color;
      c.lineWidth = lineW;
      points ? this._tracePolyline(points) : this._tracePath(path); c.stroke();
      if (lit && !isErr) {
        c.setLineDash([]);
        c.strokeStyle = 'rgba(255,255,255,0.5)';
        c.lineWidth = lineW * 0.35;
        points ? this._tracePolyline(points) : this._tracePath(path); c.stroke();
      }
      if (w.pattern === 'double') {
        c.setLineDash([]); c.strokeStyle = 'rgba(0,0,0,0.78)'; c.lineWidth = 1;
        points ? this._tracePolyline(points) : this._tracePath(path); c.stroke();
      }
      c.restore();

      if (this.connectPulses[index]) {
        const pt = U.easeInOut(this.connectPulses[index].t);
        const ppos = points ? this.polylinePoint(points, pt) : this.bezierPoint(path, pt);
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

    polylinePoint: function (points, t) {
      const total = MUNDA.Routing.length(points); let target = total * t, seen = 0;
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1], b = points[i], d = U.dist(a.x, a.y, b.x, b.y);
        if (seen + d >= target) { const f = (target - seen) / (d || 1); return { x: U.lerp(a.x, b.x, f), y: U.lerp(a.y, b.y, f) }; }
        seen += d;
      }
      return points[points.length - 1];
    },

    drawDragLine: function (c) {
      if (!this.drag) return;
      const w = this.puzzle.wires[this.drag.wire];
      const srcPos = this.drag.side === 'left' ? this.termPos(this.drag.wire, 'left') : this.termPosRight(this.drag.wire);
      const end = { x: this.drag.lastX, y: this.drag.lastY };
      if (!this.dragCable) this.dragCable = MUNDA.CablePhysics.create(srcPos, end, this.cssW < 600 ? 8 : 12);
      MUNDA.CablePhysics.step(this.dragCable, srcPos, end, 16);
      if (this.drag.route && this.drag.route.length > 1) MUNDA.CablePhysics.follow(this.dragCable, this.drag.route);
      const points = this.dragCable.points;
      c.save();
      c.shadowColor = w.glow;
      c.shadowBlur = 20;
      c.strokeStyle = w.dark; c.lineWidth = 6; c.lineCap = 'round';
      c.setLineDash(this._dashFor(w.pattern)); this._tracePolyline(points); c.stroke();
      c.strokeStyle = w.base; c.lineWidth = 4.2;
      this._tracePolyline(points); c.stroke(); c.setLineDash([]);
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
      for (const t of p.right) {
        if (t.motion) { const pos=this.termPosRight(t.wire); c.save(); c.strokeStyle='rgba(255,255,255,.18)'; c.lineWidth=2; c.beginPath(); c.moveTo(pos.x,pos.y-this.cssH*t.motion.amplitude-8); c.lineTo(pos.x,pos.y+this.cssH*t.motion.amplitude+8); c.stroke(); c.restore(); }
        this.drawTerminal(c, t.wire, 'right', this.termPosRight(t.wire), r);
      }
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
      const terminal = side === 'left' ? this.puzzle.left.find((t) => t.wire === wireIndex) : this.puzzle.right.find((t) => t.wire === wireIndex);
      const locked = terminal && terminal.locked;
      const concealed = side === 'right' && this.puzzle.hidden && !connected && !(this.reveal && this.reveal.wire === wireIndex && this.reveal.until > this.lastT);

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

      if (!concealed) {
        this.drawSymbol(c, w.sym, pos.x, pos.y, r * 0.5, w.dark, lit ? w.base : '#d8d8d4');
        this.drawBadge(c, w.label, pos, side, r, connected, isErr, isSel);
      } else {
        c.fillStyle='rgba(255,255,255,.28)';c.font='700 12px Roboto,Arial';c.textAlign='center';c.fillText('—',pos.x,pos.y+4);
      }
      if (locked) {
        c.shadowBlur=8;c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.arc(pos.x,pos.y,r+4,-Math.PI/2,Math.PI*(terminal.calibration?1.2:.35));c.stroke();
        c.fillStyle='#0a0a0a';c.strokeStyle='#fff';this.roundRect(pos.x-7,pos.y-5,14,11,2);c.fill();c.stroke();
      }
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
