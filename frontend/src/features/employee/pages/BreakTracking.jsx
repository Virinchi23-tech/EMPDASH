import React, { useState, useEffect } from 'react';
import { Coffee, Clock, Heart, Sliders, Play, RotateCcw } from 'lucide-react';
import { startBreak, endBreak } from '../../../services/breaksService';

const BreakTracking = () => {
    const [breakActive, setBreakActive] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [timer, setTimer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBreaks = async () => {
            try {
                const { getMyData } = await import('@/services/meetingsService');
                const res = await getMyData();
                if (res.success) {
                    const activeBreak = res.data.breaks.find(b => !b.endTime || b.endTime === null);
                    if (activeBreak) {
                        setBreakActive(true);
                        const duration = Math.floor((new Date() - new Date(activeBreak.startTime)) / 1000);
                        setSeconds(duration > 0 ? duration : 0);
                        const t = setInterval(() => setSeconds(s => s + 1), 1000);
                        setTimer(t);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch breaks", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBreaks();
        return () => {
            if (timer) clearInterval(timer);
        };
    }, []);

    const toggleBreak = async () => {
        if (loading) return;
        setLoading(true);
        try {
            if (!breakActive) {
                const res = await startBreak();
                if (res.success) {
                    setBreakActive(true);
                    const t = setInterval(() => setSeconds(s => s + 1), 1000);
                    setTimer(t);
                }
            } else {
                const res = await endBreak();
                if (res.success) {
                    clearInterval(timer);
                    setTimer(null);
                    setBreakActive(false);
                    alert(`Your break of ${Math.floor(seconds/60)} minutes has been successfully concluded.`);
                    setSeconds(0);
                }
            }
        } catch (err) {
            console.error('Break action failed:', err);
            alert('Operation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Pulse & Break Tracking</h2>
                <p style={{ color: '#64748b' }}>Monitor your wellness and manage break intervals</p>
            </header>

            <div className="grid grid-cols-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', background: 'white' }}>
                    <div style={{ position: 'relative', marginBottom: '2rem' }}>
                        <div style={{ width: '160px', height: '160px', borderRadius: '50%', background: breakActive ? '#fef3c7' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Coffee size={64} style={{ color: breakActive ? '#f59e0b' : '#94a3b8' }} />
                        </div>
                        {breakActive && <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '4px solid #f59e0b', animation: 'spin 4s linear infinite' }}></div>}
                    </div>
                    
                    <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '2rem', fontFamily: 'monospace' }}>{formatTime(seconds)}</div>
                    
                    <button 
                        onClick={toggleBreak} 
                        className="btn btn-primary" 
                        style={{ width: '100%', padding: '1.25rem', justifyContent: 'center', background: breakActive ? '#ef4444' : '#f59e0b', fontSize: '1.125rem' }}
                    >
                        {breakActive ? 'Conclude Break' : 'Begin Break Interval'}
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card">
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Heart size={20} style={{ color: '#ef4444' }} /> Wellness Metrics
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Pulse Rate</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>72 <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>BPM</span></div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Screen Time</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>04:15 <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>hrs</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Sliders size={20} style={{ color: '#4f46e5' }} /> Break Schedule
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.875rem' }}>
                                <span>Morning Refresh</span>
                                <span style={{ fontWeight: 700, color: '#10b981' }}>11:00 AM - 15m</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.875rem' }}>
                                <span style={{ color: '#94a3b8' }}>Lunch Interval</span>
                                <span style={{ fontWeight: 700, color: '#94a3b8' }}>01:30 PM - 45m</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BreakTracking;
