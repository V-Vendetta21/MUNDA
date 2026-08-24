/* ============================================================
   MUNDA — PuzzleGen.js
   Procedural generation of wiring boards.
   Every generated board is guaranteed solvable: terminals never
   overlap, each color appears exactly once per side, and the
   matching is a bijection. Output is in normalized coordinates
   (fractions of board height) so it survives resize.
   ============================================================ */
(function (global) {
  'use strict';
  const MUNDA = global.MUNDA;
  const U = MUNDA;

  // confusable color groups (visual similarity) used at higher difficulty
  const SIMILAR_GROUPS = [
    ['red', 'orange'],
    ['blue', 'violet'],
    ['cyan', 'green'],
    ['yellow', 'white'],
  ];

  // choose which color ids appear on the board
  function selectColorIds(n, similarPairs) {
    const distinct = MUNDA.WIRE_CATALOG.map((w) => w.id);
    const chosen = [];
    const pairs = Math.min(similarPairs, SIMILAR_GROUPS.length, Math.floor(n / 2));
    const used = U.shuffle(SIMILAR_GROUPS).slice(0, pairs);
    for (const g of used) {
      for (const id of g) if (chosen.length < n && !chosen.includes(id)) chosen.push(id);
    }
    const rest = U.shuffle(distinct.filter((id) => !chosen.includes(id)));
    for (const id of rest) { if (chosen.length >= n) break; chosen.push(id); }
    // safety fill (never needed with n<=9 catalogue, but guard anyway)
    let k = 0;
    while (chosen.length < n && k < 1000) {
      const id = distinct[k % distinct.length];
      if (!chosen.includes(id)) chosen.push(id);
      k++;
    }
    return U.shuffle(chosen);
  }

  // build a permutation with an approximate inversion count = density * max
  function makePermutation(n, density) {
    const remaining = [];
    for (let i = 0; i < n; i++) remaining.push(i);
    const perm = [];
    const maxInv = (n * (n - 1)) / 2;
    const targetInv = Math.round(density * maxInv);
    let inv = 0;
    for (let i = n; i > 0; i--) {
      const maxSkip = i - 1;
      let skip = 0;
      if (inv < targetInv) {
        let budget = targetInv - inv;
        skip = Math.min(maxSkip, budget);
        if (density > 0.05) {
          const jitter = Math.floor(Math.random() * Math.max(1, Math.round(maxSkip * 0.5)));
          skip = Math.min(maxSkip, skip + (Math.random() < 0.5 ? jitter : -jitter));
        }
        skip = Math.max(0, skip);
      }
      inv += skip;
      perm.push(remaining.splice(skip, 1)[0]);
    }
    return perm;
  }

  // even distribution with controlled jitter that never lets adjacent rows overlap
  function makePositions(n, topFrac, bottomFrac, routeNoise) {
    const spacing = (bottomFrac - topFrac) / n;
    const maxJit = spacing * 0.5 * Math.min(0.8, routeNoise);
    const pos = [];
    for (let s = 0; s < n; s++) {
      let y = (topFrac + spacing * (s + 0.5));
      y += (Math.random() * 2 - 1) * maxJit;
      pos.push(U.clamp(y, topFrac + 0.005, bottomFrac - 0.005));
    }
    return pos;
  }

  function generate(params, resolvedWires) {
    const n = params.wires;
    const top = 0.10, bottom = 0.92;
    const railX = 0.13, railX2 = 0.87;

    const colorIds = selectColorIds(n, params.similarPairs);
    const leftOrder = colorIds;                 // left rail top→bottom in this color order
    const perm = makePermutation(n, params.density);
    const rightOrder = perm.map((idx) => leftOrder[idx]); // permuted color order on right

    // slot y positions
    const leftPos = makePositions(n, top, bottom, params.routeNoise);
    const rightPos = makePositions(n, top, bottom, params.routeNoise);

    // map color -> right slot index
    const rightSlotOf = {};
    rightOrder.forEach((cid, s) => { rightSlotOf[cid] = s; });

    const colorOf = {};
    resolvedWires.forEach((w) => { colorOf[w.id] = w; });

    // build wires + terminals
    const wires = [];
    const left = [], right = [];

    for (let s = 0; s < n; s++) {
      const cid = leftOrder[s];
      const c = colorOf[cid];
      const rightSlot = rightSlotOf[cid];
      wires.push({
        index: s,
        colorId: cid,
        name: c.name,
        base: c.base, dark: c.dark, glow: c.glow,
        sym: c.sym,
        leftYfrac: leftPos[s],
        rightYfrac: rightPos[rightSlot],
        connected: false,
        error: false,
        label: s + 1,           // number badge (left side)
      });
      left.push({ slot: s, wire: s, yfrac: leftPos[s], colorId: cid });
      right.push({ slot: s, wire: -1, yfrac: rightPos[s], colorId: rightOrder[s] });
    }

    // bind right terminals to their wire index
    for (let s = 0; s < n; s++) {
      right[s].wire = wires.findIndex((w) => w.colorId === rightOrder[s]);
    }

    const puzzle = {
      count: n,
      wires,
      left,
      right,
      railXfrac: railX,
      railX2frac: railX2,
      leftRail: railX,
      rightRail: railX2,
      params,
      // accessibility labels — always numbers + symbols, never color alone
    };

    // validation: every color present exactly once per side, positions in range
    if (!validate(puzzle)) {
      return generate(params, resolvedWires); // safe retry
    }
    return puzzle;
  }

  function validate(p) {
    const n = p.count;
    if (p.wires.length !== n) return false;
    if (p.left.length !== n || p.right.length !== n) return false;
    const lc = {}, rc = {};
    for (const t of p.left) { if (!(t.colorId in lc)) lc[t.colorId] = 0; lc[t.colorId]++; if (t.wire < 0 || t.wire >= n) return false; }
    for (const t of p.right) { if (!(t.colorId in rc)) rc[t.colorId] = 0; rc[t.colorId]++; if (t.wire < 0 || t.wire >= n) return false; }
    for (const id in lc) if (lc[id] !== 1 || (rc[id] || 0) !== 1) return false;
    for (const id in rc) if (rc[id] !== 1 || (lc[id] || 0) !== 1) return false;
    // every wire's terminals exist
    for (const w of p.wires) {
      const lt = p.left.find((t) => t.wire === w.index);
      const rt = p.right.find((t) => t.wire === w.index);
      if (!lt || !rt) return false;
      if (lt.yfrac < 0.02 || lt.yfrac > 0.98 || rt.yfrac < 0.02 || rt.yfrac > 0.98) return false;
    }
    return true;
  }

  MUNDA.puzzleGen = { generate, selectColorIds };

})(typeof window !== 'undefined' ? window : this);
