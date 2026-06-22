import axios from 'axios';

export const TOKEN_KEY_ADMIN = 'savora-admin-token';
export const TOKEN_KEY_CUSTOMER = 'savora-customer-token';

/** Returns the appropriate token key based on the current page path */
function getActiveTokenKey(): string {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return TOKEN_KEY_ADMIN;
  }
  return TOKEN_KEY_CUSTOMER;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for custom JWT Auth
api.interceptors.request.use(
  async (config) => {
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem(getActiveTokenKey());
    }
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401/403 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        const key = getActiveTokenKey();
        localStorage.removeItem(key);
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/login?role=admin';
        } else {
          window.dispatchEvent(new CustomEvent('auth-error'));
        }
      }
    }
    if (error.response?.status === 429) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('api-error', { 
          detail: { 
            title: "Whoa, slow down!", 
            message: "You've been making too many requests. Please take a breather and try again in 15 minutes to keep our servers happy." 
          } 
        }));
      }
    }
    return Promise.reject(error);
  }
);

export default api;

