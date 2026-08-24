/* ============================================================
   MUNDA — Palette.js
   Monochrome theme (black / white / grey) + wire color resolution.
   Wire colours remain coloured and customizable; the interface
   is strictly monochrome.
   ============================================================ */
(function (global) {
  'use strict';
  const MUNDA = global.MUNDA;
  const U = MUNDA;

  // single monochrome theme — black, white, grey
  const THEME = {
    id: 'mono', name: 'MUNDA',
    bg1: '#050506', bg2: '#0b0b0d',
    panel: 'rgba(255,255,255,0.04)', panelSolid: '#101013',
    surface: 'rgba(255,255,255,0.07)', surfaceSolid: '#18181b',
    border: 'rgba(255,255,255,0.12)', borderStrong: 'rgba(255,255,255,0.24)',
    text: '#ffffff', text2: '#c7c7ca', text3: '#828287',
    accent: '#ffffff', accent2: '#c9c9cc',
  };
  MUNDA.THEMES = { mono: THEME };
  MUNDA.THEME_ORDER = ['mono'];

  // colorblind-safe wire palette (symbols/numbers still shown as primary cue)
  const CB_SET = {
    red:     { base: '#e6194b', dark: '#5c0b1e', glow: '#ff6a87' },
    blue:    { base: '#3b78ff', dark: '#12305f', glow: '#6f9dff' },
    yellow:  { base: '#ffe119', dark: '#6b5a06', glow: '#fff07a' },
    magenta: { base: '#f032e6', dark: '#5c0f57', glow: '#ff7cf4' },
    cyan:    { base: '#42d4f4', dark: '#0f4a58', glow: '#7fe6ff' },
    white:   { base: '#f2f4f8', dark: '#5f6674', glow: '#ffffff' },
    orange:  { base: '#f58231', dark: '#5e320a', glow: '#ffab5f' },
    violet:  { base: '#911eb4', dark: '#360a44', glow: '#b65ad4' },
    green:   { base: '#3cb44b', dark: '#0f4a19', glow: '#5cff8f' },
  };

  // resolve wire colors honoring custom overrides + colorblind mode
  function resolveWires() {
    const custom = MUNDA.state.custom;
    const cb = MUNDA.state.settings.colorblind;
    const catalog = MUNDA.WIRE_CATALOG;
    return catalog.map((w) => {
      let base = w.base, dark = w.dark, glow = w.glow;
      if (cb && CB_SET[w.id]) { base = CB_SET[w.id].base; dark = CB_SET[w.id].dark; glow = CB_SET[w.id].glow; }
      if (custom.wires && custom.wires[w.id]) {
        base = custom.wires[w.id];
        dark = U.mix(base, '#000000', 0.68);
        glow = U.mix(base, '#ffffff', 0.30);
      }
      return { id: w.id, name: w.name, base, dark, glow, sym: w.sym };
    });
  }

  function currentTheme() { return THEME; }
  function accentColor() { return '#ffffff'; }
  function accent2Color() { return '#c9c9cc'; }

  // write all CSS variables to :root
  function applyTheme() {
    const t = THEME;
    const root = document.documentElement.style;
    const brightness = clampVal(MUNDA.state.settings.brightness, 0.4, 1);

    // darken background with lower brightness
    const shade = (c) => U.mix(c, '#000000', (1 - brightness) * 0.45);
    const set = (k, v) => { root.setProperty(k, v); };

    set('--bg1', shade(t.bg1));
    set('--bg2', shade(t.bg2));
    set('--panel', t.panel);
    set('--panel-solid', t.panelSolid);
    set('--surface', t.surface);
    set('--surface-solid', t.surfaceSolid);
    set('--border', t.border);
    set('--border-strong', t.borderStrong);
    set('--text', t.text);
    set('--text2', t.text2);
    set('--text3', t.text3);
    set('--accent', '#ffffff');
    set('--accent-2', '#c9c9cc');
    set('--accent-soft', 'rgba(255,255,255,0.16)');
    set('--ok', '#ffffff');
    set('--bad', '#8a8a8e');
    set('--shadow-1', '0 1px 0 rgba(255,255,255,0.05) inset, 0 10px 40px rgba(0,0,0,0.55)');

    document.body.classList.toggle('high-contrast', !!MUNDA.state.settings.highContrast);
    document.body.classList.toggle('reduce', MUNDA.state.settings.motion < 0.4);
  }

  function clampVal(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  MUNDA.resolveWires = resolveWires;
  MUNDA.currentTheme = currentTheme;
  MUNDA.accentColor = accentColor;
  MUNDA.accent2Color = accent2Color;
  MUNDA.applyTheme = applyTheme;

})(typeof window !== 'undefined' ? window : this);
