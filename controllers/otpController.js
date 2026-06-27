const dns        = require('dns').promises;
const tokens     = require('../services/tokenService');
const otpService = require('../services/otpService');
const Outlet     = require('../models/Outlets');
const Submission = require('../models/Submission');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Check the email's domain can actually receive mail (has MX records).
// Catches fake/typo'd domains like "gmfdf.com" or "gmial.com" before we
// waste a send. Does NOT prove the mailbox exists — the OTP step does that.
async function domainCanReceiveMail(email) {
  const domain = email.split('@')[1];
  try {
    const mx = await dns.resolveMx(domain);
    return Array.isArray(mx) && mx.length > 0;
  } catch (e) {
    return false; // ENOTFOUND / ENODATA → no mail for this domain
  }
}

// Step 1: user submitted the form → email them a code.
async function request(req, res) {
  try {
    const { ref, email } = req.body;

    if (!tokens.verify(ref)) {
      return res.status(400).json({ success: false, error: 'Invalid or missing token.' });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ success: false, error: 'A valid email is required.' });
    }

    const normEmail = email.trim().toLowerCase();
    if (!(await domainCanReceiveMail(normEmail))) {
      return res.status(400).json({
        success: false,
        error: "This email's domain can't receive mail — please check the address.",
      });
    }

    await otpService.requestOtp(normEmail, ref);
    res.json({ success: true });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
}

// Step 2: user entered the code → verify it, then save the submission.
async function verify(req, res) {
  try {
    const { ref, email, otp, name, age } = req.body;

    const outletId = tokens.verify(ref);
    if (!outletId) {
      return res.status(400).json({ success: false, error: 'Invalid or missing token.' });
    }
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and code are required.' });
    }

    const normEmail = email.trim().toLowerCase();
    const ok = await otpService.verifyOtp(normEmail, ref, String(otp).trim());
    if (!ok) {
      return res.status(400).json({ success: false, error: 'Invalid or expired code.' });
    }

    // Outlet id comes from the verified token, not from client input.
    const outlet = await Outlet.findOne({ outlet_id: outletId }, { outlet_id: 1, outlet_name: 1 });
    if (!outlet) {
      return res.status(404).json({ success: false, error: 'Outlet not found.' });
    }

    const submission = await Submission.create({
      outlet_id:      outlet.outlet_id,
      outlet_name:    outlet.outlet_name,
      name:           name ? String(name).trim() : undefined,
      email:          normEmail,
      age:            age != null && age !== '' ? Number(age) : undefined,
      email_verified: true,
    });

    res.json({ success: true, submission });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { request, verify };
