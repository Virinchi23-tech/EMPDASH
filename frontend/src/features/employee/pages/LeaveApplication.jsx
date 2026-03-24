import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getLeaves, addLeave } from '@/services/leavesService';
import { Calendar, Send, History, CheckCircle, Clock } from 'lucide-react';

const LeaveApplication = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [formData, setFormData] = useState({ type: 'Sick Leave', reason: '', date: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = async () => {
    const data = await getLeaves(user.role, user.id);
    setLeaves(data);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await addLeave({ ...formData, userId: user.id, name: user.name });
    if (result.success) {
      setFormData({ type: 'Sick Leave', reason: '', date: '' });
      fetchLeaves();
      alert('Leave application submitted successfully!');
    }
    setSubmitting(false);
  };

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Leave Application</h2>
        <p style={{ color: '#64748b' }}>Apply for time off and track your status</p>
      </header>

      <div className="grid grid-cols-3">
        {/* Application Form */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>New Request</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Leave Type</label>
              <select 
                value={formData.type} 
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              >
                <option>Sick Leave</option>
                <option>Annual Leave</option>
                <option>Maternity Leave</option>
                <option>Unpaid Leave</option>
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Select Date</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Reason</label>
              <textarea 
                rows="4" 
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
              <Send size={18} /> {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>

        {/* History List */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} /> Application History
          </h3>
          <div style={{ borderTop: '1px solid #f1f5f9' }}>
            {leaves.length === 0 ? (
              <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No leave applications found.</p>
            ) : (
              leaves.map(leave => (
                <div key={leave.id} style={{ padding: '1rem 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{leave.type}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>For Date: {leave.time || leave.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${leave.status === 'Approved' ? 'badge-success' : leave.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                      {leave.status === 'Approved' ? <CheckCircle size={10} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> : ''}
                      {leave.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveApplication;
