import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, Calendar, CheckCircle, AlertCircle, History } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { startSession, endSession } from '@/services/sessionService';
import { getMyData } from '@/services/meetingsService';

const SessionTracking = () => {
    const { user } = useAuth();
    const [sessionActive, setSessionActive] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [pastSessions, setPastSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await getMyData();
                if (res.success) {
                    const sortedSessions = res.data.sessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
                    const active = sortedSessions.find(s => s.status === 'active');
                    if (active) {
                        setSessionActive(true);
                        const duration = Math.floor((new Date() - new Date(active.startTime)) / 1000);
                        setSeconds(duration > 0 ? duration : 0);
                    }
                    
                    const past = sortedSessions.filter(s => s.status === 'completed').map(s => {
                        const start = new Date(s.startTime);
                        const end = new Date(s.endTime);
                        const durationSeconds = Math.floor((end - start) / 1000);
                        return {
                            id: s.id,
                            date: start.toISOString().split('T')[0],
                            duration: formatTime(durationSeconds),
                            status: 'Verified'
                        };
                    });
                    setPastSessions(past);
                }
            } catch (err) {
                console.error("Failed to fetch sessions:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    useEffect(() => {
        let interval;
        if (sessionActive) {
            interval = setInterval(() => setSeconds(s => s + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [sessionActive]);

    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleToggleSession = async () => {
        if (!sessionActive) {
            const res = await startSession();
            if (res.success) setSessionActive(true);
        } else {
            const res = await endSession(seconds);
            if (res.success) {
                setSessionActive(false);
                const newSession = {
                    id: Date.now(),
                    date: new Date().toISOString().split('T')[0],
                    duration: formatTime(seconds),
                    status: 'Verified'
                };
                setPastSessions([newSession, ...pastSessions]);
                setSeconds(0);
                alert('Session successfully recorded on the enterprise ledger.');
            }
        }
    };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Work / Session Tracking</h2>
                <p style={{ color: '#64748b' }}>Manage your daily work protocols and historical session logs</p>
            </header>

            <div className="grid grid-cols-3">
                <div className="card" style={{ gridColumn: 'span 1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
                    <div style={{ 
                        width: '200px', height: '200px', borderRadius: '50%', border: `8px solid ${sessionActive ? '#e0f2fe' : '#f1f5f9'}`, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', position: 'relative'
                    }}>
                        {sessionActive && <div className="animate-spin" style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '8px solid #0ea5e9', borderRightColor: 'transparent' }}></div>}
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'monospace' }}>{formatTime(seconds)}</div>
                    </div>
                    
                    <button 
                        onClick={handleToggleSession} 
                        className="btn btn-primary" 
                        style={{ width: '100%', padding: '1.25rem', justifyContent: 'center', background: sessionActive ? '#ef4444' : '#4f46e5', fontSize: '1.125rem' }}
                    >
                        {sessionActive ? <><Square size={20} fill="white" style={{ marginRight: '10px' }} /> Conclude Protocol</> : <><Play size={20} fill="white" style={{ marginRight: '10px' }} /> Initiate Protocol</>}
                    </button>
                    
                    {sessionActive && (
                        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0ea5e9', fontWeight: 700, fontSize: '0.875rem' }}>
                            <AlertCircle size={16} /> LIVE DATA TRANSMISSION ACTIVE
                        </div>
                    )}
                </div>

                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <History size={20} style={{ color: '#4f46e5' }} /> Recent Session Ledger
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {pastSessions.map(session => (
                            <div key={session.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', border: '1px solid #f1f5f9', borderRadius: '12px', background: '#f8fafc' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ background: '#e0f2fe', padding: '0.5rem', borderRadius: '8px' }}><Clock size={18} style={{ color: '#0ea5e9' }} /></div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Session on {session.date}</div>
                                        <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Verified Research Protocol Audit</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 800, color: '#10b981', fontSize: '1rem' }}>{session.duration}</div>
                                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>COMPLETE</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionTracking;
