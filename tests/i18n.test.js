const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function load(file) {
  const context = { console, Math, URLSearchParams, performance: { now: () => 0 } };
  context.window = context; context.globalThis = context; context.MUNDA = {};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'game', 'js', file), 'utf8'), context, { filename: file });
  return context.MUNDA;
}

test('i18n exposes the four primary locales plus an Other group', () => {
  const M = load('core/I18n.js');
  const codes = M.LOCALES.map((l) => l.code);
  assert.equal(JSON.stringify(codes), JSON.stringify(['en', 'de', 'sq', 'fr']));
  assert.ok(M.OTHER_LOCALES.length >= 3);
  // flags present on every tab
  for (const l of M.LOCALES) assert.ok(typeof l.flag === 'string' && l.flag.length > 0);
});

test('i18n default language is English', () => {
  const M = load('core/I18n.js');
  M.state = { settings: {} };
  assert.equal(M.i18n.current(), 'en');
  assert.equal(M.t('menu.nav.settings'), 'SETTINGS');
});

test('i18n translates the main surfaces per language and falls back to English', () => {
  const M = load('core/I18n.js');
  // German
  M.state = { settings: { language: 'de' } };
  assert.equal(M.t('menu.nav.settings'), 'EINSTELLUNGEN');
  assert.equal(M.t('hint.select'), 'WÄHLE EINEN ANSCHLUSS');
  // Albanian
  M.state = { settings: { language: 'sq' } };
  assert.equal(M.t('menu.nav.settings'), 'CILËSIMET');
  // French
  M.state = { settings: { language: 'fr' } };
  assert.equal(M.t('menu.nav.settings'), 'PARAMÈTRES');
  // unknown locale falls back to English key
  M.state = { settings: { language: 'xx' } };
  assert.equal(M.t('menu.nav.settings'), 'SETTINGS');
  // missing key returns the key itself
  assert.equal(M.t('no.such.key'), 'no.such.key');
});

test('i18n interpolates variables into translated strings', () => {
  const M = load('core/I18n.js');
  M.state = { settings: { language: 'en' } };
  assert.equal(M.t('toast.circuit', { a: 2, b: 3, q: 88, p: '1,240' }), 'CIRCUIT 2/3 · ROUTING 88% · +1,240');
  M.state = { settings: { language: 'de' } };
  assert.equal(M.t('hud.streak', { n: 4 }), 'SERIE ×4');
});

test('i18n setLanguage persists and returns false for unknown codes', () => {
  const M = load('core/I18n.js');
  let saved = null;
  M.storage = { saveSettings(s) { saved = s; } };
  M.state = { settings: {} };
  assert.equal(M.i18n.setLanguage('fr'), true);
  assert.equal(M.state.settings.language, 'fr');
  assert.equal(saved.language, 'fr');
  assert.equal(M.i18n.setLanguage('xx'), false);
  assert.equal(M.state.settings.language, 'fr');
});

test('i18n registry resolves primary and other locale info', () => {
  const M = load('core/I18n.js');
  assert.equal(M.i18n.localeInfo('en').name, 'English');
  assert.equal(M.i18n.localeInfo('fr').name, 'Français');
  assert.equal(M.i18n.localeInfo('es').name, 'Español');
  assert.equal(M.i18n.isOther('es'), true);
  assert.equal(M.i18n.isOther('en'), false);
});
