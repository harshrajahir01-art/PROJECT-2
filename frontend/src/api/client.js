import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    const raw = import.meta.env.VITE_API_URL.replace(/\/$/, '');
    return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
  }
  return '/api/v1';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vs_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('vs_token');
        localStorage.removeItem('vs_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
