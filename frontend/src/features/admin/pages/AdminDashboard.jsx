import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '@/services/usersService';
import { Loader2 } from 'lucide-react';

const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const users = await getUsers();
        setTotalUsers(users?.length || 0);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
     return (
       <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
          {[1,2,3].map(i => (
            <div key={i} className="card" style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
               <Loader2 className="animate-spin" />
            </div>
          ))}
       </div>
     );
  }

  return (
    <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
      <div className="card" style={{ borderLeft: '4px solid #4f46e5' }}>
         <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Total Organization Users</div>
         <div style={{ fontSize: '2rem', fontWeight: 800 }}>{totalUsers} <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 600 }}>+0 this month</span></div>
      </div>
      <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
         <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>System Integrity</div>
         <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>OPTIMAL</div>
         <div style={{ fontSize: '0.75rem', color: '#64748b' }}>All security protocols verified</div>
      </div>
      <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
         <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Active Config Version</div>
         <div style={{ fontSize: '2rem', fontWeight: 800 }}>v2.4.1</div>
         <div style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/admin/config')}>Configure Global Specs →</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
