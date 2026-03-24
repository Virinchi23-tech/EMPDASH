import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUsers, addUser, deleteUser, updateUser } from '@/services/usersService';
import { UserPlus, Edit, Trash2, Shield, MoreVertical, LayoutGrid, Search, Filter } from 'lucide-react';

const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'Employee', joined: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchUsers = async () => {
        const data = await getUsers();
        setUsers(data);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const result = await addUser(formData);
        if (result.success) {
            setFormData({ name: '', email: '', role: 'Employee', joined: '' });
            setIsAddModalOpen(false);
            fetchUsers();
            alert('User added successfully!');
        }
        setSubmitting(false);
    };

    const handleDeleteUser = async (id) => {
        if (confirm('Are you sure you want to delete this user?')) {
            const result = await deleteUser(id);
            if (result.success) {
                fetchUsers();
            }
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setFormData({ name: user.name, email: user.email, role: user.role, joined: user.joined });
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const result = await updateUser(editingUser.id, formData);
        if (result.success) {
            setIsEditModalOpen(false);
            setEditingUser(null);
            fetchUsers();
            alert('User updated successfully!');
        }
        setSubmitting(false);
    };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>User Management</h2>
                    <p style={{ color: '#64748b' }}>Manage all organizational users and their assigned roles</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                        <UserPlus size={18} /> Add New User
                    </button>
                </div>
            </header>

            <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input type="text" placeholder="Search by name, email or role..." style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.875rem', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b' }}>
                            <th style={{ padding: '1rem 1.5rem' }}>User Profile</th>
                            <th style={{ padding: '1rem 1.5rem' }}>Assigned Role</th>
                            <th style={{ padding: '1rem 1.5rem' }}>Joining Date</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} style={{ width: '40px', height: '40px', borderRadius: '12px' }} />
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{user.name}</div>
                                            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <span className={`badge ${user.role === 'Admin' ? 'badge-danger' : user.role === 'Manager' ? 'badge-warning' : 'badge-success'}`}>
                                        <Shield size={12} style={{ marginRight: '6px' }} /> {user.role}
                                    </span>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                                    {user.joined}
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                    <button onClick={() => handleEditUser(user)} className="btn btn-outline" style={{ padding: '0.5rem', marginRight: '0.5rem' }}>
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteUser(user.id)} className="btn btn-outline" style={{ padding: '0.5rem', color: '#ef4444', borderColor: '#fee2e2' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Components can be implemented here */}
            {/* Add User Modal */}
            {isAddModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
                    <div className="card" style={{ width: '450px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Create New User</h3>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '2rem' }}>Assign a name, email and role to the new organization member.</p>
                        
                        <form onSubmit={handleAddUser}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.5rem' }}>Full Name</label>
                                <input placeholder="John Doe" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                            </div>
                            
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.5rem' }}>Email Address</label>
                                <input placeholder="john@example.com" required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                            </div>
                            
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.5rem' }}>Access Level</label>
                                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                    <option>Employee</option>
                                    <option>Manager</option>
                                    <option>Admin</option>
                                </select>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1, padding: '0.875rem' }} onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                                <button className="btn btn-primary" style={{ flex: 1, padding: '0.875rem' }} disabled={submitting}>
                                    {submitting ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
                    <div className="card" style={{ width: '450px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Edit User Profile</h3>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '2rem' }}>Modify the details and permissions for this organization member.</p>
                        
                        <form onSubmit={handleUpdateUser}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.5rem' }}>Full Name</label>
                                <input placeholder="Full Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                            </div>
                            
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.5rem' }}>Email Address</label>
                                <input placeholder="Email Address" required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                            </div>
                            
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.5rem' }}>Access Level</label>
                                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                    <option>Employee</option>
                                    <option>Manager</option>
                                    <option>Admin</option>
                                </select>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1, padding: '0.875rem' }} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                <button className="btn btn-primary" style={{ flex: 1, padding: '0.875rem' }} disabled={submitting}>
                                    {submitting ? 'Updating...' : 'Update Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
