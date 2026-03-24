import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Send, Plus, History, Loader2 } from 'lucide-react';
import { logMeeting, getMyData } from '../../../services/meetingsService';

const MeetingLogging = () => {
    const [meetings, setMeetings] = useState([]);
    const [formData, setFormData] = useState({ title: '', date: '', duration: '', participants: '', description: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            const res = await getMyData();
            if (res.success) {
                setMeetings(res.data.meetings);
            }
        } catch (err) {
            console.error('Failed to fetch meetings:', err);
        }
    };

    const handleLogMeeting = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Prepare submission with numerical conversions
            const submission = {
                ...formData,
                participants: parseInt(formData.participants) || 0,
                duration: formData.duration.toString() // duration is stored as TEXT in DB
            };

            const res = await logMeeting(submission);
            if (res.success) {
                setMeetings([res.meeting, ...meetings]);
                setFormData({ title: '', date: '', duration: '', participants: '', description: '' });
                alert('Meeting log submitted to the enterprise database.');
                fetchMeetings(); // Refresh list to ensure sorting and data parity
            }
        } catch (err) {
            console.error('Meeting log failed:', err);
            alert('Failed to log meeting. Please check backend connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Meeting Protocol Logging</h2>
                <p style={{ color: '#64748b' }}>Log your collaborative research sessions and project reviews</p>
            </header>

            <div className="grid grid-cols-3">
                <div className="card" style={{ gridColumn: 'span 1' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={20} style={{ color: '#4f46e5' }} /> Log New Session
                    </h3>
                    <form onSubmit={handleLogMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', color: '#94a3b8' }}>Session Title</label>
                            <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', color: '#94a3b8' }}>Date</label>
                                <input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', color: '#94a3b8' }}>Duration (min)</label>
                                <input required type="number" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', color: '#94a3b8' }}>Participants</label>
                            <input required type="number" value={formData.participants} onChange={(e) => setFormData({...formData, participants: e.target.value})} style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                        </div>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary" 
                            style={{ width: '100%', padding: '1.25rem', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
                        >
                           {loading ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Submit Log</>}
                        </button>
                    </form>
                </div>

                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <History size={20} style={{ color: '#4f46e5' }} /> Protocol History
                    </h3>
                    <div style={{ borderTop: '1px solid #f1f5f9' }}>
                        {meetings.map((m, i) => (
                            <div key={i} style={{ padding: '1.25rem 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                   <div style={{ background: '#eef2ff', padding: '0.5rem', borderRadius: '8px' }}><Users size={18} style={{ color: '#4f46e5' }} /></div>
                                   <div>
                                       <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{m.title}</div>
                                       <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{m.time} • {m.participants} participants</div>
                                   </div>
                                </div>
                                <div style={{ fontWeight: 800, color: '#4f46e5' }}>{m.duration}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeetingLogging;
