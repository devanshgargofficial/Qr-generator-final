const crypto = require('crypto');
const Otp    = require('../models/Otp');
const mail   = require('./mailService');

const SECRET       = process.env.QR_SECRET || 'dev-insecure-qr-secret-change-me';
const TTL_MS       = 5 * 60 * 1000;  // code lifetime: 5 minutes
const RESEND_MS    = 30 * 1000;      // min gap between sends to the same email+ref
const MAX_ATTEMPTS = 5;              // wrong guesses before the code is burned

function hash(email, ref, code) {
  return crypto.createHmac('sha256', SECRET).update(`${email}:${ref}:${code}`).digest('hex');
}

// Create a code for (email, ref), email it, and store only its hash.
async function requestOtp(email, ref) {
  // Rate-limit: reject if a fresh code already exists for this email+ref.
  const existing = await Otp.findOne({ email, ref });
  if (existing) {
    const age = Date.now() - existing.createdAt.getTime();
    if (age < RESEND_MS) {
      const wait = Math.ceil((RESEND_MS - age) / 1000);
      const err = new Error(`Please wait ${wait}s before requesting another code.`);
      err.statusCode = 429;
      throw err;
    }
    await Otp.deleteOne({ _id: existing._id }); // replace the old one
  }

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');

  // Send first — if the email fails we don't want a stale code lingering.
  await mail.sendOtpEmail(email, code);

  await Otp.create({
    email,
    ref,
    codeHash:  hash(email, ref, code),
    expiresAt: new Date(Date.now() + TTL_MS),
  });
}

// Returns true if the code is valid; consumes (deletes) it on success.
async function verifyOtp(email, ref, code) {
  const doc = await Otp.findOne({ email, ref });
  if (!doc) return false;                       // none issued, or already expired/used

  if (doc.attempts >= MAX_ATTEMPTS) {
    await Otp.deleteOne({ _id: doc._id });       // too many tries — burn it
    return false;
  }
  if (doc.expiresAt.getTime() < Date.now()) {
    await Otp.deleteOne({ _id: doc._id });
    return false;
  }

  const expected = hash(email, ref, code);
  const a = Buffer.from(doc.codeHash);
  const b = Buffer.from(expected);
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!ok) {
    await Otp.updateOne({ _id: doc._id }, { $inc: { attempts: 1 } });
    return false;
  }

  await Otp.deleteOne({ _id: doc._id });         // one-time use
  return true;
}

module.exports = { requestOtp, verifyOtp };
