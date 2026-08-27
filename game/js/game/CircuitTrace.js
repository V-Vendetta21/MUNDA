/* ============================================================
   MUNDA — CircuitTrace.js
   Pre-assembly "print a MUNDA circuit" mechanic.
   Generates a random dotted circuit shape to trace over by
   hovering the pointer. The trace accuracy (clamped 10–100%)
   sets how easy the following production shift / wire
   connection will be: higher accuracy → fewer wires & easier
   routing; lower accuracy → more wires & harder routing.
   ============================================================ */
(function (global) {
  'use strict';
  const MUNDA = global.MUNDA = (global.MUNDA || {});

  // ---- deterministic seeded RNG (mirrors Mechanics.rng) ----
  function rng(seed) {
    let x = (seed | 0) || 1;
    return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967296; };
  }

  // ---- shape generators. Each returns an array of normalized
  //      {x,y} points in 0..1 that samples the shape outline. ----
  const SHAPES = {
    loop: function (r) {
      const pts = [], cx = 0.5, cy = 0.5, rx = 0.30, ry = 0.26;
      for (let i = 0; i < 80; i++) { const a = i / 80 * Math.PI * 2; pts.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry }); }
      return pts;
    },
    triangle: function (r) {
      const pts = [], cx = 0.5, cy = 0.52, s = 0.30;
      const verts = [[cx, cy - s * 0.72], [cx - s * 0.66, cy + s * 0.52], [cx + s * 0.66, cy + s * 0.52]];
      for (let i = 0; i < 60; i++) { const e = i / 60 * 3; const s0 = Math.floor(e) % 3, t = e - Math.floor(e); pts.push({ x: verts[s0][0] + (verts[(s0 + 1) % 3][0] - verts[s0][0]) * t, y: verts[s0][1] + (verts[(s0 + 1) % 3][1] - verts[s0][1]) * t }); }
      return pts;
    },
    square: function (r) {
      const pts = [], s = 0.26;
      const v = [[0.5 - s, 0.5 - s], [0.5 + s, 0.5 - s], [0.5 + s, 0.5 + s], [0.5 - s, 0.5 + s]];
      for (let i = 0; i < 80; i++) { const e = i / 80 * 4; const s0 = Math.floor(e) % 4, t = e - Math.floor(e); pts.push({ x: v[s0][0] + (v[(s0 + 1) % 4][0] - v[s0][0]) * t, y: v[s0][1] + (v[(s0 + 1) % 4][1] - v[s0][1]) * t }); }
      return pts;
    },
    diamond: function (r) {
      const pts = [], d = 0.30;
      const v = [[0.5, 0.5 - d], [0.5 + d * 0.8, 0.5], [0.5, 0.5 + d], [0.5 - d * 0.8, 0.5]];
      for (let i = 0; i < 80; i++) { const e = i / 80 * 4; const s0 = Math.floor(e) % 4, t = e - Math.floor(e); pts.push({ x: v[s0][0] + (v[(s0 + 1) % 4][0] - v[s0][0]) * t, y: v[s0][1] + (v[(s0 + 1) % 4][1] - v[s0][1]) * t }); }
      return pts;
    },
    hex: function (r) {
      const pts = [], cx = 0.5, cy = 0.5, rad = 0.28;
      for (let i = 0; i < 90; i++) { const a = i / 90 * Math.PI * 2; pts.push({ x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad * 0.92 }); }
      return pts;
    },
    star: function (r) {
      const pts = [], cx = 0.5, cy = 0.5, R = 0.30, r2 = 0.13;
      for (let i = 0; i < 100; i++) { const a = i / 100 * Math.PI * 2 - Math.PI / 2; const rad = (i % 10 < 5) ? R : r2; pts.push({ x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad }); }
      return pts;
    },
    wave: function (r) {
      const pts = [];
      for (let i = 0; i < 80; i++) { const t = i / 79; pts.push({ x: 0.14 + t * 0.72, y: 0.5 + Math.sin(t * Math.PI * 2) * 0.2 }); }
      return pts;
    },
    zigzag: function (r) {
      const pts = [];
      for (let i = 0; i < 60; i++) { const t = i / 59; const seg = Math.floor(t * 5); const ft = (t * 5) - seg; const x = 0.14 + (t) * 0.72; const base = 0.5 + (seg % 2 === 0 ? -0.18 : 0.18); const y = base + (ft * 2 - 1) * 0.18; pts.push({ x, y }); }
      return pts;
    },
    spiral: function (r) {
      const pts = [];
      for (let i = 0; i < 120; i++) { const t = i / 119; const a = t * Math.PI * 3; const rad = 0.04 + t * 0.24; pts.push({ x: 0.5 + Math.cos(a) * rad, y: 0.5 + Math.sin(a) * rad }); }
      return pts;
    },
    cross: function (r) {
      const pts = [], a = 0.20, b = 0.06;
      const v = [[0.5 - b, 0.5 - a], [0.5 + b, 0.5 - a], [0.5 + b, 0.5 - b], [0.5 + a, 0.5 - b], [0.5 + a, 0.5 + b], [0.5 + b, 0.5 + b], [0.5 + b, 0.5 + a], [0.5 - b, 0.5 + a], [0.5 - b, 0.5 + b], [0.5 - a, 0.5 + b], [0.5 - a, 0.5 - b], [0.5 - b, 0.5 - b]];
      for (let i = 0; i < 120; i++) { const e = i / 120 * 12; const s0 = Math.floor(e) % 12, t = e - Math.floor(e); pts.push({ x: v[s0][0] + (v[(s0 + 1) % 12][0] - v[s0][0]) * t, y: v[s0][1] + (v[(s0 + 1) % 12][1] - v[s0][1]) * t }); }
      return pts;
    },
  };

  function pickShape(seed) {
    const random = rng((seed || 1) * 2654435761);
    const names = Object.keys(SHAPES);
    return names[Math.floor(random() * names.length)];
  }

  // Generate a random dotted circuit to trace.
  // Returns { shape, points } where points are normalized 0..1.
  function generate(seed) {
    const shape = pickShape(seed);
    return { shape, points: SHAPES[shape](rng((seed || 1) * 1103515245)) };
  }

  // Measure trace coverage. `trace` is an array of pointer {x,y} in px,
  // `points` normalized target, w/h canvas size, tol tolerance in px.
  // Returns coverage ratio 0..1.
  function coverage(trace, points, w, h, tol) {
    const t = tol || 26;
    let traced = 0;
    for (const p of points) {
      const px = p.x * w, py = p.y * h;
      for (const q of trace) {
        if (Math.hypot(q.x - px, q.y - py) <= t) { traced++; break; }
      }
    }
    return points.length ? traced / points.length : 0;
  }

  // Clamp coverage to the legal accuracy band [10, 100].
  function accuracy(ratio) {
    return Math.max(10, Math.min(100, Math.round((ratio || 0) * 100)));
  }

  // Map accuracy (10..100) to a wire-count delta.
  // accuracy 100 -> 0 extra wires (easiest); accuracy 10 -> +extra (hardest).
  function wireDelta(accuracy, maxExtra) {
    return Math.round(((100 - accuracy) / 90) * (maxExtra || 2));
  }

  MUNDA.CircuitTrace = { generate, coverage, accuracy, wireDelta, SHAPES };
})(typeof window !== 'undefined' ? window : this);
