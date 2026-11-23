const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

const TOKEN_KEY = 'wf_token';
const USER_KEY = 'wf_user';

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  },
  save: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = storage.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      'Cannot reach the server. On the free plan it sleeps when idle – wait about a minute and try again.'
    );
  }

  // Expired / invalid token (but not a wrong password on the login form)
  if (res.status === 401 && token && !path.startsWith('/api/auth')) {
    storage.clear();
    window.location.href = '/login';
    throw new Error('Session expired, please log in again.');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data && (data.message || data.error)) || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (username, password) => request('/api/auth/register', { method: 'POST', body: { username, password } }),
  login: (username, password) => request('/api/auth/login', { method: 'POST', body: { username, password } }),

  roots: () => request('/api/roots'),
  randomWords: (count = 60) => request(`/api/words/random?count=${count}`),
  rootWords: (rootId) => request(`/api/words/root/${rootId}`),

  saveScore: (payload) => request('/api/scores', { method: 'POST', body: payload }),
  myScores: () => request('/api/scores/me'),

  admin: {
    roots: () => request('/api/admin/roots'),
    addRoot: (name) => request('/api/admin/roots', { method: 'POST', body: { name } }),
    deleteRoot: (id) => request(`/api/admin/roots/${id}`, { method: 'DELETE' }),
    words: () => request('/api/admin/words'),
    addWord: (text, meaning, rootId) =>
      request('/api/admin/words', { method: 'POST', body: { text, meaning, rootId } }),
    addBulk: (rootId, lines) => request('/api/admin/words/bulk', { method: 'POST', body: { rootId, lines } }),
    deleteWord: (id) => request(`/api/admin/words/${id}`, { method: 'DELETE' }),
  },
};
