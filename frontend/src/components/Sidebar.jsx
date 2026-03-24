import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Clock, 
  Coffee, 
  Users, 
  FileText, 
  Calendar, 
  ShieldCheck, 
  Settings, 
  BarChart3,
  UserCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const roleConfigs = {
    Employee: [
      { path: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
      { path: '/session', label: 'Work Session', icon: Clock },
      { path: '/breaks', label: 'Break Tracking', icon: Coffee },
      { path: '/meetings', label: 'Meetings', icon: Calendar },
      { path: '/leave/apply', label: 'Apply Leave', icon: FileText },
      { path: '/reports/personal', label: 'My Reports', icon: BarChart3 }
    ],
    Manager: [
      { path: '/dashboard', label: 'Team Overview', icon: LayoutDashboard },
      { path: '/team', label: 'Team Directory', icon: Users },
      { path: '/leave/approve', label: 'Leave Approval', icon: UserCheck },
      { path: '/reports/team', label: 'Team Performance', icon: BarChart3 }
    ],
    Admin: [
      { path: '/dashboard', label: 'System Dashboard', icon: ShieldCheck },
      { path: '/admin/users', label: 'User Management', icon: Users },
      { path: '/admin/config', label: 'System Config', icon: Settings },
      { path: '/reports/team', label: 'System Reports', icon: BarChart3 }
    ]
  };

  const currentLinks = roleConfigs[user.role] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" style={{
        fontWeight: 800,
        fontSize: '1.25rem',
        marginBottom: '2rem',
        color: '#4f46e5',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '32px', height: '32px', background: '#e0e7ff', borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>🏢</div>
        EMP LOGIC
      </div>

      <nav style={{ flex: 1 }}>
        {currentLinks.map(link => (
          <NavLink 
            key={link.path} 
            to={link.path} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <link.icon size={20} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
         <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Access Level</div>
         <div style={{ color: '#475569', fontWeight: 600, fontSize: '0.875rem' }}>{user.role} Dashboard</div>
      </div>
    </aside>
  );
};

export default Sidebar;
