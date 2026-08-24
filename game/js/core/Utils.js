/* ============================================================
   MUNDA — Utils.js
   Small math / DOM / easing helpers.
   ============================================================ */
(function (global) {
  'use strict';
  const U = global.MUNDA = (global.MUNDA || {});

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (lo, hi) => lo + Math.random() * (hi - lo);
  const randInt = (lo, hi) => Math.floor(rand(lo, hi + 1));
  const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

  // shuffle a copy of an array (Fisher-Yates)
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ease in-out cubic for animations
  const easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  // formatted score with thousands separators
  const fmt = (n) => Number(n || 0).toLocaleString('en-US');

  // round to a grid
  const snap = (v, g) => Math.round(v / g) * g;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  // hex -> {r,g,b}
  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgbToHex(r, g, b) {
    const c = (v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
    return '#' + c(r) + c(g) + c(b);
  }
  // mix two hex colors by t (0..1)
  function mix(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    return rgbToHex(lerp(A.r, B.r, t), lerp(A.g, B.g, t), lerp(A.b, B.b, t));
  }
  // rgba string from hex + alpha
  function rgba(hex, a) {
    const c = hexToRgb(hex);
    return `rgba(${c.r},${c.g},${c.b},${a})`;
  }

  // WebGL-ish luminance for contrast checks
  function luminance(hex) {
    const c = hexToRgb(hex);
    return (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255;
  }

  U.clamp = clamp; U.lerp = lerp; U.rand = rand; U.randInt = randInt; U.dist = dist;
  U.shuffle = shuffle; U.easeInOut = easeInOut; U.easeOut = easeOut; U.fmt = fmt; U.snap = snap;
  U.$ = $; U.$all = $all; U.hexToRgb = hexToRgb; U.rgbToHex = rgbToHex; U.mix = mix;
  U.rgba = rgba; U.luminance = luminance;

})(typeof window !== 'undefined' ? window : this);
