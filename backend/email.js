const nodemailer = require('nodemailer');

// Reusable transporter — reads from env vars set in Railway
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  EMAIL_USER / EMAIL_PASS not set — OTP emails disabled');
    return null;
  }
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,   // Gmail App Password (not your real password)
    },
  });
  return transporter;
}

async function sendOTPEmail(toEmail, otp, username) {
  const t = getTransporter();
  if (!t) throw new Error('Email service not configured. Please contact support.');

  const html = `
  <div style="font-family:'Segoe UI',sans-serif;background:#06060f;padding:40px;max-width:480px;margin:0 auto;border-radius:16px;color:#eeeeff">
    <div style="text-align:center;margin-bottom:32px">
      <span style="font-size:2rem;font-weight:900;background:linear-gradient(135deg,#e052a0,#f15c41);-webkit-background-clip:text;-webkit-text-fill-color:transparent">🐉 RyuStream</span>
    </div>
    <h2 style="font-size:1.4rem;margin-bottom:8px;color:#fff">Your login code</h2>
    <p style="color:#9898b8;margin-bottom:28px">Hi ${username || 'there'}, use the code below to sign in. It expires in <strong style="color:#e052a0">10 minutes</strong>.</p>
    <div style="background:#1e1e32;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:28px;text-align:center;margin-bottom:28px">
      <span style="font-size:2.8rem;font-weight:900;letter-spacing:12px;color:#e052a0">${otp}</span>
    </div>
    <p style="color:#4a4a6a;font-size:0.8rem;text-align:center">If you didn't request this code, you can safely ignore this email.</p>
  </div>`;

  await t.sendMail({
    from: `"RyuStream" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${otp} — Your RyuStream login code`,
    html,
    text: `Your RyuStream OTP is: ${otp}. It expires in 10 minutes.`,
  });
}

module.exports = { sendOTPEmail };
