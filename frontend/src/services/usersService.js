import { API_BASE, tryFetch } from './apiClient';

// ── Mock fallback data ─────────────────────────────────────────
const defaultUsers = [
  { id: 1, name: 'Admin User',    email: 'admin@company.com',    role: 'Admin',    joiningDate: '2023-06-15', avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff' },
  { id: 2, name: 'Manager User',  email: 'manager@company.com',  role: 'Manager',  joiningDate: '2023-11-20', avatar: 'https://ui-avatars.com/api/?name=Manager+User&background=4f46e5&color=fff' },
  { id: 3, name: 'Employee User', email: 'employee@company.com', role: 'Employee', joiningDate: '2024-01-12', avatar: 'https://ui-avatars.com/api/?name=Employee+User&background=818cf8&color=fff' },
];

const getStored = () => { try { return JSON.parse(localStorage.getItem('emp_users')) || defaultUsers; } catch { return defaultUsers; } };
const save = (u) => localStorage.setItem('emp_users', JSON.stringify(u));
let mock = getStored();

// ── API Functions ──────────────────────────────────────────────
export const getUsers = async () => {
  const data = await tryFetch(`${API_BASE}/all-data`);
  if (data?.success) return data.data.users;
  return mock;
};

export const getTeamData = async (role) => {
  const endpoint = role === 'Admin' ? `${API_BASE}/all-data` : `${API_BASE}/team-data`;
  const data = await tryFetch(endpoint);
  if (data?.success) return data.data;
  return { users: [], sessions: [], leaves: [], meetings: [], breaks: [] };
};

export const getUserById = async (id) => {
  // We can just filter from all users for simplicity since backend doesn't have a single user fetch
  const users = await getUsers();
  return users.find(u => u.id === parseInt(id));
};

export const getUserProfile = async (id) => {
  const data = await tryFetch(`${API_BASE}/user-profile/${id}`);
  return data;
};

export const addUser = async (user) => {
  const data = await tryFetch(`${API_BASE}/users`, { 
    method: 'POST', 
    body: JSON.stringify({
      name: user.name,
      email: user.email,
      password: user.password || 'temp123',
      role: user.role,
      managerId: user.managerId
    }) 
  });
  return data;
};

export const updateUser = async (id, updatedData) => {
  const data = await tryFetch(`${API_BASE}/users/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(updatedData) 
  });
  return data;
};

export const deleteUser = async (id) => {
  const data = await tryFetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
  return data;
};
