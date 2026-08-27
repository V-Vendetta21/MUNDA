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

  // hex <-> HSL for fine-grained colour control.
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        default: h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }
  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      r = hue2rgb(p, q, h + 1 / 3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1 / 3);
    }
    return { r: r * 255, g: g * 255, b: b * 255 };
  }
  // hex -> hsl
  function hexToHsl(hex) {
    const c = hexToRgb(hex);
    return rgbToHsl(c.r, c.g, c.b);
  }
  // hsl -> hex
  function hslToHex(h, s, l) {
    const c = hslToRgb(h, s, l);
    return rgbToHex(c.r, c.g, c.b);
  }
  // adjust a hex colour's lightness/saturation by fractional deltas (for
  // live global wire tuning without touching stored base hex values).
  function adjustHsl(hex, satDelta, lightDelta) {
    const hsl = hexToHsl(hex);
    return hslToHex(hsl.h, clamp(hsl.s + satDelta, 0, 100), clamp(hsl.l + lightDelta, 0, 100));
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
  U.rgbToHsl = rgbToHsl; U.hslToRgb = hslToRgb; U.hexToHsl = hexToHsl; U.hslToHex = hslToHex; U.adjustHsl = adjustHsl;

})(typeof window !== 'undefined' ? window : this);
