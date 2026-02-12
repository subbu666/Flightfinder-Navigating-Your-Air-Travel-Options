import axios from 'axios';
import API_URL from './api';

// Create axios instance with centralized configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute =
      error.config?.url?.includes('/login') ||
      error.config?.url?.includes('/register');

    if (error.response?.status === 401 && !isAuthRoute) {
      // Only redirect on 401 for protected routes (session expiry)
      // NOT on /login or /register — those 401s must reach GeneralContext
      // so that showError() can display the correct modal to the user
      localStorage.clear();
      window.location.href = '/auth';
    }

    // Always re-throw so .catch() in GeneralContext can handle it
    return Promise.reject(error);
  }
);

export default api;