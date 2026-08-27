'use strict';
/* Vercel serverless function for the Loom AI endpoint.
   Static files (index.html, css/, js/, game/, assets/) are served
   automatically by Vercel from the repo root. This function handles
   only POST /api/loom, reusing the shared handleLoomRequest core.
   Env vars (GROQ_API_KEY, GROQ_MODEL) come from the Vercel dashboard. */
const { handleLoomRequest } = require('../lib/loom-core');

module.exports = async function loomHandler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('allow', 'POST');
    res.end(JSON.stringify({ error: 'Method not allowed.' }));
    return;
  }

  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 20_000) {
      res.statusCode = 413;
      res.end(JSON.stringify({ error: 'Request is too large.' }));
      return;
    }
  }

  // Default to a working model on this account; allow dashboard override.
  const env = { ...process.env, GROQ_MODEL: process.env.GROQ_MODEL || 'openai/gpt-oss-120b' };
  const output = await handleLoomRequest({ method: req.method, headers: req.headers, body: raw }, { env });

  res.statusCode = output.status;
  for (const [key, value] of Object.entries(output.headers || {})) res.setHeader(key, value);
  res.end(JSON.stringify(output.body));
};
