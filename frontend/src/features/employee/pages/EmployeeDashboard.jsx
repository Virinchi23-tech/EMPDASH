import React from 'react';
import SessionWidget from '../components/SessionWidget';
import StatsGrid from '../components/StatsGrid';
import { useSessionTimer } from '../hooks/useSessionTimer';

const EmployeeDashboard = ({ user }) => {
  const { sessionActive, sessionTime, formatTime, start, conclude } = useSessionTimer();

  const handleStart = async () => {
    await start();
  };

  const handleConclude = async () => {
    const timeSpent = await conclude();
    if (timeSpent) {
      alert(`Backend Verified: Your session of ${timeSpent} has been officially recorded.`);
    }
  };

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Welcome back, {user.name}</h2>
        <p style={{ color: '#64748b' }}>Complete your session tracking for today</p>
      </header>

      <SessionWidget 
        user={user}
        sessionActive={sessionActive}
        sessionTime={sessionTime}
        formatTime={formatTime}
        onStartSession={handleStart}
        onConcludeSession={handleConclude}
      />

      <StatsGrid />
    </div>
  );
};

export default EmployeeDashboard;
