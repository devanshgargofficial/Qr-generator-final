const nodemailer = require('nodemailer');

const GMAIL_USER = process.env.GMAIL_USER;
// Google shows App Passwords with spaces (e.g. "abcd efgh ijkl mnop");
// strip them so either form works.
const GMAIL_APP_PASSWORD = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
const configured = Boolean(GMAIL_USER && GMAIL_APP_PASSWORD);

if (!configured) {
  console.warn('⚠ GMAIL_USER / GMAIL_APP_PASSWORD not set — OTP emails will fail until configured in .env.');
}

// One reusable transporter (Gmail SMTP via app password).
const transporter = configured
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    })
  : null;

async function sendOtpEmail(to, code) {
  if (!transporter) {
    throw new Error('Email is not configured on the server.');
  }
  try {
    await transporter.sendMail({
      from: `"Outlet Verification" <${GMAIL_USER}>`,
      to,
      subject: `Your verification code: ${code}`,
      text: `Your verification code is ${code}. It expires in 5 minutes.`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:420px;margin:auto;padding:24px;">
          <h2 style="margin:0 0 8px;">Verify your email</h2>
          <p style="color:#555;margin:0 0 20px;">Enter this code to complete your submission. It expires in 5 minutes.</p>
          <div style="font-size:34px;font-weight:700;letter-spacing:8px;text-align:center;
            padding:16px;background:#f4f4f7;border-radius:10px;">${code}</div>
          <p style="color:#999;font-size:12px;margin-top:20px;">If you didn't request this, you can ignore this email.</p>
        </div>`,
    });
  } catch (e) {
    // Log the real SMTP error for debugging, but return a clean, retryable message.
    console.error('✉ OTP send failed:', e.message);
    const err = new Error("Couldn't send the verification code. Please try again.");
    err.statusCode = 502;
    throw err;
  }
}

module.exports = { sendOtpEmail, configured };
