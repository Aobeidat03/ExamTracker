import axios from 'axios';

const api = axios.create({
  // In production set VITE_API_URL; in local dev the Vite proxy handles /api
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('et_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear storage and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('et_token');
      localStorage.removeItem('et_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Extract a human-readable error message from an Axios error.
 * Handles both { error: "string" } and { errors: [{msg: "..."}] } shapes.
 */
export function getErrorMessage(err) {
  const data = err?.response?.data;
  if (!data) return err?.message || 'An unexpected error occurred.';
  if (data.error) return data.error;
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors[0].msg;
  }
  return 'An unexpected error occurred.';
}

export default api;
