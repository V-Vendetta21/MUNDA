const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function loadRenderer() {
  const MUNDA = {
    clamp: (v, lo, hi) => Math.max(lo, Math.min(hi, v)),
    dist: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
    rgba: () => '', mix: (a) => a, rand: (a, b) => (a + b) / 2,
    easeInOut: (t) => t, accentColor: () => '#d8d8d4',
  };
  const context = { window: { MUNDA }, console, setTimeout, clearTimeout };
  vm.createContext(context);
  const source = fs.readFileSync(path.join(__dirname, '..', 'game', 'js', 'render', 'BoardRenderer.js'), 'utf8');
  vm.runInContext(source, context);
  return context.window.MUNDA.BoardRenderer;
}

function testWireTipSegmentHitsVirus() {
  const renderer = loadRenderer();
  renderer.cssW = 1000;
  renderer.cssH = 600;
  renderer.hazards = [{ id: 'v1', nx: 0.5, ny: 0.5, r: 11 }];
  const hit = renderer.hitTestVirusSegment(120, 300, 880, 300);
  assert.equal(hit.id, 'v1');
}

function testWireTipSegmentMissesVirus() {
  const renderer = loadRenderer();
  renderer.cssW = 1000;
  renderer.cssH = 600;
  renderer.hazards = [{ id: 'v1', nx: 0.5, ny: 0.5, r: 11 }];
  assert.equal(renderer.hitTestVirusSegment(120, 180, 880, 180), null);
}

testWireTipSegmentHitsVirus();
testWireTipSegmentMissesVirus();
console.log('virus hazard geometry: ok');
