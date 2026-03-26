import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add token and debugging logs
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Debugging: log token presence and request URL
    console.log(`[Frontend API] Initializing request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Safety check for valid token strings
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token.trim()}`;
      console.log(`[Frontend API] ✅ Token attached to header.`);
    } else {
      console.warn(`[Frontend API] ⚠️ No valid token found in storage.`);
    }
    
    return config;
  },
  (error) => {
    console.error('[Frontend API] ❌ Request preparation error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: handle token expiration and debugging
api.interceptors.response.use(
  (response) => {
    // Debugging: log successful response for developmental clarity
    console.log(`[Frontend API] ✅ Server response received for: ${response.config.url}`);
    return response;
  },
  (error) => {
    const { response } = error;
    
    // Debugging: log API errors with clear messaging
    console.error(`[Frontend API] ❌ Failure detected at: ${error.config?.url}. Status: ${response?.status || 'Unknown'}`);
    
    // If 401 (Unauthorized) or 403 (Forbidden/Expired Token)
    if (response && (response.status === 401 || response.status === 403)) {
      console.warn('[Frontend API] Access revoked or token expired. Cleaning session and redirecting...');
      
      // Clean up session artifacts to prevent infinite loops or false auth state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page if we aren't already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?session_expired=true';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
