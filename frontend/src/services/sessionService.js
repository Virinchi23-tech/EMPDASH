import { API_BASE, tryFetch } from './apiClient';

export const startSession = async () => {
  console.log('[API] Starting work session via Turso Backend');
  const data = await tryFetch(`${API_BASE}/session/start`, { method: 'POST' });
  return data;
};

export const endSession = async (duration) => {
  console.log(`[API] Ending work session. Captured duration: ${duration}s`);
  const data = await tryFetch(`${API_BASE}/session/end`, { 
    method: 'POST',
    body: JSON.stringify({ duration }) // Backend doesn't strictly use duration yet but good to send
  });
  return data;
};
