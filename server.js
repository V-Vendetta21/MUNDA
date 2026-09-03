'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { handleLoomRequest } = require('./lib/loom-core');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm', '.ico': 'image/x-icon',
};

function loadLocalEnv(root) {
  const file = path.join(root, '.env.local');
  try {
    return Object.fromEntries(fs.readFileSync(file, 'utf8').split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith('#') && line.includes('=')).map((line) => {
      const at = line.indexOf('=');
      return [line.slice(0, at).trim(), line.slice(at + 1).trim().replace(/^(['"])(.*)\1$/, '$2')];
    }));
  } catch { return {}; }
}

function sendJson(res, status, body, headers = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(payload), ...headers });
  res.end(payload);
}

function createLoomServer(options = {}) {
  const root = path.resolve(options.root || __dirname);
  const env = options.env || { ...process.env, ...loadLocalEnv(root) };
  return http.createServer(async (req, res) => {
    const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (requestUrl.pathname === '/api/loom') {
      if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed.' }, { allow: 'POST' });
      let raw = '';
      for await (const chunk of req) {
        raw += chunk;
        if (raw.length > 20_000) return sendJson(res, 413, { error: 'Request is too large.' });
      }
      const output = await handleLoomRequest({ method: req.method, headers: req.headers, body: raw }, { env });
      return sendJson(res, output.status, output.body, output.headers);
    }

    if (!['GET', 'HEAD'].includes(req.method)) return sendJson(res, 405, { error: 'Method not allowed.' });
    let relative;
    try { relative = decodeURIComponent(requestUrl.pathname); } catch { return sendJson(res, 400, { error: 'Invalid path.' }); }
    if (relative === '/index' || relative === '/.index') relative = '/index.html';
    if (relative.endsWith('/')) relative += 'index.html';
    const file = path.resolve(root, '.' + relative);
    if (file !== root && !file.startsWith(root + path.sep)) return sendJson(res, 403, { error: 'Forbidden.' });
    fs.stat(file, (error, stat) => {
      if (error || !stat.isFile()) return sendJson(res, 404, { error: 'Not found.' });
      res.writeHead(200, { 'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-cache' });
      if (req.method === 'HEAD') return res.end();
      fs.createReadStream(file).pipe(res);
    });
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 8123);
  createLoomServer().listen(port, '127.0.0.1', () => {
    console.log(`MUNDA + Loom running at http://127.0.0.1:${port}/`);
    if (!process.env.GROQ_API_KEY && !loadLocalEnv(__dirname).GROQ_API_KEY) console.log('Loom needs GROQ_API_KEY in .env.local or the process environment.');
  });
}

module.exports = { createLoomServer, loadLocalEnv };
