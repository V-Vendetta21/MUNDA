const test = require('node:test');
const assert = require('node:assert/strict');
const { handleLoomRequest } = require('../lib/loom-core');

const request = { method: 'POST', headers: { host: 'munda.test', origin: 'https://munda.test' }, body: { message: 'What is textile lighting?', history: [] } };

test('requires a private server-side Groq key', async () => {
  let called = false;
  const result = await handleLoomRequest(request, { env: {}, fetchImpl: async () => { called = true; } });
  assert.equal(result.status, 503);
  assert.equal(called, false);
});

test('proxies sanitized chat through Groq without returning the key', async () => {
  let outbound;
  const fetchImpl = async (url, options) => {
    outbound = { url, options };
    return { ok: true, json: async () => ({ choices: [{ message: { content: 'Flexible light integrated into textile.' } }] }) };
  };
  const result = await handleLoomRequest(request, { env: { GROQ_API_KEY: 'private-test-key' }, fetchImpl });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { reply: 'Flexible light integrated into textile.' });
  assert.equal(outbound.options.headers.Authorization, 'Bearer private-test-key');
  assert.doesNotMatch(JSON.stringify(result), /private-test-key/);
});

test('blocks cross-origin requests', async () => {
  const hostile = { ...request, headers: { host: 'munda.test', origin: 'https://attacker.test' } };
  const result = await handleLoomRequest(hostile, { env: { GROQ_API_KEY: 'x' }, fetchImpl: async () => { throw new Error('not called'); } });
  assert.equal(result.status, 403);
});
