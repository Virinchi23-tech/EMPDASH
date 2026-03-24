import React, { createContext, useContext, useState, useEffect } from 'react';
import { tryFetch, BASE, AUTH_BASE } from '@/services/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const initialNotifications = [
    { id: 1, text: 'Welcome!', time: 'Now', read: false }
  ];

  const login = async (email, password) => {
    try {
      // Direct fetch here is fine since we haven't logged in yet and don't need the Bearer token yet,
      // but let's use a standard format and ensure we're using the right port.
      const response = await fetch(`${AUTH_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('emp_token', data.token);
        localStorage.setItem('emp_user', JSON.stringify(data.user));
        setUser(data.user);
        
        const savedNotifications = localStorage.getItem('emp_notifications');
        if (!savedNotifications || JSON.parse(savedNotifications).length === 0) {
          setNotifications([...initialNotifications]);
        }
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      console.error("Login Error:", err);
      return { success: false, message: 'Backend at port 3001 is unreachable.' };
    }
  };

  const logout = () => {
    setUser(null);
    setNotifications([]);
    localStorage.removeItem('emp_user');
    localStorage.removeItem('emp_token');
    localStorage.removeItem('emp_notifications');
  };

  const addNotification = (text) => setNotifications(prev => [{ id: Date.now(), text, time: 'Just now', read: false }, ...prev]);
  const clearNotifications = () => setNotifications([]);
  const markAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  useEffect(() => {
    const validateSession = async () => {
      const savedUser = localStorage.getItem('emp_user');
      const token = localStorage.getItem('emp_token');
      const savedNotifications = localStorage.getItem('emp_notifications');

      if (savedNotifications) {
        try {
          setNotifications(JSON.parse(savedNotifications));
        } catch (e) {
          setNotifications([...initialNotifications]);
        }
      } else {
        setNotifications([...initialNotifications]);
      }

      if (savedUser && token) {
        try {
          // Validate with backend
          const res = await tryFetch(`${AUTH_BASE}/me`);
          if (res.success) {
            setUser(res.user);
            localStorage.setItem('emp_user', JSON.stringify(res.user));
          } else {
            // Token invalid or expired
            setUser(null);
            localStorage.removeItem('emp_user');
            localStorage.removeItem('emp_token');
          }
        } catch (err) {
          console.error("Session validation failed:", err);
          setUser(null);
          localStorage.removeItem('emp_user');
          localStorage.removeItem('emp_token');
        }
      }
      setLoading(false);
    };

    validateSession();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('emp_notifications', JSON.stringify(notifications));
    }
  }, [notifications, user]);

  const hasRole = (role) => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    return user.role === role;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasRole, notifications, addNotification, clearNotifications, markAsRead }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
