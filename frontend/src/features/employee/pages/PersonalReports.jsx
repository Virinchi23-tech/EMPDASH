import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Calendar, CheckCircle, PieChart, Target, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getMyData } from '../../../services/meetingsService';

const PersonalReports = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ sessions: 0, breaks: 0, meetings: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getMyData();
                if (res.success) {
                    setStats({
                        sessions: res.data.sessions.length,
                        breaks: res.data.breaks.length,
                        meetings: res.data.meetings.length
                    });
                }
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
            <Loader2 className="animate-spin" />
        </div>
    );

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Personal Productivity Audit</h2>
                    <p style={{ color: '#64748b' }}>Individual performance metrics across all research protocols</p>
                </div>
                <button className="btn btn-primary">Download Statement</button>
            </header>

            <div className="grid grid-cols-3">
                <div className="card" style={{ gridColumn: 'span 2' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <BarChart3 size={20} style={{ color: '#4f46e5' }} /> Weekly Trends
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '99px', background: '#eef2ff', color: '#4f46e5' }}>Current Week</span>
                        </div>
                   </div>

                   <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '3rem', position: 'relative' }}>
                        {/* More Mock Charting */}
                        <div style={{ position: 'absolute', bottom: '2.5rem', left: 0, right: 0, height: '1px', background: '#f1f5f9' }}></div>
                        {[
                            { day: 'Mon', h: 180 }, { day: 'Tue', h: 220 }, { day: 'Wed', h: 200 }, 
                            { day: 'Thu', h: 240 }, { day: 'Fri', h: 190 }, { day: 'Sat', h: 40 }, 
                            { day: 'Sun', h: 0 }
                        ].map((d, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ 
                                    width: '30px', 
                                    height: `${d.h}px`, 
                                    background: i < 5 ? '#4f46e5' : '#e2e8f0', 
                                    borderRadius: '6px' 
                                }}></div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>{d.day}</span>
                            </div>
                        ))}
                   </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card">
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Target size={18} style={{ color: '#4f46e5' }} /> Protocol Goals
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>Weekly Hours</span>
                                    <span style={{ color: '#4f46e5', fontWeight: 800 }}>32 / 40h</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: '#eef2ff', borderRadius: '4px' }}>
                                    <div style={{ width: '80%', height: '100%', background: '#4f46e5', borderRadius: '4px' }}></div>
                                </div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>Sync Meetings</span>
                                    <span style={{ color: '#10b981', fontWeight: 800 }}>{stats.meetings} Logged</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: '#dcfce7', borderRadius: '4px' }}>
                                    <div style={{ width: '100%', height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                                </div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>Breaks Taken</span>
                                    <span style={{ color: '#f59e0b', fontWeight: 800 }}>{stats.breaks}</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: '#fef3c7', borderRadius: '4px' }}>
                                    <div style={{ width: '100%', height: '100%', background: '#f59e0b', borderRadius: '4px' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ background: '#4f46e5', color: 'white', border: 'none' }}>
                        <div style={{ opacity: 0.8, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Month Activity</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>{stats.sessions} Sessions</div>
                        <div style={{ fontSize: '0.8125rem', opacity: 0.9 }}>Data synced with Turso cloud storage.</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalReports;
