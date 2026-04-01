// frontend/src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send httpOnly refresh cookie automatically
});

// ── Attach access token to every request
api.interceptors.request.use((config) => {
  const token = window.__accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── On 401, silently refresh then retry once
let refreshing = false;
let refreshQueue = [];

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retried) {
      original._retried = true;

      if (refreshing) {
        // Queue the request until refresh finishes
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then(() => api(original));
      }

      refreshing = true;
      try {
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        window.__accessToken = data.accessToken;
        refreshQueue.forEach(({ resolve }) => resolve());
        refreshQueue = [];
        return api(original);
      } catch (_refreshErr) {
        refreshQueue.forEach(({ reject }) => reject(_refreshErr));
        refreshQueue = [];
        // Redirect to login
        window.__accessToken = null;
        window.location.href = '/login';
      } finally {
        refreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
