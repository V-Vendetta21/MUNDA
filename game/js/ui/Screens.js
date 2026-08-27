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
        hudRouting: document.getElementById('hud-routing'),
        hudTimer: document.getElementById('hud-timer'),
        hudConns: document.getElementById('hud-conns'),
        mechanicStrip: document.getElementById('mechanic-strip'),
        boardHint: document.getElementById('board-hint'),
        stripStatus: document.getElementById('strip-status'),
        modalLayer: document.getElementById('modal-layer'),
        toast: document.getElementById('toast'),
        menuBest: document.getElementById('menu-best'),
        menuRank: document.getElementById('menu-rank'),
        menuProgress: document.getElementById('menu-progress'),
        tutorialTip: document.getElementById('tutorial-tip'),
        debugOverlay: document.getElementById('debug-overlay'),
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
          else if (nav === 'panic') { self.showPanicTiers(); }
          else if (nav === 'daily') { MUNDA.game.startMode('daily'); }
          else if (nav === 'training') { self.showTraining(); }
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
      if (MUNDA.game.machine) MUNDA.game.machine.force('MENU');
      document.body.classList.remove('panic-mode','blackout-mode','clean-room-mode');
      this.els.tutorialTip.hidden = true;
      this.els.debugOverlay.hidden = true;
      this.updateMenuBest();
    },

    updateHud: function (g) {
      const modeNames = { production:'PRODUCTION SHIFT', endless:'ENDLESS', panic:'PANIC MODE', daily:'DAILY ASSEMBLY', training:'TRAINING' };
      this.els.hudMode.textContent = modeNames[g.mode] || String(g.mode).toUpperCase();
      this.els.hudLevel.innerHTML = '<b>' + String(g.level).padStart(2, '0') + '</b>';
      this.els.hudScore.textContent = U.fmt(g.score);
      this.els.hudStreak.textContent = 'STREAK ×' + g.streak + ' · ' + g.multiplierLabel;
      this.els.hudStreak.classList.toggle('zero', g.streak === 0);
      this.els.hudConns.textContent = g.connected + '/' + g.puzzle.count;
      this.els.hudRouting.textContent = g.currentRouting() + '%';
      this.els.hudTimer.hidden = !g.deadline;
    },

    updateTimer: function (seconds) {
      this.els.hudTimer.hidden = false;
      this.els.hudTimer.querySelector('b').textContent = seconds.toFixed(1) + 's';
      this.els.hudTimer.classList.toggle('urgent', seconds < 6);
    },

    setMechanics: function (puzzle) {
      const labels = (puzzle.mechanics.active || []).map((m) => m.replace(/\b\w/g, (x) => x.toUpperCase()));
      labels.push(...(puzzle.mechanics.modifiers || []));
      if (puzzle.major) labels.unshift('PHASE ' + puzzle.major.phase + '/5');
      this.els.mechanicStrip.textContent = labels.length ? labels.join(' · ') : 'STANDARD HARNESS';
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
      bonuses.push(`ROUTING <b style="color:var(--text)">+${U.fmt(d.routingBonus)}</b>`);
      bonuses.push(`STREAK <b style="color:var(--text)">×${d.streak}</b>`);

      const nextBtn = d.mode !== 'daily'
        ? '<button class="btn btn--primary" data-qc="next">NEXT STAGE <span style="opacity:.7">▸</span></button>'
        : '<button class="btn btn--primary" data-qc="next">CONTINUE <span style="opacity:.7">∞</span></button>';

      const html = `
        <div class="modal">
          <h2 class="ok">QUALITY CONTROL · PASS</h2>
          <div class="modal-sub">Stage ${String(d.level).padStart(2,'0')} · production verified</div>
          <div class="pass-badge ok"><span class="pass-dot"></span>SYSTEM STATUS: PASS</div>
          <div class="assembly-grade"><span>ASSEMBLY GRADE</span><b>${d.rating.grade}</b></div>
          <div class="qc-grid">
            <div class="qc-cell"><div class="qc-k">PRECISION</div><div class="qc-v good">${d.rating.precision}%</div></div>
            <div class="qc-cell"><div class="qc-k">ROUTING</div><div class="qc-v">${d.rating.routing}%</div></div>
            <div class="qc-cell"><div class="qc-k">CABLE ORDER</div><div class="qc-v">${d.rating.cableOrder}%</div></div>
            <div class="qc-cell"><div class="qc-k">TIME</div><div class="qc-v">${d.rating.speed}%</div></div>
            <div class="qc-cell"><div class="qc-k">SEQUENCE</div><div class="qc-v">${d.rating.sequence}%</div></div>
            <div class="qc-cell"><div class="qc-k">CROSSINGS</div><div class="qc-v">${d.crossings}</div></div>
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
      const virus = d.reason === 'virus';
      const diagnostic = d.reason === 'timeout' ? 'VOLTAGE WINDOW CLOSED' : d.reason === 'sequence' ? 'SEQUENCE ERROR' : virus ? 'BIO-CONTAMINATION' : endless ? 'PRODUCTION STOPPED' : 'ROUTING ERROR';
      MUNDA.Screens.setStripStatus(diagnostic, 'bad');
      const title = diagnostic;
      const msg = virus
        ? 'Live wire contacted a contamination node.<br>The production line has been isolated and the run is over.'
        : endless
        ? 'Incorrect electrical connection detected.<br>The LED textile system failed quality check.'
        : d.reason === 'timeout'
        ? 'Calibration window expired.<br>Assembly rejected — resetting production line.'
        : d.reason === 'sequence'
        ? 'Circuit order did not match the schematic.<br>Assembly rejected — resetting production line.'
        : 'Circuit mismatch detected.<br>Assembly rejected — resetting production line.';

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
          <div class="pass-badge bad"><span class="pass-dot"></span>${virus ? 'LINE CONTAMINATED' : 'DEFECTIVE ASSEMBLY'}</div>
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
      this.els.menuRank.textContent = p.rank || MUNDA.Scoring.rank(p);
      this.els.menuProgress.textContent = 'STAGE ' + String(p.highestLevel || 1).padStart(2,'0') + ' · ROUTING ' + (p.averageRouting || 0) + '%';
    },

    showTraining: function () {
      const items = [
        ['basic','BASIC WIRING'],['guides','CABLE ROUTING'],['sequence','SEQUENCES'],['moving','MOVING TERMINALS'],['timed','TIMED CIRCUITS'],['damaged','DAMAGED WIRES'],['split','SPLIT CIRCUITS'],['power','POWER LOGIC'],['locks','LOCKED TERMINALS']
      ];
      this.showModalHTML(`<div class="panel"><div class="panel-head"><h2>TRAINING</h2><button class="panel-close" data-training-close>×</button></div><p class="modal-msg">Choose one system. Training is untimed and errors reset only the local circuit.</p><div class="training-grid">${items.map(([id,label])=>`<button class="btn" data-training="${id}"><b>${label}</b><small>Guided practice board</small></button>`).join('')}</div></div>`);
      this.els.modalLayer.querySelector('[data-training-close]').onclick=()=>this.hideModal();
      this.els.modalLayer.querySelectorAll('[data-training]').forEach((b)=>b.onclick=()=>{this.hideModal();MUNDA.game.startMode('training',{training:b.dataset.training})});
    },

    showPanicTiers: function () {
      this.showModalHTML(`<div class="panel panic-tier-panel"><div class="panel-head"><h2>PANIC MODE</h2><button class="panel-close" data-panic-close>×</button></div><p class="modal-msg">High-pressure repair with readable, deterministic escalation.</p><div class="training-grid">${['I','II','III','IV','Ω'].map((tier,i)=>`<button class="btn" data-panic="${i+1}"><b>PANIC ${tier}</b><small>${42-i*5}s calibration window</small></button>`).join('')}</div></div>`);
      this.els.modalLayer.querySelector('[data-panic-close]').onclick=()=>this.hideModal();
      this.els.modalLayer.querySelectorAll('[data-panic]').forEach((b)=>b.onclick=()=>{this.hideModal();MUNDA.game.startMode('panic',{level:Number(b.dataset.panic)})});
    },

    showTutorialFor: function (puzzle) {
      if (!MUNDA.state.settings.tutorials) return;
      const mechanic=(puzzle.mechanics.active||[]).find((m)=>!MUNDA.state.progress.tutorialsSeen[m]);
      if (!mechanic) return;
      const text={obstacles:'CABLE ROUTING · Guide the cable around blocked housings.',guides:'HARNESS GUIDES · Pass required cables through marked clips.',sequence:'CONNECTION ORDER · Follow the illuminated sequence.',moving:'MOVING LINE · Track motion is smooth and freezes during a drag.',timed:'VOLTAGE WINDOW · Complete the board before calibration closes.',damaged:'CONTINUITY REPAIR · Connect a damaged cable twice: repair, then route.',split:'SPLIT CIRCUIT · Lock the junction, then complete the branch.',power:'POWER LIMIT · Follow the displayed safe circuit order.',hidden:'MEMORY SIGNAL · Select a source to reveal its match briefly.',locks:'TERMINAL LOCK · Tap twice to calibrate before routing.',panic:'PANIC MODE · Work quickly; empty releases never count as mistakes.',major:'MAJOR ASSEMBLY · Five phases activate as the harness fills.'}[mechanic];
      if (!text) return;
      this.els.tutorialTip.textContent=text;this.els.tutorialTip.hidden=false;
      MUNDA.state.progress.tutorialsSeen[mechanic]=true;MUNDA.storage.saveProgress(MUNDA.state.progress);
      clearTimeout(this._tutorialTimer);this._tutorialTimer=setTimeout(()=>{this.els.tutorialTip.hidden=true},4300);
    },

    updateDebug: function (g) {
      if (!MUNDA.debug) return;
      const el=this.els.debugOverlay;el.hidden=false;
      el.textContent=['STATE '+g.machine.state,'SEED '+g.seed,'STAGE '+g.level,'BUDGET '+g.params.mechanics.budget,'FPS '+Math.round(1000/Math.max(1,g.lastTick-(this._debugLast||g.lastTick-16))),'CROSSINGS '+MUNDA.Routing.countCrossings(g.puzzle.wires.filter(w=>w.route).map(w=>w.route)),'VALID '+g.puzzle.validation.valid,'OBSTACLES '+g.puzzle.obstacles.length].join('\n');
      this._debugLast=g.lastTick;
    },

    showHelp: function () {
      const html = `
        <div class="panel">
          <div class="panel-head"><h2>HOW TO PLAY</h2><button class="panel-close" data-help="close">✕</button></div>
          <div class="panel-section">
            <div class="help-list">
              <div class="help-step"><div class="n">1</div><p><b>Match the terminals.</b> Connect each wire on the left to its matching connector on the right by <b>colour</b>, <b>number</b> and <b>symbol</b>.</p></div>
              <div class="help-step"><div class="n">2</div><p><b>Drag or tap.</b> Press a terminal and drag the live wire to its pair, or tap the two matching terminals one after the other.</p></div>
              <div class="help-step"><div class="n">3</div><p><b>Fill the strip.</b> Each correct connection energises a section of the MUNDA textile LED lighting strip.</p></div>
              <div class="help-step"><div class="n">4</div><p><b>Avoid contamination.</b> Do not let the live wire touch the small green virus nodes — contact ends the run immediately.</p></div>
              <div class="help-step"><div class="n">5</div><p><b>Use the keyboard.</b> Press <b>1–9</b> or the numpad to select the numbered source post, then click its match on the right.</p></div>
              <div class="help-step"><div class="n">6</div><p><b>Complete the stage</b> to earn level, precision and perfect-assembly bonuses. Chain clean stages for streak multipliers.</p></div>
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
