/**
 * Auth state manager — handles JWT token and user session
 */
const auth = {
  getToken: () => localStorage.getItem('ani_token'),
  getUser:  () => { try { return JSON.parse(localStorage.getItem('ani_user')); } catch { return null; } },
  isLoggedIn: () => !!localStorage.getItem('ani_token'),

  save(token, user) {
    localStorage.setItem('ani_token', token);
    localStorage.setItem('ani_user', JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem('ani_token');
    localStorage.removeItem('ani_user');
    window.location.href = '/login.html';
  },

  /** Updates the nav to show username or login link */
  updateNav() {
    const user = auth.getUser();
    const loginLinks = document.querySelectorAll('[data-auth="login"]');
    const logoutLinks = document.querySelectorAll('[data-auth="logout"]');
    const userMenus = document.querySelectorAll('[data-auth="user"]');
    const usernames = document.querySelectorAll('[data-auth="username"]');

    if (user) {
      loginLinks.forEach(el => el.style.display = 'none');
      logoutLinks.forEach(el => el.style.display = '');
      userMenus.forEach(el => el.style.display = '');
      usernames.forEach(el => el.textContent = user.username);
    } else {
      loginLinks.forEach(el => el.style.display = '');
      logoutLinks.forEach(el => el.style.display = 'none');
      userMenus.forEach(el => el.style.display = 'none');
    }
  },

  /** Requires login — redirects to /login.html if not authed */
  requireLogin() {
    if (!auth.isLoggedIn()) {
      localStorage.setItem('ani_redirect', window.location.href);
      window.location.href = '/login.html';
      return false;
    }
    return true;
  }
};

window.auth = auth;

// Run updateNav automatically when DOM is ready
document.addEventListener('DOMContentLoaded', () => auth.updateNav());
