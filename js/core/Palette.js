/* ============================================================
   MUNDA — Palette.js
   Theme tokens, wire/LED/accent color resolution, accessibility.
   Applies theme + accent to CSS custom properties at runtime.
   ============================================================ */
(function (global) {
  'use strict';
  const MUNDA = global.MUNDA;
  const U = MUNDA;

  const THEMES = {
    professional: {
      id: 'professional', name: 'MUNDA Professional',
      bg1: '#070b12', bg2: '#0d1626',
      panel: 'rgba(255,255,255,0.035)', panelSolid: '#0e1623',
      surface: 'rgba(255,255,255,0.06)', surfaceSolid: '#151f30',
      border: 'rgba(255,255,255,0.09)', borderStrong: 'rgba(255,255,255,0.16)',
      text: '#f4f7fb', text2: '#b9c3d4', text3: '#6f7c92',
      accent: '#29c6ff', accent2: '#5b8cff',
    },
    automotive: {
      id: 'automotive', name: 'Automotive Blue',
      bg1: '#060a14', bg2: '#0c1830',
      panel: 'rgba(255,255,255,0.04)', panelSolid: '#0c1426',
      surface: 'rgba(255,255,255,0.065)', surfaceSolid: '#15233a',
      border: 'rgba(255,255,255,0.09)', borderStrong: 'rgba(255,255,255,0.17)',
      text: '#f2f7ff', text2: '#b7c7e4', text3: '#6d7ea0',
      accent: '#3d8bff', accent2: '#4dc2ff',
    },
    cyan: {
      id: 'cyan', name: 'Electric Cyan',
      bg1: '#041016', bg2: '#07262e',
      panel: 'rgba(255,255,255,0.04)', panelSolid: '#07232b',
      surface: 'rgba(255,255,255,0.07)', surfaceSolid: '#0d3340',
      border: 'rgba(255,255,255,0.10)', borderStrong: 'rgba(255,255,255,0.18)',
      text: '#eefcff', text2: '#a8dbe6', text3: '#5f8f9c',
      accent: '#2ee6e0', accent2: '#2ea7ff',
    },
    industrial: {
      id: 'industrial', name: 'Industrial Dark',
      bg1: '#0a0a0a', bg2: '#171a17',
      panel: 'rgba(255,255,255,0.035)', panelSolid: '#141614',
      surface: 'rgba(255,255,255,0.06)', surfaceSolid: '#1d211d',
      border: 'rgba(255,255,255,0.09)', borderStrong: 'rgba(255,255,255,0.17)',
      text: '#f5f6f2', text2: '#c4c9bd', text3: '#7d8376',
      accent: '#ffb03a', accent2: '#ff7a3a',
    },
    neon: {
      id: 'neon', name: 'Neon',
      bg1: '#0a0414', bg2: '#18072a',
      panel: 'rgba(255,255,255,0.04)', panelSolid: '#150a22',
      surface: 'rgba(255,255,255,0.07)', surfaceSolid: '#21123a',
      border: 'rgba(255,255,255,0.10)', borderStrong: 'rgba(255,255,255,0.18)',
      text: '#f7f2ff', text2: '#d3c3f5', text3: '#8d74b8',
      accent: '#b36bff', accent2: '#ff4fc9',
    },
    minimal: {
      id: 'minimal', name: 'Minimal White',
      bg1: '#eef1f5', bg2: '#dfe6ef',
      panel: 'rgba(12,20,35,0.03)', panelSolid: '#f6f8fb',
      surface: 'rgba(12,20,35,0.05)', surfaceSolid: '#ffffff',
      border: 'rgba(10,18,32,0.12)', borderStrong: 'rgba(10,18,32,0.22)',
      text: '#0d1624', text2: '#34455e', text3: '#6b7a92',
      accent: '#0f7fe8', accent2: '#38b6ff',
    },
  };
  MUNDA.THEMES = THEMES;
  MUNDA.THEME_ORDER = Object.keys(THEMES);

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

  function currentTheme() {
    return THEMES[MUNDA.state.custom.theme] || THEMES.professional;
  }

  function accentColor() {
    const c = MUNDA.state.custom.accent;
    if (c) return c;
    return currentTheme().accent;
  }
  function accent2Color() {
    const c = MUNDA.state.custom.accent;
    if (c) return U.mix(c, '#ffffff', 0.10);
    return currentTheme().accent2;
  }

  // write all CSS variables to :root
  function applyTheme() {
    const t = currentTheme();
    const acc = accentColor();
    const acc2 = accent2Color();
    const root = document.documentElement.style;
    const brightness = clampVal(MUNDA.state.settings.brightness, 0.4, 1);

    // interpolate backgrounds toward accent for a light "temperature" shift with brightness
    const shade = (c) => U.mix(c, '#000000', (1 - brightness) * 0.45);
    const b1 = shade(t.bg1), b2 = shade(t.bg2);

    const set = (k, v) => { root.setProperty(k, v); };
    set('--bg1', b1);
    set('--bg2', b2);
    set('--panel', t.panel);
    set('--panel-solid', t.panelSolid);
    set('--surface', t.surface);
    set('--surface-solid', t.surfaceSolid);
    set('--border', t.border);
    set('--border-strong', t.borderStrong);
    set('--text', t.text);
    set('--text2', t.text2);
    set('--text3', t.text3);
    set('--accent', acc);
    set('--accent-2', acc2);
    set('--accent-soft', U.rgba(acc, 0.14));
    set('--ok', t.id === 'minimal' ? '#0f9d4a' : '#2fe06a');
    set('--bad', t.id === 'minimal' ? '#d62034' : '#ff4d5e');
    set('--shadow-1', '0 1px 0 rgba(255,255,255,0.04) inset, 0 10px 40px rgba(0,0,0,0.5)');

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
