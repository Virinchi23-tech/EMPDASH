import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Bell, Search, User } from 'lucide-react';

const Header = () => {
  const { user, logout, notifications, markAsRead } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user) return null;

  return (
    <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: 'white', borderBottom: '1px solid #f1f5f9' }}>
      <div className="header-search">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search records..." 
            style={{ 
              padding: '0.625rem 1rem 0.625rem 2.75rem', 
              borderRadius: '9999px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              fontSize: '0.875rem',
              width: '300px'
            }} 
          />
        </div>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <button 
             className="btn-icon" 
             style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative' }}
             onClick={() => { setShowNotifications(!showNotifications); markAsRead(); }}
          >
            <Bell size={22} style={{ color: '#64748b' }} />
            {notifications && !notifications.every(n => n.read) && (
              <span style={{ 
                position: 'absolute', top: -2, right: -2, width: '10px', height: '10px', 
                background: '#ef4444', borderRadius: '50%', border: '2px solid white' 
              }}></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="card fade-in" style={{ 
              position: 'absolute', top: '100%', right: 0, width: '300px', 
              marginTop: '1rem', padding: '1rem', zIndex: 1000, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
            }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>Notifications</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(!notifications || notifications.length === 0) ? (
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>All caught up!</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.5rem', borderRadius: '6px', background: n.read ? 'transparent' : '#f8fafc' }}>
                       <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{n.text}</div>
                       <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{n.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user.role}</div>
          </div>
          <img 
            src={user.avatar} 
            alt="profile" 
            style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #e2e8f0' }} 
          />
          <button 
            onClick={logout} 
            className="btn btn-outline" 
            style={{ 
              padding: '0.5rem', 
              borderRadius: '8px',
              color: '#ef4444',
              borderColor: '#fee2e2'
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
