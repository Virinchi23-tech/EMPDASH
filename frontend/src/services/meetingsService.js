import { API_BASE, tryFetch } from './apiClient';

export const logMeeting = async (meetingData) => {
    return await tryFetch(`${API_BASE}/meeting/log`, {
        method: 'POST',
        body: JSON.stringify(meetingData)
    });
};

export const getMyData = async () => {
    return await tryFetch(`${API_BASE}/my-data`, { method: 'GET' });
};
