/* ============================================================
   MUNDA — Game.js
   Core game state & rules: modes, levels, scoring, streaks,
   connection resolution, completion, and failure/reset.
   ============================================================ */
(function (global) {
  'use strict';
  const MUNDA = global.MUNDA;
  const U = MUNDA;

  const Game = {
    mode: null,          // 'production' | 'endless'
    level: 1,
    score: 0,
    streak: 0,
    multiplier: 1,
    connected: 0,
    correctConnections: 0,
    mistakes: 0,
    startTime: 0,
    puzzle: null,
    params: null,
    phase: 'idle',       // idle | playing | complete | failed | paused

    selection: null,     // armed {wire, side}
    drag: null,          // active drag {wire, side, moved, lastX, lastY}

    // ---- mode / level lifecycle ----
    startMode(mode) {
      this.mode = mode;
      this.level = 1;
      this.score = 0;
      this.streak = 0;
      this.multiplier = 1;
      this.correctConnections = 0;
      this.mistakes = 0;
      MUNDA.Screens.enterGame(mode);
      this.startLevel();
    },

    startLevel() {
      this.params = MUNDA.difficulty.getParams(this.level, this.mode);
      const wires = MUNDA.resolveWires();
      this.puzzle = MUNDA.puzzleGen.generate(this.params, wires);
      this.connected = 0;
      this.phase = 'playing';
      this.selection = null;
      this.drag = null;
      this.startTime = performance.now();

      MUNDA.BoardRenderer.setPuzzle(this.puzzle, this.level);
      MUNDA.StripRenderer.reset();
      MUNDA.Screens.updateHud(this);
      MUNDA.Screens.setHint('SELECT A TERMINAL');
    },

    get multiplierLabel() {
      return '×' + this.multiplier.toFixed(2).replace(/\.?0+$/, '');
    },

    // ---- interaction resolution ----
    hitTest(x, y) {
      return MUNDA.BoardRenderer.hitTest(x, y);
    },

    onPointerDown(x, y) {
      if (this.phase !== 'playing') return;
      const hit = this.hitTest(x, y);
      if (!hit) return;
      if (this.puzzle.wires[hit.wire].connected) return;
      const priorSelection = this.selection;
      this.selection = { wire: hit.wire, side: hit.side };
      MUNDA.BoardRenderer.setSelection(this.selection);
      this.drag = { wire: hit.wire, side: hit.side, moved: false, x, y, priorSelection };
      MUNDA.BoardRenderer.setDrag(this.drag);
      MUNDA.Screens.setHint('DRAG TO THE MATCHING POST');
      MUNDA.audio.select();
    },

    onPointerMove(x, y) {
      if (this.phase !== 'playing') return;
      // hover highlight for non-drag
      if (!this.drag) {
        MUNDA.BoardRenderer.setHover(x, y);
        return;
      }
      const dx = x - this.drag.x, dy = y - this.drag.y;
      if (Math.hypot(dx, dy) > 6) this.drag.moved = true;
      const fromX = Number.isFinite(this.drag.lastX) ? this.drag.lastX : this.drag.x;
      const fromY = Number.isFinite(this.drag.lastY) ? this.drag.lastY : this.drag.y;
      const virus = MUNDA.BoardRenderer.hitTestVirusSegment(fromX, fromY, x, y);
      this.drag.lastX = x; this.drag.lastY = y;
      MUNDA.BoardRenderer.setDrag(this.drag);
      if (virus) this.virusFailure(virus);
    },

    onPointerUp(x, y) {
      if (this.phase !== 'playing') { this.drag = null; MUNDA.BoardRenderer.setDrag(null); return; }
      const src = this.drag;
      if (!src) return;
      this.drag = null;
      MUNDA.BoardRenderer.setDrag(null);
      MUNDA.BoardRenderer.setHover(-1, -1);

      const hit = this.hitTest(x, y);

      if (src.moved) {
        // dragged: connect if released on a terminal, else cancel (no penalty)
        if (hit && hit.side !== src.side) this.attempt(src.wire, hit.wire);
        else this.clearSelection();
        return;
      }

      // plain click (tap): use armed selection logic
      const prior = src.priorSelection;
      if (!prior) {
        MUNDA.Screens.setHint('SOURCE SELECTED — CHOOSE A RIGHT POST');
        return;
      }
      if (prior.wire === src.wire && prior.side === src.side) {
        this.clearSelection();           // tap same terminal again → deselect
        return;
      }
      if (prior.side === src.side) {
        MUNDA.Screens.setHint('SOURCE UPDATED — CHOOSE A RIGHT POST');
        return;
      }
      // opposite rail → attempt
      this.attempt(prior.wire, src.wire);
    },

    selectByNumber(number) {
      if (this.phase !== 'playing' || !this.puzzle) return false;
      const index = this.puzzle.wires.findIndex((wire) => wire.label === number && !wire.connected);
      if (index < 0) return false;
      this.selection = { wire: index, side: 'left' };
      MUNDA.BoardRenderer.setSelection(this.selection);
      const wire = this.puzzle.wires[index];
      MUNDA.Screens.setHint(`${number} · ${wire.name.toUpperCase()} SELECTED — CHOOSE A RIGHT POST`);
      MUNDA.audio.select();
      return true;
    },

    attempt(fromWire, toWire) {
      if (fromWire === toWire) {
        this.connectWire(fromWire);
      } else {
        this.failure(fromWire, toWire);
      }
    },

    connectWire(index) {
      const w = this.puzzle.wires[index];
      if (!w || w.connected) return;
      w.connected = true;
      this.connected++;
      this.correctConnections++;

      const base = 100;
      const gained = Math.round(base * this.multiplier);
      this.score += gained;

      MUNDA.audio.connect();
      MUNDA.BoardRenderer.animateConnect(index);
      MUNDA.StripRenderer.brighten(this.connected, this.puzzle.count);
      MUNDA.Screens.toast(`CONNECTION ${this.connected}/${this.puzzle.count}  +${U.fmt(gained)}`, true);
      MUNDA.Screens.updateHud(this);
      this.clearSelection();

      if (this.connected === this.puzzle.count) {
        setTimeout(() => this.completeLevel(), 420);
      }
    },

    updateMultiplier() {
      // streak counts consecutive levels completed; multiplier scales from it
      this.multiplier = 1 + Math.min(10, this.streak) * 0.25;
    },

    clearSelection() {
      this.selection = null;
      MUNDA.BoardRenderer.setSelection(null);
      if (this.phase === 'playing') MUNDA.Screens.setHint('SELECT A TERMINAL');
    },

    completeLevel() {
      if (this.phase !== 'playing') return;
      this.phase = 'complete';

      const elapsed = (performance.now() - this.startTime) / 1000;
      const params = this.params;

      // level completion bonus
      const levelBonus = 500;
      // perfect bonus (reaching completion means zero errors)
      const perfectBonus = 250;
      // speed bonus — scaled, never negative
      const speedBonus = Math.round(Math.max(0, (params.idealSeconds - elapsed) * 14));

      let total = levelBonus + perfectBonus + speedBonus;
      this.score += total;
      this.streak = this.streak + 1;
      this.updateMultiplier();

      // progress tracking
      const p = MUNDA.state.progress;
      if (this.mode === 'production') {
        p.highestLevel = Math.max(p.highestLevel, this.level);
        p.bestScore = Math.max(p.bestScore, this.score);
        p.runsCompleted++;
      } else {
        p.endlessBest = Math.max(p.endlessBest, this.score);
        p.endlessLongest = Math.max(p.endlessLongest, this.level);
        p.runsCompleted++;
      }
      p.totalConnections += this.puzzle.count;
      MUNDA.storage.saveProgress(p);

      MUNDA.audio.complete();
      MUNDA.BoardRenderer.completeAnimation(() => {
        if (this.phase !== 'complete') return;   // guard: user may have navigated away
        MUNDA.StripRenderer.illuminate(true);
        MUNDA.Screens.showQC({
          mode: this.mode,
          level: this.level,
          connections: `${this.connected}/${this.puzzle.count}`,
          errors: 0,
          score: this.score,
          levelBonus, perfectBonus, speedBonus,
          streak: this.streak,
          multiplier: this.multiplier,
          elapsed,
        });
      });
    },

    nextLevel() {
      this.level++;
      this.startLevel();
      MUNDA.audio.click();
    },

    // ---- failure ----
    failure(fromWire, toWire) {
      if (this.phase !== 'playing') return;
      this.phase = 'failed';
      this.mistakes++;
      MUNDA.state.progress.totalMistakes++;
      MUNDA.storage.saveProgress(MUNDA.state.progress);

      // mark the two terminals as the error
      MUNDA.BoardRenderer.failureSequence(fromWire, toWire, () => {
        if (this.phase !== 'failed') return;      // guard: user may have navigated away
        MUNDA.StripRenderer.illuminate(false);
        MUNDA.audio.fail();
        MUNDA.Screens.showFailure({
          mode: this.mode,
          level: this.level,
          score: this.score,
          streak: this.streak,
          mistakes: this.mistakes,
          best: this.mode === 'production' ? MUNDA.state.progress.bestScore : MUNDA.state.progress.endlessBest,
        });
      });
    },

    virusFailure(hazard) {
      if (this.phase !== 'playing') return;
      this.phase = 'failed';
      this.mistakes++;
      MUNDA.state.progress.totalMistakes++;
      MUNDA.storage.saveProgress(MUNDA.state.progress);
      this.drag = null;
      this.selection = null;
      MUNDA.BoardRenderer.setDrag(null);
      MUNDA.BoardRenderer.setSelection(null);
      MUNDA.Screens.setHint('BIO-CONTAMINATION DETECTED', true);
      MUNDA.BoardRenderer.virusFailureSequence(hazard, () => {
        if (this.phase !== 'failed') return;
        MUNDA.StripRenderer.illuminate(false);
        MUNDA.audio.fail();
        MUNDA.Screens.showFailure({
          mode: this.mode,
          level: this.level,
          score: this.score,
          streak: this.streak,
          mistakes: this.mistakes,
          reason: 'virus',
          best: this.mode === 'production' ? MUNDA.state.progress.bestScore : MUNDA.state.progress.endlessBest,
        });
      });
    },

    // retry after failure
    restartRun() {
      this.score = 0;
      this.streak = 0;
      this.multiplier = 1;
      this.level = 1;
      this.correctConnections = 0;
      this.startLevel();
      MUNDA.Screens.hideModal();
      MUNDA.audio.click();
    },

    pause(toggle) {
      if (this.phase === 'complete' || this.phase === 'failed') return;
      if (toggle) {
        this.phase = 'paused';
        MUNDA.Screens.showPause();
      } else {
        this.phase = 'playing';
        MUNDA.Screens.hidePause();
      }
    },
  };

  MUNDA.game = Game;

})(typeof window !== 'undefined' ? window : this);
