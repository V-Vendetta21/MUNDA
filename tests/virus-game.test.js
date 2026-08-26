const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const calls = { sequence: 0, failureModal: 0 };
const MUNDA = {
  BoardRenderer: {
    setDrag() {},
    setSelection() {},
    setHover() {},
    hitTestVirusSegment() { return { id: 'virus-0', nx: 0.5, ny: 0.5, r: 10 }; },
    virusFailureSequence(hazard, cb) { calls.sequence++; cb(); },
  },
  Screens: {
    setHint() {},
    setStripStatus() {},
    updateHud() {},
    showFailure(data) { calls.failureModal++; calls.reason = data.reason; },
  },
  StripRenderer: { illuminate() {} },
  audio: { fail() {}, select() {} },
  state: { progress: { totalMistakes: 0, bestScore: 0, endlessBest: 0 } },
  storage: { saveProgress() {} },
  fmt: String,
};
const context = { window: { MUNDA }, performance: { now: () => 0 }, setTimeout: (fn) => fn(), clearTimeout };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'game', 'js', 'game', 'Game.js'), 'utf8'), context);
const game = context.window.MUNDA.game;
game.mode = 'production';
game.phase = 'playing';
game.level = 1;
game.score = 0;
game.streak = 0;
game.mistakes = 0;
game.puzzle = { count: 3, wires: [{ connected: false }] };
game.drag = { wire: 0, side: 'left', x: 0, y: 0, lastX: 0, lastY: 0, moved: false };

game.onPointerMove(20, 0);

assert.equal(game.phase, 'failed');
assert.equal(calls.sequence, 1);
assert.equal(calls.failureModal, 1);
assert.equal(calls.reason, 'virus');
console.log('virus game-over flow: ok');
