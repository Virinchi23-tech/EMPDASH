import { useState, useEffect, useRef } from 'react';
import { startSession, endSession } from '@/services/sessionService';

export const useSessionTimer = () => {
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);

  const fetchedRef = useRef(false);

  useEffect(() => {
    let interval;
    const fetchSession = async () => {
      try {
        const { getMyData } = await import('@/services/meetingsService');
        const res = await getMyData();
        if (res.success) {
          const active = res.data.sessions.find(s => s.status === 'active');
          if (active) {
            setSessionActive(true);
            const duration = Math.floor((new Date() - new Date(active.startTime)) / 1000);
            setSessionTime(duration > 0 ? duration : 0);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    // Only fetch on mount
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchSession();
    }
    
    if (sessionActive) {
      interval = setInterval(() => setSessionTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const start = async () => {
    const result = await startSession();
    if (result.success) {
      setSessionActive(true);
    }
  };

  const conclude = async () => {
    const result = await endSession(sessionTime);
    if (result.success) {
      setSessionActive(false);
      const timeSpent = formatTime(sessionTime);
      setSessionTime(0);
      return timeSpent;
    }
    return null;
  };

  return { sessionActive, sessionTime, formatTime, start, conclude };
};
