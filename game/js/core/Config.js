/* ============================================================
   MUNDA — Config.js
   Global namespace, constants, and default settings.
   ============================================================ */
(function (global) {
  'use strict';

  const MUNDA = global.MUNDA = (global.MUNDA || {});

  // Storage keys
  MUNDA.KEYS = {
    PROGRESS: 'munda.progress.v1',
    SETTINGS: 'munda.settings.v1',
    CUSTOM:   'munda.custom.v1',
    SOUND:    'munda.sound.v1',
  };

  // Base wire color catalogue. Each entry:
  //   id, name, base (main color), dark (shade for cable depth), glow, sym (accessibility symbol shape)
  MUNDA.WIRE_CATALOG = [
    { id: 'red',     name: 'Red',            base: '#ff4d5e', dark: '#5a0e18', glow: '#ff7d89', sym: 'circle' },
    { id: 'blue',    name: 'Electric Blue',  base: '#2f7bff', dark: '#0e2d6e', glow: '#5b9bff', sym: 'square' },
    { id: 'yellow',  name: 'Yellow',         base: '#ffd23f', dark: '#6e5a06', glow: '#ffe98a', sym: 'triangle' },
    { id: 'magenta', name: 'Magenta',        base: '#ff3da6', dark: '#6e0f3e', glow: '#ff7ac1', sym: 'diamond' },
    { id: 'cyan',    name: 'Cyan',           base: '#2ad2d9', dark: '#0b5357', glow: '#5ce8ee', sym: 'hex' },
    { id: 'white',   name: 'White',          base: '#e9eef5', dark: '#62697a', glow: '#ffffff', sym: 'cross' },
    { id: 'orange',  name: 'Orange',         base: '#ff8a2a', dark: '#6e3a08', glow: '#ffab66', sym: 'ring' },
    { id: 'violet',  name: 'Violet',         base: '#9b5cff', dark: '#3a1e6e', glow: '#b98aff', sym: 'star' },
    { id: 'green',   name: 'Green',          base: '#2fe06a', dark: '#0c5a2c', glow: '#5cff8f', sym: 'plus' },
  ];

  // Default settings
  MUNDA.DEFAULTS = {
    settings: {
      colorblind: false,   // high-contrast colorblind-safe palette
      brightness: 0.72,    // interface brightness 0..1
      motion: 1,           // animation intensity 0..1 (1 = full)
      highContrast: false, // UI high-contrast mode
      muted: false,        // audio mute
      soundVolume: 0.7,
    },
    custom: {
      theme: 'mono',             // single monochrome theme
      accent: null,              // unused — accent is always white
      ledColor: '#d8d8d4',       // LED textile strip (soft monochrome)
      ledSecond: '#92928e',
      wires: null,               // per-wire color overrides {id: hex} or null = defaults
    },
    progress: {
      highestLevel: 1,      // production shift highest level reached
      bestScore: 0,         // production shift best score
      endlessBest: 0,       // endless best score
      endlessLongest: 0,    // longest endless run (levels)
      runsCompleted: 0,
      totalConnections: 0,
      totalMistakes: 0,
      unlockedThemes: ['professional'],
    },
  };

})(typeof window !== 'undefined' ? window : this);
