import { API_BASE, tryFetch } from './apiClient';

export const startBreak = async () => {
    return await tryFetch(`${API_BASE}/break/start`, { method: 'POST' });
};

export const endBreak = async () => {
    return await tryFetch(`${API_BASE}/break/end`, { method: 'POST' });
};
