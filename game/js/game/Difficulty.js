/* ============================================================
   MUNDA — Difficulty.js
   Turns a level number into a difficulty parameter set.
   Designed to scale indefinitely without becoming impossible.
   ============================================================ */
(function (global) {
  'use strict';
  const MUNDA = global.MUNDA;
  const U = MUNDA;

  const CAP = 9; // max wires = catalogue size (every wire keeps a unique color)

  function getParams(level, mode) {
    const L = Math.max(1, Math.floor(level));
    const endless = mode === 'endless';

    // wire count — explicit early curve, then gradual growth, capped
    let wires;
    if (L <= 5) wires = L + 2;                 // 3,4,5,6,7
    else if (L === 6) wires = 8;
    else wires = Math.min(CAP, 8 + Math.floor((L - 6) / 2));

    // terminal radius shrinks with level (touch-safe floor)
    const radius = U.clamp(24 - (L - 1) * 1.15, 13, 24);

    // how many confusable color pairs to force (visual similarity)
    const similarPairs = L >= 6 ? 2 : (L >= 3 ? 1 : 0);

    // crossing density 0..1 — scramble of the output rail
    const density = U.clamp((L - 1) / (endless ? 7 : 9), 0, 1);

    // vertical jitter of terminal rows (staggered, more confusing)
    const routeNoise = U.clamp((L - 1) * 0.05, 0, 0.35);

    // curve "waviness" of wire paths
    const curve = U.clamp(0.35 + (L - 1) * 0.05, 0.35, 0.8);

    // speed bonus tuning (never kills a run — time only affects scoring)
    const idealSeconds = wires * 2.4;

    return {
      level: L,
      mode,
      wires,
      terminalRadius: radius,
      similarPairs,
      density,
      routeNoise,
      curve,
      idealSeconds,
      // board must always remain solvable — solver-friendly upper bounds
      maxTerminalRadius: 30,
      minPitch: 30,      // min pixels between terminal centers (enforced in layout)
    };
  }

  MUNDA.difficulty = { getParams, applyTrace, CAP };

  // Adjust an already-generated parameter set based on the pre-assembly
  // trace accuracy (10..100). Higher accuracy → fewer wires, larger
  // terminals, cleaner routing (easier). Lower accuracy → more wires,
  // smaller terminals, more route noise (harder). Wire count stays
  // within the colour-catalogue cap so the board remains solvable.
  function applyTrace(params, accuracy) {
    const acc = Math.max(10, Math.min(100, accuracy || 100));
    const base = params.wires;
    const maxExtra = Math.max(0, CAP - base);
    const extra = MUNDA.CircuitTrace
      ? MUNDA.CircuitTrace.wireDelta(acc, maxExtra)
      : 0;
    // accuracy scales 0 (at 100%) .. 1 (at 10%)
    const hard = (100 - acc) / 90;
    return Object.assign({}, params, {
      wires: base + extra,
      terminalRadius: Math.max(13, params.terminalRadius - Math.round(hard * 3)),
      routeNoise: Math.min(0.35, params.routeNoise + hard * 0.05),
      curve: Math.min(0.8, params.curve + hard * 0.08),
      traceAccuracy: acc,
    });
  }

})(typeof window !== 'undefined' ? window : this);
