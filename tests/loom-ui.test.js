const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'js', 'main.js'), 'utf8');

test('top header exposes an accessible Ask Loom panel', () => {
  assert.match(html, /id="loom-toggle"[^>]*aria-controls="loom-panel"/);
  assert.match(html, />ASK LOOM</i);
  assert.match(html, /id="loom-panel"/);
  assert.match(html, /id="loom-messages"[^>]*aria-live="polite"/);
});

test('offers example general and MUNDA questions', () => {
  ['What is textile lighting?', 'How does MUNDA support automotive interiors?', 'What makes flexible LED textiles useful?', 'Explain LEDs in simple terms.'].forEach((q) => assert.ok(html.includes(q), q));
});

test('browser submits only to same-origin private endpoint and contains no Groq key', () => {
  assert.match(script, /fetch\(['"]\/api\/loom['"]/);
  assert.doesNotMatch(html + script, /gsk_[A-Za-z0-9]+/);
});

test('MUNDA logo appears in header and return-to-main control', () => {
  assert.match(html, /class="nav-logo brand-mask"/);
  assert.match(html, /class="game-overlay-logo brand-mask"/);
  assert.match(html, /RETURN TO MAIN/);
});
