import axios from 'axios';
const getDynamicBaseURL = () => {
  const envURL = import.meta.env.VITE_API_URL;
  
  // 🔌 Strategic Android Emulator Redirect
  // On Android emulators, localhost points to the local device.
  // To reach the host machine's backend, we must use 10.0.2.2.
  if (typeof window !== 'undefined' && /android/i.test(navigator.userAgent) && envURL?.includes('localhost')) {
     console.log('📱 Android Node Detected: Re-routing Localhost Handshake to Gateway (10.0.2.2)');
     return envURL.replace('localhost', '10.0.2.2');
  }

  return envURL || 'http://localhost:5050';
};

const api = axios.create({
  baseURL: getDynamicBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * 🔐 Request Interceptor: Identity Propagation
 * Standardizes the attachment of JWT 'Bearer' tokens to the Authorization header
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log(`📡 [AXIOS] Handshake Token Check: ${token ? 'PRESENT' : 'MISSING'}`);

  if (token && token !== 'null' && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  }
  
  return config;
}, (error) => {
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
    // Decommission local identity registry ONLY if we definitely have an expired or missing token.
    // For many apps, a 401 is an indicator to re-login, but we'll follow the user's strategic constraint
    // to avoid auto-logout on clicking the Meetings section.
    if (response && (response.status === 401 || response.status === 403)) {
      console.warn(`🔑 [AUTHENTICATION WARNING] Path: ${config.url} | Status: ${response.status} | Token Issue Detected.`);

      // If it's a 401 on the meetings API, we don't want to logout immediately.
      if (config.url.includes('/api/meetings')) {
          console.error("🛑 [Identity Handshake Denial] The Meetings API rejected the protocol token. Synchronization suspended.");
          return Promise.reject(error); // This will be caught by the page-level error handler
      }

      // Case-Specific handling: Do NOT auto-logout.
      console.warn("🔐 [AXIOS] Unauthorized node detected - handling session gracefully.");
      
      // We no longer strip the token automatically. Instead, let the UI handle the denial state.
      // This allows users to stay on their current page if it's a transient node failure.
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
