const crypto = require('crypto');

const MAX_AGE = 60 * 60 * 24 * 30;

const sign = (text, secret) => crypto.createHmac('sha256', secret).update(text).digest('base64url');

function safeEqual(a, b) {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}

function roleForPassword(password, env = process.env) {
  if (!password || !env.VIEW_PASSWORD || !env.EDIT_PASSWORD) return null;
  if (safeEqual(password, env.EDIT_PASSWORD)) return 'edit';
  if (safeEqual(password, env.VIEW_PASSWORD)) return 'view';
  return null;
}

function createToken(role, secret, now = Date.now()) {
  const body = `${role}.${Math.floor(now / 1000) + MAX_AGE}`;
  return `${body}.${sign(body, secret)}`;
}

function readToken(token, secret, now = Date.now()) {
  if (!token || !secret) return null;
  const [role, expires, signature] = token.split('.');
  if (!signature || !safeEqual(signature, sign(`${role}.${expires}`, secret))) return null;
  if (Number(expires) * 1000 < now) return null;
  return role === 'edit' || role === 'view' ? role : null;
}

function getRole(req) {
  const token = /(?:^|;\s*)session=([^;]+)/.exec(req.headers.cookie || '')?.[1];
  return readToken(token, process.env.SESSION_SECRET);
}

function sessionCookie(token, maxAge = MAX_AGE) {
  const secure = process.env.NODE_ENV === 'development' ? '' : ' Secure;';
  return `session=${token}; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=${maxAge}`;
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

module.exports = { roleForPassword, createToken, readToken, getRole, sessionCookie, sendJson };
