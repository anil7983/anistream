/* Login / Register / Forgot Password page */
document.addEventListener('DOMContentLoaded', () => {
  if (auth.isLoggedIn()) { window.location.href = '/'; return; }

  const loginTab = document.getElementById('tab-login');
  const registerTab = document.getElementById('tab-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const otpForm = document.getElementById('otp-form');
  const loginError = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');

  // ── View switching ──────────────────────────────────────────────────────────
  function showLogin() {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.style.display = '';
    registerForm.style.display = 'none';
    otpForm.style.display = 'none';
    loginError.textContent = '';
  }
  function showRegister() {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.style.display = '';
    loginForm.style.display = 'none';
    otpForm.style.display = 'none';
    registerError.textContent = '';
  }
  function showOTP() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    otpForm.style.display = '';
    // Reset to step 1
    document.getElementById('otp-step-email').style.display = '';
    document.getElementById('otp-step-code').style.display = 'none';
    document.getElementById('otp-email-error').textContent = '';
    document.getElementById('otp-code-error').textContent = '';
    document.getElementById('otp-title').textContent = 'Forgot password?';
    document.getElementById('otp-subtitle').textContent = "Enter your registered email and we'll send you a sign-in code.";
    document.getElementById('otp-email').value = '';
    document.getElementById('otp-code').value = '';
  }

  loginTab?.addEventListener('click', showLogin);
  registerTab?.addEventListener('click', showRegister);
  document.getElementById('forgot-pw-btn')?.addEventListener('click', showOTP);
  document.getElementById('otp-back-btn')?.addEventListener('click', showLogin);

  if (new URLSearchParams(location.search).get('mode') === 'register') showRegister();

  // ── Login ───────────────────────────────────────────────────────────────────
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-submit');
    btn.textContent = 'Signing in...'; btn.disabled = true;
    loginError.textContent = '';
    try {
      const { user, token } = await api.login(
        document.getElementById('login-email').value,
        document.getElementById('login-password').value
      );
      auth.save(token, user);
      const redirect = localStorage.getItem('ani_redirect') || '/';
      localStorage.removeItem('ani_redirect');
      window.location.href = redirect;
    } catch (err) {
      loginError.textContent = err.message;
    } finally { btn.textContent = 'Sign In'; btn.disabled = false; }
  });

  // ── Register ────────────────────────────────────────────────────────────────
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = registerForm.querySelector('button[type=submit]');
    btn.textContent = 'Creating account...'; btn.disabled = true;
    registerError.textContent = '';
    const pw = document.getElementById('reg-password').value;
    const pw2 = document.getElementById('reg-password2').value;
    if (pw !== pw2) { registerError.textContent = 'Passwords do not match'; btn.textContent = 'Create Account'; btn.disabled = false; return; }
    try {
      const { user, token } = await api.register(
        document.getElementById('reg-email').value,
        document.getElementById('reg-username').value,
        pw
      );
      auth.save(token, user);
      window.location.href = '/';
    } catch (err) {
      registerError.textContent = err.message;
    } finally { btn.textContent = 'Create Account'; btn.disabled = false; }
  });

  // ── OTP Flow ────────────────────────────────────────────────────────────────
  let otpEmail = '';

  async function sendOTP() {
    const emailInput = document.getElementById('otp-email');
    const errEl = document.getElementById('otp-email-error');
    const btn = document.getElementById('otp-send-btn');
    const email = emailInput.value.trim();
    if (!email) { errEl.textContent = 'Please enter your email'; return; }
    errEl.textContent = '';
    btn.textContent = 'Sending...'; btn.disabled = true;
    try {
      await api.sendOTP(email);
      otpEmail = email;
      // Move to step 2
      document.getElementById('otp-step-email').style.display = 'none';
      document.getElementById('otp-step-code').style.display = '';
      document.getElementById('otp-title').textContent = 'Check your email';
      document.getElementById('otp-subtitle').textContent = `We sent a 6-digit code to ${email}`;
      document.getElementById('otp-code').focus();
    } catch (err) {
      errEl.textContent = err.message;
    } finally { btn.textContent = 'Send Code'; btn.disabled = false; }
  }

  async function verifyOTP() {
    const codeInput = document.getElementById('otp-code');
    const errEl = document.getElementById('otp-code-error');
    const btn = document.getElementById('otp-verify-btn');
    const otp = codeInput.value.trim();
    if (otp.length !== 6) { errEl.textContent = 'Enter the 6-digit code from your email'; return; }
    errEl.textContent = '';
    btn.textContent = 'Verifying...'; btn.disabled = true;
    try {
      const { user, token } = await api.verifyOTP(otpEmail, otp);
      auth.save(token, user);
      const redirect = localStorage.getItem('ani_redirect') || '/';
      localStorage.removeItem('ani_redirect');
      window.location.href = redirect;
    } catch (err) {
      errEl.textContent = err.message;
      codeInput.value = '';
    } finally { btn.textContent = 'Verify & Sign In'; btn.disabled = false; }
  }

  document.getElementById('otp-send-btn')?.addEventListener('click', sendOTP);
  document.getElementById('otp-verify-btn')?.addEventListener('click', verifyOTP);
  document.getElementById('otp-resend-btn')?.addEventListener('click', () => {
    document.getElementById('otp-step-email').style.display = '';
    document.getElementById('otp-step-code').style.display = 'none';
    document.getElementById('otp-subtitle').textContent = "Enter your registered email and we'll send you a sign-in code.";
  });

  // Allow pressing Enter in OTP code input
  document.getElementById('otp-code')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') verifyOTP();
  });

  // ── Toggle password visibility ───────────────────────────────────────────────
  document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.querySelector(btn.dataset.target);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.textContent = input.type === 'password' ? '👁' : '🙈';
    });
  });
});
