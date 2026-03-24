import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, ArrowUpRight } from 'lucide-react';
import { getTeamData } from '@/services/usersService';
import { useAuth } from '@/context/AuthContext';

const ProductivityReports = () => {
    const { user } = useAuth();
    const [teamStats, setTeamStats] = useState({
        totalTasks: 0,
        avgProductivity: '0%',
        activeMembers: 0,
        completedProjects: 0
    });
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const fetchTeamData = async () => {
            const data = await getTeamData(user.role);
            const activeM = data.users.filter(u => u.role !== 'Admin').length;
            const completedSessions = data.sessions.filter(s => s.status === 'completed').length;
            setTeamStats({
                totalTasks: data.meetings.length + data.leaves.length,
                avgProductivity: (activeM > 0 ? Math.min(100, (completedSessions / (activeM * 5)) * 100).toFixed(1) : 0) + '%',
                activeMembers: activeM,
                completedProjects: completedSessions 
            });
            setMembers(data.users.filter(u => u.role !== 'Admin').map(u => ({
                name: u.name,
                score: Math.floor(Math.random() * 20) + 80, // Replace with real computed score later
                trend: Math.random() > 0.5 ? 'up' : 'down'
            })));
        };
        fetchTeamData();
    }, [user.role]);

    const chartData = [
        { day: 'Mon', value: 85 },
        { day: 'Tue', value: 92 },
        { day: 'Wed', value: 88 },
        { day: 'Thu', value: 95 },
        { day: 'Fri', value: 91 },
    ];

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Team Productivity Reports</h2>
                    <p style={{ color: '#64748b' }}>Detailed analytics and performance metrics for your R&D section</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-outline"><Calendar size={16} /> Last 7 Days</button>
                    <button className="btn btn-primary" onClick={() => alert('Generating productivity report CSV...')}>Export CSV</button>
                </div>
            </header>

            <div className="grid grid-cols-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ marginBottom: 0 }}>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Avg. Productivity</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>{teamStats.avgProductivity}</div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                        <TrendingUp size={12} /> +2.4% <span style={{ color: '#94a3b8' }}>vs last week</span>
                    </div>
                </div>
                <div className="card" style={{ marginBottom: 0 }}>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Team</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{teamStats.activeMembers} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500 }}>Members</span></div>
                </div>
                <div className="card" style={{ marginBottom: 0 }}>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Tasks Done</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{teamStats.totalTasks}</div>
                </div>
                <div className="card" style={{ marginBottom: 0 }}>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Projects</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{teamStats.completedProjects}</div>
                </div>
            </div>

            <div className="grid grid-cols-3">
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <TrendingUp size={20} style={{ color: '#4f46e5' }} /> Weekly Efficiency Curve
                    </h3>
                    <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '2rem', position: 'relative' }}>
                        {/* Mock Chart */}
                        <div style={{ position: 'absolute', inset: 0, borderLeft: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}></div>
                        {chartData.map((d, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', zIndex: 1 }}>
                                <div style={{ 
                                    width: '40px', 
                                    height: `${d.value * 2}px`, 
                                    background: 'linear-gradient(to top, #4f46e5, #818cf8)', 
                                    borderRadius: '6px 6px 0 0',
                                    transition: 'height 1s ease-out'
                                }}></div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Top Performers</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {members.length > 0 ? members.slice(0, 5).map((p, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <img src={`https://ui-avatars.com/api/?name=${p.name}&background=random`} style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{p.name}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: p.score > 94 ? '#10b981' : '#4f46e5' }}>
                                    {p.score}% <ArrowUpRight size={14} style={{ opacity: p.trend === 'up' ? 1 : 0 }} />
                                </div>
                            </div>
                        )) : (
                            <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No team members available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductivityReports;
