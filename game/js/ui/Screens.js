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
        if (global.MUNDA_MUSIC) global.MUNDA_MUSIC.setMuted(MUNDA.state.settings.muted);
        this.refreshMute();
        if (!MUNDA.state.settings.muted) MUNDA.audio.click();
      });

      // keyboard shortcuts (1–6, 8) launch menu actions via their keycap hints
      const keyMap = { 1:'production', 2:'endless', 3:'panic', 4:'daily', 5:'training', 6:'customization', '?':'help', 8:'settings' };
      global.addEventListener('keydown', (e) => {
        if (!this.els.screenMenu.classList.contains('active')) return;
        if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
        const key = e.key === '?' ? '?' : /^[1-8]$/.test(e.key) ? e.key : null;
        if (!key) return;
        const nav = keyMap[key];
        if (!nav) return;
        const btn = U.$all('[data-nav]', this.els.screenMenu).find((b) => b.getAttribute('data-nav') === nav);
        if (btn) { e.preventDefault(); btn.click(); }
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
      this.els.gameRoot.setAttribute('data-mode', mode || 'production');
      document.getElementById('board').style.display = 'block';
      MUNDA.BoardRenderer.init();
      if (MUNDA.TraceRenderer && MUNDA.TraceRenderer.init) MUNDA.TraceRenderer.init();
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
      if (MUNDA.TraceRenderer && MUNDA.TraceRenderer.cancel) MUNDA.TraceRenderer.cancel();
      document.body.classList.remove('panic-mode','blackout-mode','clean-room-mode');
      this.els.tutorialTip.hidden = true;
      this.els.debugOverlay.hidden = true;
      this.updateMenuBest();
    },

    updateHud: function (g) {
      const modeNames = { production:'hud.production', endless:'hud.endless', panic:'hud.panic', daily:'hud.daily', training:'hud.training' };
      this.els.hudMode.textContent = MUNDA.t(modeNames[g.mode] || 'hud.production');
      this.els.hudLevel.innerHTML = '<b>' + String(g.level).padStart(2, '0') + '</b>';
      this.els.hudScore.textContent = U.fmt(g.score);
      this.els.hudStreak.textContent = MUNDA.t('hud.streak', { n: g.streak }) + ' · ' + g.multiplierLabel;
      this.els.hudStreak.classList.toggle('zero', g.streak === 0);
      this.els.hudConns.textContent = g.puzzle ? MUNDA.t('hud.conns.fmt', { a: g.connected, b: g.puzzle.count }) : '--';
      this.els.hudRouting.textContent = g.puzzle ? g.currentRouting() + '%' : '--%';
      this.els.hudTimer.hidden = !g.deadline;
    },

    updateTimer: function (seconds) {
      this.els.hudTimer.hidden = false;
      this.els.hudTimer.querySelector('b').textContent = seconds.toFixed(1) + 's';
      this.els.hudTimer.classList.toggle('urgent', seconds < 6);
      // make the label clearer for time circuits
      if (!this._timerLabelSet) {
        const span = this.els.hudTimer.querySelector('span');
        if (span && MUNDA.t) span.textContent = MUNDA.t('hud.window');
        this._timerLabelSet = true;
      }
    },

    setMechanics: function (puzzle) {
      const labels = (puzzle.mechanics.active || []).map((m) => m.replace(/\b\w/g, (x) => x.toUpperCase()));
      labels.push(...(puzzle.mechanics.modifiers || []));
      if (puzzle.major) labels.unshift('PHASE ' + puzzle.major.phase + '/5');
      this.els.mechanicStrip.textContent = labels.length ? labels.join(' · ') : MUNDA.t('tip.standard');
      this.els.mechanicStrip.classList.toggle('modifiers-active', !!(puzzle.mechanics.modifiers || []).length);
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
      MUNDA.Screens.setStripStatus(MUNDA.t('strip.qcpass'), 'ok');
      const bonuses = [];
      bonuses.push(`${MUNDA.t('qc.levelBonus')} <b style="color:var(--text)">+${U.fmt(d.levelBonus)}</b>`);
      bonuses.push(`${MUNDA.t('qc.precisionBonus')} <b style="color:var(--text)">+${U.fmt(d.speedBonus)}</b>`);
      bonuses.push(`${MUNDA.t('qc.perfect')} <b style="color:var(--text)">+${U.fmt(d.perfectBonus)}</b>`);
      bonuses.push(`${MUNDA.t('qc.routingBonus')} <b style="color:var(--text)">+${U.fmt(d.routingBonus)}</b>`);
      bonuses.push(`${MUNDA.t('qc.streak', { n: d.streak })}`);

      const nextBtn = d.mode !== 'daily'
        ? `<button class="btn btn--primary" data-qc="next">${MUNDA.t('qc.next')} <span style="opacity:.7">▸</span></button>`
        : `<button class="btn btn--primary" data-qc="next">${MUNDA.t('qc.continue')} <span style="opacity:.7">∞</span></button>`;

      const html = `
        <div class="modal">
          <h2 class="ok">${MUNDA.t('qc.title')}</h2>
          <div class="modal-sub">${MUNDA.t('qc.sub', { n: String(d.level).padStart(2,'0') })}</div>
          <div class="pass-badge ok"><span class="pass-dot"></span>${MUNDA.t('qc.status')}</div>
          <div class="assembly-grade"><span>${MUNDA.t('qc.grade')}</span><b>${d.rating.grade}</b></div>
          <div class="qc-grid">
            <div class="qc-cell"><div class="qc-k">${MUNDA.t('qc.precision')}</div><div class="qc-v good">${d.rating.precision}%</div></div>
            <div class="qc-cell"><div class="qc-k">${MUNDA.t('qc.routing')}</div><div class="qc-v">${d.rating.routing}%</div></div>
            <div class="qc-cell"><div class="qc-k">${MUNDA.t('qc.cableOrder')}</div><div class="qc-v">${d.rating.cableOrder}%</div></div>
            <div class="qc-cell"><div class="qc-k">${MUNDA.t('qc.time')}</div><div class="qc-v">${d.rating.speed}%</div></div>
            <div class="qc-cell"><div class="qc-k">${MUNDA.t('qc.sequence')}</div><div class="qc-v">${d.rating.sequence}%</div></div>
            <div class="qc-cell"><div class="qc-k">${MUNDA.t('qc.crossings')}</div><div class="qc-v">${d.crossings}</div></div>
          </div>
          <div class="qc-bonus">${MUNDA.t('qc.bonus', { list: bonuses.join(' &nbsp;|&nbsp; ') })}</div>
          ${nextBtn}
          <button class="btn" data-qc="menu">${MUNDA.t('qc.menu')}</button>
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
      const diagnostic = d.reason === 'timeout' ? MUNDA.t('fail.diag.timeout') : d.reason === 'sequence' ? MUNDA.t('fail.diag.sequence') : virus ? MUNDA.t('fail.diag.virus') : endless ? MUNDA.t('fail.diag.stop') : MUNDA.t('fail.diag.routing');
      MUNDA.Screens.setStripStatus(diagnostic, 'bad');
      const title = diagnostic;
      const msg = virus
        ? MUNDA.t('fail.msg.virus')
        : endless
        ? MUNDA.t('fail.msg.endless')
        : d.reason === 'timeout'
        ? MUNDA.t('fail.msg.timeout')
        : d.reason === 'sequence'
        ? MUNDA.t('fail.msg.sequence')
        : MUNDA.t('fail.msg.default');

      const stats = endless
        ? `<div class="stat-list">
             <div class="stat-row"><span class="k">${MUNDA.t('fail.score')}</span><span class="v">${U.fmt(d.score)}</span></div>
             <div class="stat-row"><span class="k">${MUNDA.t('fail.level')}</span><span class="v">${String(d.level).padStart(2,'0')}</span></div>
             <div class="stat-row"><span class="k">${MUNDA.t('fail.conns')}</span><span class="v">${U.fmt(MUNDA.game.correctConnections)}</span></div>
             <div class="stat-row"><span class="k">${MUNDA.t('fail.mistakes')}</span><span class="v">${U.fmt(d.mistakes)}</span></div>
             <div class="stat-row"><span class="k">${MUNDA.t('fail.streak')}</span><span class="v">×${d.streak}</span></div>
             <div class="stat-row"><span class="k">${MUNDA.t('fail.best')}</span><span class="v">${U.fmt(d.best)}</span></div>
             <div class="stat-row"><span class="k">${MUNDA.t('fail.longest')}</span><span class="v">${String(MUNDA.state.progress.endlessLongest).padStart(2,'0')}</span></div>
           </div>`
        : `<div class="stat-list">
             <div class="stat-row"><span class="k">${MUNDA.t('fail.stage')}</span><span class="v">${String(d.level).padStart(2,'0')}</span></div>
             <div class="stat-row"><span class="k">${MUNDA.t('fail.runscore')}</span><span class="v">${U.fmt(d.score)}</span></div>
             <div class="stat-row"><span class="k">${MUNDA.t('fail.best')}</span><span class="v">${U.fmt(d.best)}</span></div>
           </div>`;

      const restart = endless ? MUNDA.t('fail.retry') : MUNDA.t('fail.restart');
      const html = `
        <div class="modal">
          <h2 class="bad">${title}</h2>
          <div class="modal-sub">${MUNDA.t('fail.sub', { n: String(d.level).padStart(2,'0') })}</div>
          <div class="pass-badge bad"><span class="pass-dot"></span>${virus ? MUNDA.t('fail.badge.virus') : MUNDA.t('fail.badge')}</div>
          <div class="modal-msg">${msg}</div>
          ${stats}
          <button class="btn btn--danger" data-f="retry">${restart}</button>
          <button class="btn" data-f="menu">${MUNDA.t('qc.menu')}</button>
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
      if (p.bestScore > 0) parts.push(MUNDA.t('menu.best.best') + ' ' + U.fmt(p.bestScore));
      if (p.highestLevel > 1) parts.push(MUNDA.t('menu.best.stage') + ' ' + String(p.highestLevel).padStart(2, '0'));
      if (p.endlessBest > 0) parts.push(MUNDA.t('menu.best.endless') + ' ' + U.fmt(p.endlessBest));
      this.els.menuBest.textContent = parts.length ? parts.join(' · ') : MUNDA.t('menu.best.none');
      this.els.menuRank.textContent = p.rank || MUNDA.Scoring.rank(p);
      this.els.menuProgress.textContent = MUNDA.t('menu.progress').replace('STAGE 01', 'STAGE ' + String(p.highestLevel || 1).padStart(2,'0')).replace('ROUTING 0%', 'ROUTING ' + (p.averageRouting || 0) + '%');
    },

    showTraining: function () {
      const items = [
        ['basic','train.basic'],['guides','train.guides'],['sequence','train.sequence'],['moving','train.moving'],['timed','train.timed'],['damaged','train.damaged'],['split','train.split'],['power','train.power'],['locks','train.locks']
      ];
      this.showModalHTML(`<div class="panel"><div class="panel-head"><h2>${MUNDA.t('train.title')}</h2><button class="panel-close" data-training-close>×</button></div><p class="modal-msg">${MUNDA.t('train.sub')}</p><div class="training-grid">${items.map(([id,label])=>`<button class="btn" data-training="${id}"><b>${MUNDA.t(label)}</b></button>`).join('')}</div></div>`);
      this.els.modalLayer.querySelector('[data-training-close]').onclick=()=>this.hideModal();
      this.els.modalLayer.querySelectorAll('[data-training]').forEach((b)=>b.onclick=()=>{this.hideModal();MUNDA.game.startMode('training',{training:b.dataset.training})});
    },

    showPanicTiers: function () {
      this.showModalHTML(`<div class="panel panic-tier-panel"><div class="panel-head"><h2>${MUNDA.t('panic.title')}</h2><button class="panel-close" data-panic-close>×</button></div><p class="modal-msg">${MUNDA.t('panic.sub')}</p><div class="training-grid">${['I','II','III','IV','Ω'].map((tier,i)=>`<button class="btn" data-panic="${i+1}"><b>PANIC ${tier}</b><small>${MUNDA.t('panic.window', { n: 42-i*5 })}</small></button>`).join('')}</div></div>`);
      this.els.modalLayer.querySelector('[data-panic-close]').onclick=()=>this.hideModal();
      this.els.modalLayer.querySelectorAll('[data-panic]').forEach((b)=>b.onclick=()=>{this.hideModal();MUNDA.game.startMode('panic',{level:Number(b.dataset.panic)})});
    },

    showTutorialFor: function (puzzle) {
      if (!MUNDA.state.settings.tutorials) return;
      const mechanic=(puzzle.mechanics.active||[]).find((m)=>!MUNDA.state.progress.tutorialsSeen[m]);
      if (!mechanic) return;
      const text={obstacles:'tip.obstacles',guides:'tip.guides',sequence:'tip.sequence',moving:'tip.moving',timed:'tip.timed',damaged:'tip.damaged',split:'tip.split',power:'tip.power',hidden:'tip.hidden',locks:'tip.locks',panic:'tip.panic',major:'tip.major'}[mechanic];
      if (!text) return;
      this.els.tutorialTip.textContent=MUNDA.t(text);this.els.tutorialTip.hidden=false;
      MUNDA.state.progress.tutorialsSeen[mechanic]=true;MUNDA.storage.saveProgress(MUNDA.state.progress);
      clearTimeout(this._tutorialTimer);this._tutorialTimer=setTimeout(()=>{this.els.tutorialTip.hidden=true},4300);
    },

    updateDebug: function (g) {
      if (!MUNDA.debug) return;
      const el=this.els.debugOverlay;el.hidden=false;
      el.textContent=['STATE '+g.machine.state,'SEED '+g.seed,'STAGE '+g.level,'BUDGET '+(g.params&&g.params.mechanics?g.params.mechanics.budget:'-'),'TRACE '+(g.traceAccuracy||'--')+'%','CROSSINGS '+(g.puzzle?MUNDA.Routing.countCrossings(g.puzzle.wires.filter(w=>w.route).map(w=>w.route)):0),'VALID '+(g.puzzle?g.puzzle.validation.valid:'-'),'OBSTACLES '+(g.puzzle?g.puzzle.obstacles.length:0)].join('\n');
      this._debugLast=g.lastTick;
    },

    showHelp: function () {
      const html = `
        <div class="panel">
          <div class="panel-head"><h2>${MUNDA.t('help.title')}</h2><button class="panel-close" data-help="close">✕</button></div>
          <div class="panel-section">
            <div class="help-list">
              <div class="help-step"><div class="n">1</div><p><b>${MUNDA.t('help.s1.t')}</b> ${MUNDA.t('help.s1.b')}</p></div>
              <div class="help-step"><div class="n">2</div><p><b>${MUNDA.t('help.s2.t')}</b> ${MUNDA.t('help.s2.b')}</p></div>
              <div class="help-step"><div class="n">3</div><p><b>${MUNDA.t('help.s3.t')}</b> ${MUNDA.t('help.s3.b')}</p></div>
              <div class="help-step"><div class="n">4</div><p><b>${MUNDA.t('help.s4.t')}</b> ${MUNDA.t('help.s4.b')}</p></div>
              <div class="help-step"><div class="n">5</div><p><b>${MUNDA.t('help.s5.t')}</b> ${MUNDA.t('help.s5.b')}</p></div>
              <div class="help-step"><div class="n">6</div><p><b>${MUNDA.t('help.s6.t')}</b> ${MUNDA.t('help.s6.b')}</p></div>
            </div>
          </div>
          <div class="panel-section">
            <h3>${MUNDA.t('help.cues')}</h3>
            <div class="help-colorlegend" id="help-legend"></div>
          </div>
          <button class="btn btn--primary" data-help="start">${MUNDA.t('help.start')}</button>
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
