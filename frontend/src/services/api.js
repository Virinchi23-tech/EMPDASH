import axios from 'axios';

/**
 * 🚀 [API Instance] Synchronized Production Gateway
 * Dynamically resolves the backend hub based on environment:
 * - Production: VITE_API_URL (e.g., https://empdash.onrender.com/api)
 * - Development: /api (proxied via Vite to localhost:5000)
 */
const baseURL = import.meta.env.VITE_API_URL || '/api';

console.log(`📡 [API Client] Initializing session with baseURL: ${baseURL}`);

const api = axios.create({
  baseURL: baseURL,
  timeout: 30000, // Increased timeout for Render cold starts
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * 🔐 Request Interceptor: Identity Propagation
 * Orchestrates the attachment of JWT 'Bearer' tokens to the Authorization header
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token && token !== 'null' && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token.trim()}`;
    console.log(`🌐 [AXIOS Request] Authenticated Handshake: ${config.method.toUpperCase()} ${config.url}`);
  } else {
    console.warn(`🌐 [AXIOS Request] Anonymous Handshake: ${config.method.toUpperCase()} ${config.url}`);
  }
  
  return config;
}, (error) => {
  console.error('❌ [AXIOS Request Error]', error);
  return Promise.reject(error);
});

/**
 * 🛠️ Response Interceptor: Lifecycle & Recovery Logic
 * Monitors the health of the connection and handles authentication failures
 */
api.interceptors.response.use(
  (response) => {
    // 💡 [Lifecycle: Auto-Retry Optimization]
    // If the call succeeds, we ensure we return the response immediately.
    return response;
  },
  async (error) => {
    const { response, config } = error;

    // Log high-fidelity failure logs for Render/Vercel monitoring
    console.error(`🛑 [AXIOS Response Error] Path: ${config?.url} | Status: ${response?.status || 'OFFLINE'} | Message: ${error.message}`);

    // 🔥 [RETRY LOGIC: Render Cold Start Resilience]
    // If we have a timeout or network error, and we haven't retried yet:
    if (!response && !config._retry) {
      config._retry = true;
      console.warn('🔄 Potential Render Cold Start. Triggering automatic handshake retry...');
      return api(config);
    }

    // [CASE A] Unauthorized/Forbidden (401/403)
    // Decommission local identity registry if the token is invalid or expired
    if (response && (response.status === 401 || response.status === 403)) {
      console.warn('🔑 Authentication Tiers Denied. Resetting local environment...');
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect if not on the login node to avoid loops
      if (!window.location.pathname.includes('/login')) {
         console.warn('🔄 Redirecting to Authentication Node...');
         window.location.href = '/login?session_expired=true';
      }
    }

    // [CASE B] Node Cold Start Persistence
    if (!response) {
      console.error('⚠️ Infrastructure Unreachable after retry. Check the Render status page.');
      return Promise.reject({
        ...error,
        message: 'The cloud infrastructure is currently initiating. Please wait a moment and retry (Render Cold Start).'
      });
    }

    return Promise.reject(error);
  }
);

export default api;
