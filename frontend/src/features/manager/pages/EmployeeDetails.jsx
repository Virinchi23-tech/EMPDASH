import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Briefcase, Mail, Phone, Calendar, ArrowLeft, ShieldCheck, History, TrendingUp, Clock, Award, Star } from 'lucide-react';
import { getUserProfile } from '@/services/usersService';
import { getLeaves } from '@/services/leavesService';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [data, setData] = useState({ sessions: [], breaks: [], meetings: [], leaves: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getUserProfile(id);
        if (res.success) {
          setEmployee(res.data.user);
          setData({
            sessions: res.data.sessions,
            breaks: res.data.breaks,
            meetings: res.data.meetings,
            leaves: res.data.leaves
          });
        }
      } catch (err) {
        console.error('Error fetching employee profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#94a3b8', fontSize: '1.125rem', fontWeight: 600 }}>
      Loading profile...
    </div>
  );

  if (!employee) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem', color: '#94a3b8' }}>
      <Star size={48} />
      <h3 style={{ fontWeight: 700, fontSize: '1.25rem', color: '#64748b' }}>Employee not found</h3>
      <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  const avatarSeed = employee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random&size=128`;

  const stats = [
    { label: 'Sessions Logged', value: data.sessions.length, icon: <Clock size={18} style={{ color: '#0ea5e9' }} />, bg: '#e0f2fe' },
    { label: 'Meetings Attended', value: data.meetings.length, icon: <TrendingUp size={18} style={{ color: '#10b981' }} />, bg: '#dcfce7' },
    { label: 'Leave Days Used', value: data.leaves.filter(l => l.status === 'Approved').length, icon: <Calendar size={18} style={{ color: '#f59e0b' }} />, bg: '#fef3c7' },
    { label: 'Breaks Taken', value: data.breaks.length, icon: <Award size={18} style={{ color: '#4f46e5' }} />, bg: '#eef2ff' },
  ];

  // Combine and sort activities for the ledger
  const activityLog = [
    ...data.sessions.map(s => ({
        title: 'Session Concluded',
        detail: `Protocol #${s.id}`,
        time: new Date(s.startTime).toLocaleDateString(),
        duration: s.endTime ? 'Completed' : 'Active',
        verified: !!s.endTime
    })),
    ...data.meetings.map(m => ({
        title: 'Meeting Logged',
        detail: m.title,
        time: m.time,
        duration: `${m.duration} min`,
        verified: true
    })),
    ...data.breaks.map(b => ({
        title: 'Break Interval',
        detail: 'Pulse/Refresh',
        time: new Date(b.startTime).toLocaleDateString(),
        duration: b.endTime ? 'Ended' : 'Active',
        verified: !!b.endTime
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

  const roleColor = employee.role === 'Admin' ? '#6366f1' : employee.role === 'Manager' ? '#4f46e5' : '#818cf8';

  return (
    <div className="fade-in">
      {/* Profile Header Banner */}
      <div style={{ background: `linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)`, borderRadius: '20px', padding: '2rem', marginBottom: '2rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            background: 'rgba(255,255,255,0.2)', 
            border: 'none', 
            borderRadius: '8px', 
            padding: '0.5rem 1rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            color: 'white', 
            cursor: 'pointer', 
            marginBottom: '1.5rem', 
            fontSize: '0.875rem', 
            fontWeight: 600,
            position: 'relative',
            zIndex: 10
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', position: 'relative' }}>
          <img
            src={avatarSeed}
            alt={employee.name}
            style={{ width: '96px', height: '96px', borderRadius: '24px', border: '4px solid rgba(255,255,255,0.4)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
          />
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em' }}>{employee.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem', opacity: 0.9 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem', fontWeight: 600 }}>
                <Briefcase size={16} /> {employee.role}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Mail size={16} /> {employee.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Calendar size={16} /> Joined {employee.joiningDate}
              </span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{ background: 'rgba(16, 185, 129, 0.3)', color: '#a7f3d0', padding: '0.375rem 1rem', borderRadius: '99px', fontSize: '0.8125rem', fontWeight: 700, border: '1px solid rgba(167,243,208,0.4)' }}>
              ● ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
        {stats.map((s, i) => (
          <div key={i} className="card" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: s.bg, padding: '0.75rem', borderRadius: '12px', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Contact */}
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>Contact Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {[
                { icon: <Mail size={16} style={{ color: '#64748b' }} />, label: 'Email', value: employee.email },
                { icon: <Phone size={16} style={{ color: '#64748b' }} />, label: 'Phone', value: '+1 (555) 234-5678' },
                { icon: <ShieldCheck size={16} style={{ color: '#10b981' }} />, label: 'Security', value: 'Level 3 Verified' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '8px' }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{item.label}</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leave Summary */}
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>Leave Summary</h3>
            {data.leaves.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No leave records found.</p>
            ) : data.leaves.map((l, i) => (
              <div key={i} style={{ padding: '0.75rem', borderRadius: '8px', background: '#f8fafc', marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{l.type}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{l.time}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: l.status === 'Approved' ? '#10b981' : l.status === 'Rejected' ? '#ef4444' : '#f59e0b' }}>{l.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Activity */}
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <History size={20} style={{ color: '#4f46e5' }} /> Recent Activity Ledger
          </h3>
          <div>
            {activityLog.map((log, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', borderBottom: i < activityLog.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: log.verified ? '#10b981' : '#94a3b8', flexShrink: 0 }}></div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{log.title}</div>
                    <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{log.detail} · {log.time}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: log.verified ? '#10b981' : '#f59e0b', fontSize: '0.9375rem' }}>{log.duration}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{log.verified ? '✓ Verified' : '⏳ Pending'}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }} onClick={() => alert('Full audit history coming soon...')}>
            View Full Audit History
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
