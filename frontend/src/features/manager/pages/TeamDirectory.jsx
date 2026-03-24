import React, { useState, useEffect } from 'react';
import { getTeamData } from '@/services/usersService';
import { Search, Mail, ExternalLink, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const TeamDirectory = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getTeamData(user.role);
      setUsers(data.users ? data.users.filter(u => u.role !== 'Admin') : []);
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="fade-in">
       <header style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Team Directory</h2>
          <p style={{ color: '#64748b' }}>Complete list of active team members and their roles</p>
       </header>

       <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
             <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
             <input 
                type="text" 
                placeholder="Search team members by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.875rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} 
             />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <Filter size={16} style={{ color: '#64748b' }} />
             <select 
                value={filterRole} 
                onChange={(e) => setFilterRole(e.target.value)}
                style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 500, fontSize: '0.875rem' }}
             >
                <option value="All">All Roles</option>
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
             </select>
          </div>
       </div>

       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filteredUsers.length === 0 ? (
             <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                No team members found matching your search.
             </div>
          ) : (
             filteredUsers.map(user => (
             <div key={user.id} className="card" style={{ textAlign: 'center', transition: 'transform 0.2s' }}>
                <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} style={{ width: '80px', height: '80px', borderRadius: '24px', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>{user.name}</h3>
                <div style={{ fontSize: '0.875rem', color: '#4f46e5', fontWeight: 600, marginBottom: '1rem' }}>{user.role}</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                      <Mail size={14} /> {user.email}
                   </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                   <button 
                      onClick={() => navigate(`/employee/${user.id}`)}
                      className="btn btn-outline" 
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem' }}
                   >
                      <ExternalLink size={14} /> Profile
                   </button>
                   <button 
                      className="btn btn-primary" 
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem' }}
                   >
                      Contact
                   </button>
                </div>
             </div>
          )))}
       </div>
    </div>
  );
};

export default TeamDirectory;
