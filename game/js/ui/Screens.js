/* ============================================================
   MUNDA — Screens.js
   UI orchestration: menu navigation, gameplay HUD, quality-
   control and failure modals, pause, and toasts.
   ============================================================ */
(function (global) {
  'use strict';
  const MUNDA = global.MUNDA;
  const U = MUNDA;

  const Screens = {
    $: {},
    els: {},

    init: function () {
      this.els = {
        screenMenu: document.getElementById('screen-menu'),
        gameRoot: document.getElementById('game-root'),
        hudMode: document.getElementById('hud-mode'),
        hudLevel: document.getElementById('hud-level'),
        hudScore: document.getElementById('hud-score'),
        hudStreak: document.getElementById('hud-streak'),
        hudConns: document.getElementById('hud-conns'),
        boardHint: document.getElementById('board-hint'),
        stripStatus: document.getElementById('strip-status'),
        modalLayer: document.getElementById('modal-layer'),
        toast: document.getElementById('toast'),
        menuBest: document.getElementById('menu-best'),
        menuMute: document.getElementById('menu-mute'),
        pauseOverlay: document.getElementById('pause-overlay'),
        pauseResume: document.getElementById('pause-resume'),
        pauseRestart: document.getElementById('pause-restart'),
        pauseMenu: document.getElementById('pause-menu'),
        hudPause: document.getElementById('hud-pause'),
      };
      this.bindMenu();
      this.bindPause();
    },

    bindMenu: function () {
      const self = this;
      U.$all('[data-nav]', this.els.screenMenu).forEach((btn) => {
        btn.addEventListener('click', () => {
          MUNDA.audio.init();
          MUNDA.audio.click();
          const nav = btn.getAttribute('data-nav');
          if (nav === 'production') { MUNDA.game.startMode('production'); }
          else if (nav === 'endless') { MUNDA.game.startMode('endless'); }
          else if (nav === 'customization') { MUNDA.Customization.open(); }
          else if (nav === 'settings') { MUNDA.Customization.openSettings(); }
          else if (nav === 'help') { self.showHelp(); }
        });
      });
      this.els.menuMute.addEventListener('click', () => {
        MUNDA.audio.init();
        MUNDA.state.settings.muted = !MUNDA.state.settings.muted;
        MUNDA.storage.saveSettings(MUNDA.state.settings);
        MUNDA.audio.setVolume();
        this.refreshMute();
        if (!MUNDA.state.settings.muted) MUNDA.audio.click();
      });
    },

    refreshMute: function () {
      const muted = MUNDA.state.settings.muted;
      this.els.menuMute.classList.toggle('off', muted);
      this.els.menuMute.textContent = muted ? '♪' : '♪';
    },

    bindPause: function () {
      const self = this;
      this.els.hudPause.addEventListener('click', () => { MUNDA.audio.click(); MUNDA.game.pause(true); });
      this.els.pauseResume.addEventListener('click', () => { MUNDA.audio.click(); MUNDA.game.pause(false); });
      this.els.pauseRestart.addEventListener('click', () => { MUNDA.audio.click(); self.hidePause(); MUNDA.game.startLevel(); });
      this.els.pauseMenu.addEventListener('click', () => { MUNDA.audio.click(); self.hidePause(); self.exitToMenu(); });
    },

    showScreen: function (id) {
      U.$all('.screen').forEach((s) => {
        s.classList.remove('active');
        if (s.id === id) s.classList.add('active');
      });
    },

    enterGame: function (mode) {
      this.els.screenMenu.classList.remove('active');
      this.els.gameRoot.classList.add('on');
      document.getElementById('board').style.display = 'block';
      MUNDA.BoardRenderer.init();
      MUNDA.StripRenderer.init();
    },

    exitToMenu: function () {
      this.hideModal();
      this.hidePause();
      this.els.gameRoot.classList.remove('on');
      this.els.screenMenu.classList.add('active');
      document.getElementById('board').style.display = 'none';
      MUNDA.game.phase = 'idle';
      this.updateMenuBest();
    },

    updateHud: function (g) {
      this.els.hudMode.textContent = g.mode === 'production' ? 'PRODUCTION SHIFT' : 'ENDLESS MODE';
      this.els.hudLevel.innerHTML = '<b>' + String(g.level).padStart(2, '0') + '</b>';
      this.els.hudScore.textContent = U.fmt(g.score);
      this.els.hudStreak.textContent = 'STREAK ×' + g.streak + ' · ' + g.multiplierLabel;
      this.els.hudStreak.classList.toggle('zero', g.streak === 0);
      this.els.hudConns.textContent = g.connected + '/' + g.puzzle.count;
    },

    setHint: function (text, hot) {
      this.els.boardHint.textContent = text;
      this.els.boardHint.classList.toggle('hot', !!hot);
    },

    setStripStatus: function (text, cls) {
      this.els.stripStatus.textContent = text || 'INTEGRATION';
      this.els.stripStatus.className = 'strip-status' + (cls ? ' ' + cls : '');
    },

    toast: function (msg, ok) {
      const t = this.els.toast;
      t.innerHTML = (ok ? '<span class="dot"></span>' : '<span class="dot" style="background:var(--bad);box-shadow:0 0 10px var(--bad)"></span>') + msg;
      t.classList.toggle('bad', !ok);
      t.classList.add('show');
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => t.classList.remove('show'), 1500);
    },

    hideModal: function () {
      this.els.modalLayer.classList.remove('active');
      this.els.modalLayer.innerHTML = '';
    },

    showModalHTML: function (html) {
      this.els.modalLayer.innerHTML = html;
      this.els.modalLayer.classList.add('active');
    },

    showQC: function (d) {
      MUNDA.Screens.setStripStatus('QUALITY CHECK · PASS', 'ok');
      const bonuses = [];
      bonuses.push(`LEVEL BONUS <b style="color:var(--text)">+${U.fmt(d.levelBonus)}</b>`);
      bonuses.push(`PRECISION BONUS <b style="color:var(--text)">+${U.fmt(d.speedBonus)}</b>`);
      bonuses.push(`PERFECT ASSEMBLY <b style="color:var(--text)">+${U.fmt(d.perfectBonus)}</b>`);
      bonuses.push(`STREAK <b style="color:var(--text)">×${d.streak}</b>`);

      const nextBtn = d.mode === 'production'
        ? '<button class="btn btn--primary" data-qc="next">NEXT STAGE <span style="opacity:.7">▸</span></button>'
        : '<button class="btn btn--primary" data-qc="next">CONTINUE <span style="opacity:.7">∞</span></button>';

      const html = `
        <div class="modal">
          <h2 class="ok">QUALITY CONTROL · PASS</h2>
          <div class="modal-sub">Stage ${String(d.level).padStart(2,'0')} · production verified</div>
          <div class="pass-badge ok"><span class="pass-dot"></span>SYSTEM STATUS: PASS</div>
          <div class="qc-grid">
            <div class="qc-cell"><div class="qc-k">CONNECTIONS</div><div class="qc-v good">${d.connections}</div></div>
            <div class="qc-cell"><div class="qc-k">ERRORS</div><div class="qc-v">${d.errors}</div></div>
            <div class="qc-cell"><div class="qc-k">SCORE</div><div class="qc-v">${U.fmt(d.score)}</div></div>
            <div class="qc-cell"><div class="qc-k">TIME</div><div class="qc-v">${d.elapsed.toFixed(1)}s</div></div>
          </div>
          <div class="qc-bonus">BONUSES · ${bonuses.join(' &nbsp;|&nbsp; ')}</div>
          ${nextBtn}
          <button class="btn" data-qc="menu">MAIN MENU</button>
        </div>`;
      this.showModalHTML(html);
      this.els.modalLayer.querySelector('[data-qc="next"]').addEventListener('click', () => {
        MUNDA.audio.complete(); this.hideModal(); MUNDA.game.nextLevel();
      });
      this.els.modalLayer.querySelector('[data-qc="menu"]').addEventListener('click', () => {
        MUNDA.audio.click(); this.hideModal(); this.exitToMenu();
      });
    },

    showFailure: function (d) {
      const endless = d.mode === 'endless';
      MUNDA.Screens.setStripStatus(endless ? 'PRODUCTION STOPPED' : 'ASSEMBLY ERROR', 'bad');
      const title = endless ? 'PRODUCTION STOPPED' : 'ASSEMBLY ERROR';
      const msg = endless
        ? 'Incorrect electrical connection detected.<br>The LED textile system failed quality check.'
        : 'Incorrect electrical connection detected.<br>The LED textile system failed quality check.<br>Run reset to Level 1.';

      const stats = endless
        ? `<div class="stat-list">
             <div class="stat-row"><span class="k">FINAL SCORE</span><span class="v">${U.fmt(d.score)}</span></div>
             <div class="stat-row"><span class="k">LEVEL REACHED</span><span class="v">${String(d.level).padStart(2,'0')}</span></div>
             <div class="stat-row"><span class="k">CORRECT CONNECTIONS</span><span class="v">${U.fmt(MUNDA.game.correctConnections)}</span></div>
             <div class="stat-row"><span class="k">MISTAKES</span><span class="v">${U.fmt(d.mistakes)}</span></div>
             <div class="stat-row"><span class="k">STREAK</span><span class="v">×${d.streak}</span></div>
             <div class="stat-row"><span class="k">BEST SCORE</span><span class="v">${U.fmt(d.best)}</span></div>
             <div class="stat-row"><span class="k">LONGEST RUN</span><span class="v">${String(MUNDA.state.progress.endlessLongest).padStart(2,'0')}</span></div>
           </div>`
        : `<div class="stat-list">
             <div class="stat-row"><span class="k">STAGE REACHED</span><span class="v">${String(d.level).padStart(2,'0')}</span></div>
             <div class="stat-row"><span class="k">RUN SCORE</span><span class="v">${U.fmt(d.score)}</span></div>
             <div class="stat-row"><span class="k">BEST SCORE</span><span class="v">${U.fmt(d.best)}</span></div>
           </div>`;

      const restart = endless ? 'TRY AGAIN' : 'RESTART PRODUCTION';
      const html = `
        <div class="modal">
          <h2 class="bad">${title}</h2>
          <div class="modal-sub">Stage ${String(d.level).padStart(2,'0')} · quality check failed</div>
          <div class="pass-badge bad"><span class="pass-dot"></span>DEFECTIVE ASSEMBLY</div>
          <div class="modal-msg">${msg}</div>
          ${stats}
          <button class="btn btn--danger" data-f="retry">${restart}</button>
          <button class="btn" data-f="menu">MAIN MENU</button>
        </div>`;
      this.showModalHTML(html);
      this.els.modalLayer.querySelector('[data-f="retry"]').addEventListener('click', () => {
        MUNDA.audio.click(); MUNDA.game.restartRun();
      });
      this.els.modalLayer.querySelector('[data-f="menu"]').addEventListener('click', () => {
        MUNDA.audio.click(); this.hideModal(); this.exitToMenu();
      });
    },

    showPause: function () {
      this.els.pauseOverlay.classList.add('active');
    },
    hidePause: function () {
      this.els.pauseOverlay.classList.remove('active');
    },

    updateMenuBest: function () {
      const p = MUNDA.state.progress;
      const parts = [];
      if (p.bestScore > 0) parts.push('BEST ' + U.fmt(p.bestScore));
      if (p.highestLevel > 1) parts.push('STAGE ' + String(p.highestLevel).padStart(2, '0'));
      if (p.endlessBest > 0) parts.push('ENDLESS ' + U.fmt(p.endlessBest));
      this.els.menuBest.textContent = parts.length ? parts.join(' · ') : 'NO RUNS YET';
    },

    showHelp: function () {
      const html = `
        <div class="panel">
          <div class="panel-head"><h2>HOW TO PLAY</h2><button class="panel-close" data-help="close">✕</button></div>
          <div class="panel-section">
            <div class="help-list">
              <div class="help-step"><div class="n">1</div><p><b>Match the terminals.</b> Connect each wire on the left to its matching connector on the right by <b>colour</b>, <b>number</b> and <b>symbol</b>.</p></div>
              <div class="help-step"><div class="n">2</div><p><b>Drag or tap.</b> Press a terminal and drag to its pair, or tap the two matching terminals one after the other.</p></div>
              <div class="help-step"><div class="n">3</div><p><b>Fill the strip.</b> Each correct connection energises a section of the MUNDA textile LED lighting strip.</p></div>
              <div class="help-step"><div class="n">4</div><p><b>One mistake stops the line.</b> A wrong connection fails quality control and resets the run. Stay precise.</p></div>
              <div class="help-step"><div class="n">5</div><p><b>Complete the stage</b> to earn level, precision and perfect-assembly bonuses. Chain clean stages for streak multipliers.</p></div>
            </div>
          </div>
          <div class="panel-section">
            <h3>CONNECTION CUES (ACCESSIBILITY)</h3>
            <div class="help-colorlegend" id="help-legend"></div>
          </div>
          <button class="btn btn--primary" data-help="start">START PRODUCTION SHIFT</button>
        </div>`;
      this.showModalHTML(html);
      const layer = this.els.modalLayer;
      layer.querySelector('[data-help="close"]').addEventListener('click', () => { MUNDA.audio.click(); this.hideModal(); });
      layer.querySelector('[data-help="start"]').addEventListener('click', () => { MUNDA.audio.click(); this.hideModal(); MUNDA.game.startMode('production'); });

      // legend of current wire colours
      const legend = layer.querySelector('#help-legend');
      MUNDA.resolveWires().slice(0, 9).forEach((w) => {
        const el = document.createElement('span');
        el.className = 'help-swatch';
        el.innerHTML = `<i style="background:${w.base};box-shadow:0 0 8px ${w.glow}"></i>${w.name} <span style="opacity:.6">${w.sym}</span>`;
        legend.appendChild(el);
      });
    },
  };

  MUNDA.Screens = Screens;

})(typeof window !== 'undefined' ? window : this);
