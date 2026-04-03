/* Login / Register page */
document.addEventListener('DOMContentLoaded', () => {
  if (auth.isLoggedIn()) { window.location.href = '/'; return; }

  const loginTab = document.getElementById('tab-login');
  const registerTab = document.getElementById('tab-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginError = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');

  function showLogin() {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.style.display = '';
    registerForm.style.display = 'none';
    loginError.textContent = '';
  }
  function showRegister() {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.style.display = '';
    loginForm.style.display = 'none';
    registerError.textContent = '';
  }

  loginTab?.addEventListener('click', showLogin);
  registerTab?.addEventListener('click', showRegister);

  // If URL has ?mode=register, open register form
  if (new URLSearchParams(location.search).get('mode') === 'register') showRegister();

  // Login
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector('button[type=submit]');
    btn.textContent = 'Signing in...'; btn.disabled = true;
    loginError.textContent = '';
    try {
      const { user, token } = await api.login(
        loginForm.querySelector('#login-email').value,
        loginForm.querySelector('#login-password').value
      );
      auth.save(token, user);
      const redirect = localStorage.getItem('ani_redirect') || '/';
      localStorage.removeItem('ani_redirect');
      window.location.href = redirect;
    } catch (err) {
      loginError.textContent = err.message;
    } finally { btn.textContent = 'Sign In'; btn.disabled = false; }
  });

  // Register
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = registerForm.querySelector('button[type=submit]');
    btn.textContent = 'Creating account...'; btn.disabled = true;
    registerError.textContent = '';
    const pw = registerForm.querySelector('#reg-password').value;
    const pw2 = registerForm.querySelector('#reg-password2').value;
    if (pw !== pw2) { registerError.textContent = 'Passwords do not match'; btn.textContent = 'Create Account'; btn.disabled = false; return; }
    try {
      const { user, token } = await api.register(
        registerForm.querySelector('#reg-email').value,
        registerForm.querySelector('#reg-username').value,
        pw
      );
      auth.save(token, user);
      window.location.href = '/';
    } catch (err) {
      registerError.textContent = err.message;
    } finally { btn.textContent = 'Create Account'; btn.disabled = false; }
  });

  // Toggle password visibility
  document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.querySelector(btn.dataset.target);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.textContent = input.type === 'password' ? '👁' : '🙈';
    });
  });
});
