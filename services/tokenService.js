const crypto = require('crypto');

// Secret used to sign/verify QR tokens. MUST be set in production (.env).
// The fallback only exists so the app boots in dev — it is NOT secure.
const SECRET = process.env.QR_SECRET || 'dev-insecure-qr-secret-change-me';

if (!process.env.QR_SECRET) {
  console.warn('⚠ QR_SECRET not set — using an insecure dev fallback. Set it in .env.');
}

// Token format:  base64url(outletId) + "." + base64url(HMAC-SHA256(payload))
// The outlet id is encoded but NOT secret; the signature is what makes it
// unforgeable. A client cannot mint a valid token without SECRET.
function sign(outletId) {
  const payload = Buffer.from(String(outletId)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

// Returns the outletId if the token is authentic, otherwise null.
function verify(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;

  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  return Buffer.from(payload, 'base64url').toString('utf8');
}

module.exports = { sign, verify };
