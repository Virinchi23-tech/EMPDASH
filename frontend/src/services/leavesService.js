import { API_BASE, tryFetch } from './apiClient';

// ── Mock fallback ──────────────────────────────────────────────
const defaultLeaves = [
  { id: 1, userId: 3, name: 'Employee User', type: 'Sick Leave',   date: '2026-03-20', status: 'Pending',  reason: 'Fever' },
  { id: 2, userId: 3, name: 'Employee User', type: 'Annual Leave', date: '2026-04-15', status: 'Approved', reason: 'Vacation' },
];

const getStored = () => { try { return JSON.parse(localStorage.getItem('emp_leaves')) || defaultLeaves; } catch { return defaultLeaves; } };
const save = (l) => localStorage.setItem('emp_leaves', JSON.stringify(l));
let mock = getStored();

// ── API Functions ──────────────────────────────────────────────
export const getLeaves = async (role, userId) => {
  // Use specialized endpoints for roles
  const path = role === 'Employee' ? `${API_BASE}/my-data` : 
               role === 'Manager' ? `${API_BASE}/team-data` : `${API_BASE}/all-data`;
  
  const data = await tryFetch(path);
  if (data?.success) {
    return data.data.leaves;
  }
  return role === 'Employee' && userId ? mock.filter(l => l.userId === userId) : mock;
};

export const addLeave = async (leave) => {
  console.log('[API] Applying for leave via Turso');
  const data = await tryFetch(`${API_BASE}/leave/apply`, { 
    method: 'POST', 
    body: JSON.stringify({ type: leave.type, reason: leave.reason, date: leave.date }) 
  });
  if (data?.success) return data;
  return { success: false, message: 'Failed to submit leave to backend' };
};

export const approveLeave = async (id, status) => {
  const endpoint = status === 'Approved' ? 'approve' : 'reject';
  console.log(`[API] Processing leave ${id} for ${status}`);
  const data = await tryFetch(`${API_BASE}/leave/${id}/${endpoint}`, { method: 'PUT' });
  return data;
};

export const rejectLeave = async (id) => {
  console.log(`[API] Rejecting leave ${id} via dedicated call`);
  const data = await tryFetch(`${API_BASE}/leave/${id}/reject`, { method: 'PUT' });
  return data;
};
