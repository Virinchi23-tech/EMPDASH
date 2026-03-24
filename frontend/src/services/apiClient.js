// Frontend ↔ Turso Backend Integration
const BASE = 'http://localhost:3001';
const API_BASE = `${BASE}/api`;
const AUTH_BASE = `${BASE}/auth`;

const tryFetch = async (url, options = {}) => {
  try {
    const token = localStorage.getItem('emp_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    const res = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers },
    });
    
    // Auto-parse JSON response
    const json = await res.json();
    return json;
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
};

export { BASE, API_BASE, AUTH_BASE, tryFetch };
