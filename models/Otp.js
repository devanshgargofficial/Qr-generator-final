const mongoose = require('mongoose');

// Short-lived one-time codes. We store only a HASH of the code, never the code itself.
const otpSchema = new mongoose.Schema({
  email:     { type: String, required: true, index: true },
  ref:       { type: String, required: true }, // ties the code to a specific outlet token
  codeHash:  { type: String, required: true },
  attempts:  { type: Number, default: 0 },      // wrong-guess counter (brute-force guard)
  expiresAt: { type: Date,   required: true },
}, {
  collection: 'otps',
  timestamps: true,
});

// TTL index: MongoDB auto-deletes the document once expiresAt passes.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Otp', otpSchema);
