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

test('circuit trace easy mode limits to simple shapes', () => {
  const M = load('game/CircuitTrace.js');
  for (let seed = 1; seed < 50; seed++) {
    const t = M.CircuitTrace.generate(seed, true);
    assert.ok(['loop', 'square', 'triangle', 'wave'].includes(t.shape), `seed ${seed} gave ${t.shape}`);
  }
});

test('HSL conversion utilities round-trip hex colors', () => {
  const M = load(['core/Config.js', 'core/Utils.js', 'game/CircuitTrace.js']);
  const U = M;
  const samples = ['#e6194b', '#3b78ff', '#f2f4f8', '#12305f', '#ffffff', '#000000'];
  for (const hex of samples) {
    const hsl = U.hexToHsl(hex);
    assert.equal(U.hslToHex(hsl.h, hsl.s, hsl.l), hex, `${hex} should round-trip`);
  }
  // adjustHsl brightens or darkens in a bounded way
  const brighter = U.adjustHsl('#808080', 0, 30);
  const darker = U.adjustHsl('#808080', 0, -30);
  assert.ok(U.luminance(brighter) > U.luminance('#808080'));
  assert.ok(U.luminance(darker) < U.luminance('#808080'));
});

test('randomPalette produces a distinct colour for every wire', () => {
  const M = load(['core/Config.js', 'core/Utils.js', 'core/Palette.js']);
  // deterministic fake RNG
  let seed = 42;
  const fakeRandom = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const palette = M.randomPalette(fakeRandom);
  const ids = M.WIRE_CATALOG.map((w) => w.id);
  for (const id of ids) {
    assert.ok(palette[id], `wire ${id} should have a palette entry`);
    assert.match(palette[id].base, /^#[0-9a-f]{6}$/i);
    assert.match(palette[id].dark, /^#[0-9a-f]{6}$/i);
    assert.match(palette[id].glow, /^#[0-9a-f]{6}$/i);
  }
  // golden-angle spacing should keep hues distinct (no two identical bases)
  const bases = Object.values(palette).map((p) => p.base);
  assert.equal(new Set(bases).size, bases.length, 'palette colours should be distinct');
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
  assert.equal(M.CircuitTrace.accuracy(0.02), 10); // tiny trace still floors at 10
  assert.equal(M.CircuitTrace.accuracy(0.98), 98);
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
