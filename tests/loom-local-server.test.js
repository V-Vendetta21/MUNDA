const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { createLoomServer } = require('../server');

test('local server serves the site and handles Loom requests as JSON', async (t) => {
  const server = createLoomServer({ root: path.join(__dirname, '..'), env: {} });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const port = server.address().port;

  const page = await fetch(`http://127.0.0.1:${port}/`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /id="loom-panel"/);

  const response = await fetch(`http://127.0.0.1:${port}/api/loom`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message: 'What is MUNDA?' }),
  });
  assert.equal(response.status, 503);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await response.json(), { error: 'Loom is not configured on this server.' });
});
