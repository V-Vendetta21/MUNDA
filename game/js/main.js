/* ============================================================
   MUNDA — main.js
   Bootstrap: load state, apply theme, wire input, run.
   Unified pointer handling for mouse + touch on the board.
   ============================================================ */
(function (global) {
  'use strict';
  const MUNDA = global.MUNDA;
  const U = MUNDA;

  function boot() {
    // load persisted state
    MUNDA.state = MUNDA.storage.loadState();

    // apply theme + accessibility classes
    MUNDA.applyTheme();
    MUNDA.Screens.init();
    MUNDA.Screens.refreshMute();
    MUNDA.Screens.updateMenuBest();

    // background ambient board (drawn behind everything in gameplay)
    setupAmbient();

    // input on the wiring canvas
    const canvas = document.getElementById('wires');
    const Game = MUNDA.game;

    function toLocal(e) {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    canvas.addEventListener('pointerdown', (e) => {
      MUNDA.audio.init();          // ensure context on first gesture
      MUNDA.audio.resume();
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      const p = toLocal(e);
      Game.onPointerDown(p.x, p.y);
    });

    canvas.addEventListener('pointermove', (e) => {
      const p = toLocal(e);
      if (e.buttons === 0) {
        // hover only
        Game.onPointerMove(p.x, p.y);
        // throttled hover sound
        const h = MUNDA.BoardRenderer.hover;
        if (h && h.wire !== undefined) {
          const now = performance.now();
          if (now - (MUNDA._hoverSoundT || 0) > 120) {
            MUNDA.audio.hover();
            MUNDA._hoverSoundT = now;
          }
        }
      } else {
        Game.onPointerMove(p.x, p.y);
      }
    });

    const upHandler = (e) => {
      const p = toLocal(e);
      Game.onPointerUp(p.x, p.y);
    };
    canvas.addEventListener('pointerup', upHandler);
    canvas.addEventListener('pointercancel', upHandler);
    canvas.addEventListener('pointerleave', () => {
      if (!Game.drag) Game.onPointerUp(-9999, -9999);
    });

    // resize handling
    global.addEventListener('resize', () => {
      MUNDA.BoardRenderer.resize();
      MUNDA.StripRenderer.resize();
    });
    // keyboard
    global.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        if (Game.phase === 'paused') Game.pause(false);
        else if (Game.phase === 'playing') Game.pause(true);
      }
    });
  }

  // subtle animated ambient background canvas
  function setupAmbient() {
    const cv = document.getElementById('board');
    const ctx = cv.getContext('2d');
    let raf, t = 0;
    function resize() {
      const dpr = Math.min(global.devicePixelRatio || 1, 2);
      cv.width = global.innerWidth * dpr;
      cv.height = global.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    global.addEventListener('resize', resize);
    const pts = [];
    for (let i = 0; i < 14; i++) {
      pts.push({ x: Math.random(), y: Math.random(), r: 1 + Math.random() * 2, s: 0.0004 + Math.random() * 0.0008, a: 0.03 + Math.random() * 0.05, hue: Math.random() });
    }
    function loop() {
      t++;
      ctx.clearRect(0, 0, cv.width, cv.height);
      const acc = MUNDA.state ? MUNDA.state.settings.motion : 1;
      if (acc < 0.05) { raf = requestAnimationFrame(loop); return; }
      const W = global.innerWidth, H = global.innerHeight;
      for (const p of pts) {
        const y = (p.y + t * p.s) % 1;
        const a = p.a * (0.5 + 0.5 * Math.sin(t * 0.02 + p.hue * 20));
        ctx.fillStyle = 'rgba(255,255,255,' + a + ')';
        ctx.beginPath();
        ctx.arc(p.x * W, y * H, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})(typeof window !== 'undefined' ? window : this);
