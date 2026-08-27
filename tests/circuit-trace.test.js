const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function load(files) {
  const list = Array.isArray(files) ? files : [files];
  const context = { console, Math, URLSearchParams, performance: { now: () => 0 } };
  context.window = context; context.globalThis = context; context.MUNDA = {};
  vm.createContext(context);
  for (const file of list) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'game', 'js', file), 'utf8'), context, { filename: file });
  }
  return context.MUNDA;
}

test('circuit trace generates a random shape with normalized points', () => {
  const M = load('game/CircuitTrace.js');
  const t = M.CircuitTrace.generate(12077);
  assert.ok(t.points.length > 20);
  for (const p of t.points) {
    assert.ok(p.x >= 0 && p.x <= 1);
    assert.ok(p.y >= 0 && p.y <= 1);
  }
});

test('circuit trace is deterministic per seed', () => {
  const M = load('game/CircuitTrace.js');
  assert.equal(M.CircuitTrace.generate(12077).shape, M.CircuitTrace.generate(12077).shape);
});

test('circuit trace coverage rewards a trace that follows the target', () => {
  const M = load('game/CircuitTrace.js');
  const t = M.CircuitTrace.generate(5);
  const w = 800, h = 600, tol = 20;
  // trace every target point exactly
  const perfect = t.points.map((p) => ({ x: p.x * w, y: p.y * h }));
  const covPerfect = M.CircuitTrace.coverage(perfect, t.points, w, h, tol);
  assert.ok(covPerfect > 0.95);
  // a stray trace far away covers nothing
  const stray = [{ x: 5, y: 5 }];
  assert.equal(M.CircuitTrace.coverage(stray, t.points, w, h, tol), 0);
});

test('circuit trace accuracy clamps to the 10-100 band', () => {
  const M = load('game/CircuitTrace.js');
  assert.equal(M.CircuitTrace.accuracy(1), 100);
  assert.equal(M.CircuitTrace.accuracy(0), 10);
  assert.equal(M.CircuitTrace.accuracy(0.5), 50);
});

test('circuit trace wire delta: worse accuracy adds more wires', () => {
  const M = load('game/CircuitTrace.js');
  assert.equal(M.CircuitTrace.wireDelta(100, 2), 0);
  assert.equal(M.CircuitTrace.wireDelta(10, 2), 2);
  assert.equal(M.CircuitTrace.wireDelta(55, 2), 1);
  assert.ok(M.CircuitTrace.wireDelta(10, 2) >= M.CircuitTrace.wireDelta(100, 2));
});

test('difficulty applyTrace eases the board for high accuracy', () => {
  const M = load(['core/Config.js','core/Utils.js','game/CircuitTrace.js','game/Difficulty.js']);
  const base = M.difficulty.getParams(5, 'production'); // base wires = 7, CAP=9 → maxExtra=2
  const easy = M.difficulty.applyTrace(base, 100);
  const hard = M.difficulty.applyTrace(base, 10);
  assert.ok(easy.wires <= hard.wires);
  assert.equal(easy.traceAccuracy, 100);
  assert.equal(hard.traceAccuracy, 10);
  assert.ok(hard.terminalRadius <= easy.terminalRadius);
});
