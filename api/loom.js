'use strict';
const { handleLoomRequest } = require('../lib/loom-core');
const buckets = new Map();
module.exports = async function handler(req, res) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || now - bucket.started > 600000) buckets.set(ip, { started: now, count: 1 });
  else if (++bucket.count > 20) return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  const output = await handleLoomRequest({ method: req.method, headers: req.headers, body: req.body });
  Object.entries(output.headers).forEach(([key, value]) => res.setHeader(key, value));
  return res.status(output.status).json(output.body);
};
