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
    { id:'red',name:'Pure White',base:'#f8f8f6',dark:'#6f6f6c',glow:'#ffffff',sym:'triangle',pattern:'solid',stiffness:.91 },
    { id:'blue',name:'Silver Dash',base:'#d3d3cf',dark:'#555553',glow:'#f4f4f2',sym:'circle',pattern:'dashed',stiffness:.86 },
    { id:'yellow',name:'Platinum Dot',base:'#b9b9b6',dark:'#494947',glow:'#e7e7e4',sym:'diamond',pattern:'dotted',stiffness:.84 },
    { id:'magenta',name:'Graphite Double',base:'#929290',dark:'#343433',glow:'#cfcfcb',sym:'square',pattern:'double',stiffness:.94 },
    { id:'cyan',name:'Steel Stripe',base:'#dededb',dark:'#60605e',glow:'#ffffff',sym:'hex',pattern:'striped',stiffness:.88 },
    { id:'white',name:'Carbon Segment',base:'#777775',dark:'#222221',glow:'#b8b8b5',sym:'cross',pattern:'segmented',stiffness:.82 },
    { id:'orange',name:'Titanium Braid',base:'#c3c3c0',dark:'#444442',glow:'#efefec',sym:'ring',pattern:'braided',stiffness:.80 },
    { id:'violet',name:'Smoke Tech',base:'#666664',dark:'#191919',glow:'#aaa9a6',sym:'star',pattern:'tech',stiffness:.90 },
    { id:'green',name:'High Contrast',base:'#ffffff',dark:'#050505',glow:'#ffffff',sym:'plus',pattern:'contrast',stiffness:.96 },
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
      interfaceVolume: 0.72,
      circuitVolume: 0.78,
      ambienceVolume: 0.36,
      haptics: true,
      screenShake: true,
      largeTerminals: false,
      strongPatterns: false,
      tutorials: true,
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
      perfectBoards: 0,
      majorCompleted: 0,
      averagePrecision: 0,
      averageRouting: 0,
      ratedBoards: 0,
      rank: 'TRAINEE',
      tutorialsSeen: {},
      dailyResults: {},
      unlockedThemes: ['professional'],
    },
  };

})(typeof window !== 'undefined' ? window : this);
