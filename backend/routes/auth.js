const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db/database');
const { JWT_SECRET } = require('../middleware/auth');
const { sendOTPEmail } = require('../email');

// ── In-memory OTP store ──────────────────────────────────────────────────────
// { [email]: { otp, username, userId, expiry } }
const otpStore = new Map();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password)
    return res.status(400).json({ error: 'Email, username and password are required' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)'
    ).run(email.toLowerCase().trim(), username.trim(), hash);

    const token = jwt.sign(
      { id: result.lastInsertRowid, email: email.toLowerCase(), username: username.trim() },
      JWT_SECRET, { expiresIn: '7d' }
    );
    res.status(201).json({
      user: { id: result.lastInsertRowid, email: email.toLowerCase(), username: username.trim() },
      token
    });
  } catch (err) {
    if (err.message?.includes('UNIQUE')) {
      if (err.message.includes('email')) return res.status(409).json({ error: 'Email already registered' });
      return res.status(409).json({ error: 'Username already taken' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user || !bcrypt.compareSync(password, user.password_hash))
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      JWT_SECRET, { expiresIn: '7d' }
    );
    res.json({
      user: { id: user.id, email: user.email, username: user.username, avatar: user.avatar },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, email, username, avatar, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// ── FORGOT PASSWORD / OTP LOGIN ───────────────────────────────────────────────

// POST /api/auth/send-otp
// Body: { email }
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = db.prepare('SELECT id, email, username FROM users WHERE email = ?')
    .get(email.toLowerCase().trim());

  if (!user) {
    // Don't reveal if email exists — return generic success msg
    return res.json({ message: 'If that email is registered, a code has been sent.' });
  }

  const otp = generateOTP();
  const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(user.email, { otp, username: user.username, userId: user.id, expiry });

  try {
    await sendOTPEmail(user.email, otp, user.username);
    res.json({ message: 'OTP sent to your email. Check your inbox (and spam folder).' });
  } catch (err) {
    console.error('Email send failed:', err.message);
    otpStore.delete(user.email); // Rollback so user can retry
    res.status(500).json({ error: 'Failed to send email. Please try again.' });
  }
});

// POST /api/auth/verify-otp
// Body: { email, otp }
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

  const record = otpStore.get(email.toLowerCase().trim());
  if (!record) return res.status(400).json({ error: 'No OTP requested for this email. Try again.' });
  if (Date.now() > record.expiry) {
    otpStore.delete(email);
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }
  if (record.otp !== otp.toString().trim()) {
    return res.status(400).json({ error: 'Incorrect code. Please try again.' });
  }

  // OTP is valid — issue a JWT and clean up
  otpStore.delete(email);
  const user = db.prepare('SELECT id, email, username, avatar FROM users WHERE id = ?').get(record.userId);
  const token = jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    JWT_SECRET, { expiresIn: '7d' }
  );
  res.json({
    user: { id: user.id, email: user.email, username: user.username, avatar: user.avatar },
    token
  });
});

module.exports = router;
