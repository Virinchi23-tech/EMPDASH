import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeamData } from '@/services/usersService';
import { useAuth } from '@/context/AuthContext';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ members: 0, pendingLeaves: 0, avgProductivity: 0 });

  useEffect(() => {
    const loadStats = async () => {
      const data = await getTeamData(user.role);
      const activeMembers = data.users.filter(u => u.role !== 'Admin').length;
      const pendingLeaves = data.leaves.filter(l => l.status === 'Pending').length;
      const completedSessions = data.sessions.filter(s => s.status === 'completed').length;
      setStats({
        members: activeMembers,
        pendingLeaves: pendingLeaves,
        avgProductivity: activeMembers > 0 ? Math.min(100, (completedSessions / (activeMembers * 5)) * 100).toFixed(1) : 0
      });
    };
    loadStats();
  }, [user.role]);

  return (
    <div className="grid grid-cols-3" style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
      <div className="card" style={{ borderLeft: '4px solid #4f46e5' }}>
         <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600 }}>Active Team Members</div>
         <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.members} / 20</div>
         <div style={{ marginTop: '1rem', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
           <div style={{ width: `${(stats.members / 20) * 100}%`, height: '100%', background: '#4f46e5' }}></div>
         </div>
      </div>
      <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
         <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600 }}>Pending Leave Requests</div>
         <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.pendingLeaves.toString().padStart(2, '0')} {stats.pendingLeaves > 0 && <span className="badge badge-warning" style={{ fontSize: '0.75rem', verticalAlign: 'middle', marginLeft: '0.5rem' }}>ACTION REQ</span>}</div>
         <div style={{ fontSize: '0.75rem', marginTop: '0.75rem', color: '#4f46e5', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/leave/approve')}>Review Applications →</div>
      </div>
      <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
         <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600 }}>Avg Team Productivity</div>
         <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.avgProductivity}%</div>
         <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>▲ Updated directly from DB</div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
