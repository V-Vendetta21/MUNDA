const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function load(files) {
  const context = { console, Date, Math, URLSearchParams, performance: { now: () => 0 } };
  context.window = context; context.globalThis = context; context.MUNDA = {};
  vm.createContext(context);
  for (const file of files) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', file), 'utf8'), context, { filename: file });
  return context.MUNDA;
}

test('routing detects true crossings but ignores shared endpoints', () => {
  const M = load(['game/RoutingSystem.js']);
  assert.equal(M.Routing.countCrossings([[{x:0,y:0},{x:10,y:10}],[{x:0,y:10},{x:10,y:0}]]), 1);
  assert.equal(M.Routing.countCrossings([[{x:0,y:0},{x:10,y:10}],[{x:10,y:10},{x:20,y:0}]]), 0);
});

test('routing metrics reward short clean guided routes', () => {
  const M = load(['game/RoutingSystem.js']);
  const clean = M.Routing.measure([{x:0,y:0},{x:100,y:0}], 100, { guidesUsed:1, optionalGuides:1 });
  const messy = M.Routing.measure([{x:0,y:0},{x:20,y:30},{x:40,y:-30},{x:100,y:0}], 100, { guidesUsed:0, optionalGuides:1 });
  assert.ok(clean.quality > messy.quality);
  assert.equal(clean.quality, 100);
});

test('cable physics anchors ends and settles intermediate segments', () => {
  const M = load(['core/CablePhysics.js']);
  const cable = M.CablePhysics.create({x:0,y:0},{x:100,y:0},6);
  cable.points[3].y = 50;
  for (let i=0;i<30;i++) M.CablePhysics.step(cable,{x:0,y:0},{x:100,y:0},16);
  assert.equal(JSON.stringify(cable.points[0]), JSON.stringify({x:0,y:0,px:0,py:0}));
  assert.equal(cable.points.at(-1).x, 100);
  assert.ok(cable.points[3].y < 40);
});

test('scoring returns category ratings and stable grades', () => {
  const M = load(['game/Scoring.js']);
  const excellent = M.Scoring.calculate({ correct:8, mistakes:0, elapsed:12, idealSeconds:20, routeQuality:96, crossings:0, sequenceErrors:0 });
  const poor = M.Scoring.calculate({ correct:4, mistakes:4, elapsed:40, idealSeconds:20, routeQuality:35, crossings:5, sequenceErrors:3 });
  assert.ok(['S+','S'].includes(excellent.grade));
  assert.ok(['C','D'].includes(poor.grade));
  assert.ok(excellent.total > poor.total);
});

test('production mechanics follow the requested stage roadmap', () => {
  const M = load(['game/MechanicManager.js']);
  assert.deepEqual(Array.from(M.Mechanics.forStage(2,'production').active), []);
  assert.ok(M.Mechanics.forStage(8,'production').active.includes('obstacles'));
  assert.ok(M.Mechanics.forStage(10,'production').active.includes('major'));
  assert.ok(M.Mechanics.forStage(19,'production').active.includes('panic'));
  assert.ok(M.Mechanics.forStage(32,'production').active.includes('split'));
  assert.ok(M.Mechanics.forStage(43,'production').active.includes('hidden'));
  assert.ok(M.Mechanics.forStage(50,'production').active.includes('major'));
});

test('endless unfair combinations are guarded', () => {
  const M = load(['game/MechanicManager.js']);
  for (let seed=1; seed<80; seed++) {
    const set = M.Mechanics.forStage(20,'endless',seed);
    assert.equal(set.active.includes('hidden') && set.active.includes('moving') && set.timerSeconds > 0 && set.timerSeconds < 12, false);
  }
});

test('endless and daily mechanic plans expose deterministic challenge modifiers', () => {
  const M = load(['game/MechanicManager.js']);
  const a=M.Mechanics.forStage(18,'endless',20260826);
  const b=M.Mechanics.forStage(18,'endless',20260826);
  assert.ok(Array.isArray(a.modifiers));
  assert.equal(JSON.stringify(a.modifiers),JSON.stringify(b.modifiers));
  assert.ok(M.Mechanics.forStage(18,'daily',20260826).modifiers.length===1);
});

test('daily challenge seed is deterministic by local date', () => {
  const M = load(['game/DailyChallenge.js']);
  const date = new Date(2026,7,26);
  assert.equal(M.Daily.seedFor(date), 20260826);
  assert.deepEqual(M.Daily.create(date), M.Daily.create(date));
});

test('state machine blocks invalid input states', () => {
  const M = load(['core/StateMachine.js']);
  const sm = M.StateMachine.create('MENU');
  assert.equal(sm.canInput(), false);
  sm.transition('INTRO'); sm.transition('PLAYING');
  assert.equal(sm.canInput(), true);
  sm.transition('PAUSED');
  assert.equal(sm.canInput(), false);
  assert.throws(() => sm.transition('SUCCESS'));
});

test('puzzle validator rejects blocked and malformed boards', () => {
  const M = load(['game/RoutingSystem.js','game/PuzzleValidator.js']);
  const valid = { count:1, wires:[{index:0}], left:[{wire:0}], right:[{wire:0}], obstacles:[], guides:[], routes:[[{x:.1,y:.5},{x:.9,y:.5}]] };
  assert.equal(M.PuzzleValidator.validate(valid).valid, true);
  const invalid = {...valid, obstacles:[{x:.4,y:.4,w:.2,h:.2}]};
  assert.equal(M.PuzzleValidator.validate(invalid).valid, false);
});

test('seeded puzzle generation is deterministic and validator-approved', () => {
  const M = load(['core/Config.js','core/Utils.js','core/Palette.js','game/Difficulty.js','game/MechanicManager.js','game/RoutingSystem.js','game/PuzzleValidator.js','game/PuzzleGen.js']);
  M.state = { settings:{colorblind:false}, custom:{wires:null} };
  const params = {...M.difficulty.getParams(12,'production'), seed:12077, mechanics:M.Mechanics.forStage(12,'production',12077)};
  const a = M.puzzleGen.generate(params,M.resolveWires());
  const b = M.puzzleGen.generate(params,M.resolveWires());
  assert.equal(JSON.stringify(a),JSON.stringify(b));
  assert.equal(M.PuzzleValidator.validate(a).valid,true);
});
