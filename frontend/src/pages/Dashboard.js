import React, { useEffect, useState } from 'react';
import api from '../api/api';
import Charts from '../components/Charts';
import { 
  Users, 
  Clock, 
  Calendar, 
  UserPlus, 
  CheckCircle, 
  Activity,
  Briefcase,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get(`/dashboard/stats?role=${user.role}&id=${user.id}`);
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="p-5 text-center">Initialising Dashboard Analytics...</div>;

  const adminCards = [
    { title: 'Total Workforce', value: stats.summary.totalEmployees, icon: <Users size={24} />, color: '#6366f1', bg: '#eef2ff' },
    { title: 'Active Managers', value: stats.summary.managerCount, icon: <UserPlus size={24} />, color: '#0ea5e9', bg: '#f0f9ff' },
    { title: 'Today Presence', value: stats.summary.presentToday, icon: <CheckCircle size={24} />, color: '#10b981', bg: '#ecfdf5' },
    { title: 'On Leave', value: stats.summary.onLeaveToday, icon: <Calendar size={24} />, color: '#f59e0b', bg: '#fffbeb' },
  ];

  const staffCards = [
    { title: 'Units Logged', value: '420m', icon: <Clock size={24} />, color: '#6366f1', bg: '#eef2ff' },
    { title: 'Active Target', value: '92%', icon: <Activity size={24} />, color: '#10b981', bg: '#ecfdf5' },
    { title: 'Total Rewards', value: `$${stats.summary.totalBonuses.toLocaleString()}`, icon: <TrendingUp size={24} />, color: '#10b981', bg: '#ecfdf5' },
    { title: 'Absence Count', value: stats.summary.onLeaveToday, icon: <Calendar size={24} />, color: '#f59e0b', bg: '#fffbeb' },
  ];

  const displayCards = user.role === 'Staff' ? staffCards : adminCards;

  return (
    <div className="px-2">
      <div className="mb-4">
        <h4 className="fw-bold mb-1">
          {user.role === 'Staff' ? 'Individual Productivity Terminal' : 'Global Workspace Intelligence'}
        </h4>
        <p className="text-secondary small">Welcome, {user.name}. View your {user.role.toLowerCase()} operational status.</p>
      </div>

      <div className="row g-4 mb-5">
        {displayCards.map((card, idx) => (
          <div className="col-md-3" key={idx}>
            <div className="stat-card d-flex align-items-center gap-3 shadow-sm border-0">
              <div 
                className="p-3 rounded-lg d-flex align-items-center justify-content-center"
                style={{ backgroundColor: card.bg, color: card.color, borderRadius: '12px' }}
              >
                {card.icon}
              </div>
              <div>
                <div className="small text-secondary fw-bold text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>{card.title}</div>
                <div className="h4 fw-bold mb-0">{card.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="stat-card h-100 border-0 shadow-sm">
            <h6 className="fw-bold mb-4 text-secondary text-uppercase" style={{ fontSize: '0.75rem' }}>Chronological Engagement Trend</h6>
            <Charts attendanceData={stats.attendanceStats} leaveStats={stats.leaveStats} />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="stat-card h-100 border-0 shadow-sm">
            <h6 className="fw-bold mb-4 text-secondary text-uppercase" style={{ fontSize: '0.75rem' }}>Resource Allocation</h6>
            <div className="p-4 bg-light rounded-4 text-center mb-4 border border-light">
              <p className="small text-secondary mb-1">Active Nodes</p>
              <h1 className="fw-bold text-primary mb-0">{stats.summary.totalEmployees}</h1>
            </div>
            <div className="list-group list-group-flush small">
              {Object.keys(stats.leaveStats).map((type, i) => (
                <div key={i} className="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0 border-light py-3">
                  <span className="text-secondary fw-bold">{type} Protocol</span>
                  <span className="badge bg-primary rounded-pill px-3">{stats.leaveStats[type]}</span>
                </div>
              ))}
              {Object.keys(stats.leaveStats).length === 0 && (
                <div className="text-center text-secondary py-4">No active protocols log.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
