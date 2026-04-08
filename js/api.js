/**
 * API client — thin wrapper around fetch that auto-attaches auth token
 */
const BASE = '/api';

function getToken() { return localStorage.getItem('ani_token'); }

async function request(method, endpoint, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${endpoint}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const api = {
  get: (ep) => request('GET', ep),
  post: (ep, body) => request('POST', ep, body),
  delete: (ep) => request('DELETE', ep),

  // Anime
  getTrending: () => api.get('/anime/trending'),
  getAnime: (id) => api.get(`/anime/${id}`),
  browseAnime: (params) => api.get(`/anime?${new URLSearchParams(params)}`),
  getByGenre: (genre) => api.get(`/anime/by-genre/${encodeURIComponent(genre)}`),
  getGenres: () => api.get('/anime/genres'),

  // Auth
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, username, password) => api.post('/auth/register', { email, username, password }),
  getMe: () => api.get('/auth/me'),
  sendOTP: (email) => api.post('/auth/send-otp', { email }),
  verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),

  // User
  getWatchlist: () => api.get('/user/watchlist'),
  checkWatchlist: (id) => api.get(`/user/watchlist/check/${id}`),
  addWatchlist: (id) => api.post(`/user/watchlist/${id}`),
  removeWatchlist: (id) => api.delete(`/user/watchlist/${id}`),
  getHistory: () => api.get('/user/history'),
  addHistory: (anime_id, season_number, episode_number) =>
    api.post('/user/history', { anime_id, season_number, episode_number }),
};

window.api = api;
