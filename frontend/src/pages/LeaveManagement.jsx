import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Plane, Calendar, UserCheck, AlertCircle } from 'lucide-react';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [showApply, setShowApply] = useState(false);
  const [formData, setFormData] = useState({ leave_type: 'Sick', start_date: '', end_date: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchLeaves = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      console.log('[LeaveManagement] Fetching leave records...');
      const url = (user.role === 'admin' || user.role === 'manager') 
        ? `/leaves?role=${user.role}` 
        : `/leaves?role=${user.role}&id=${user.id}`;
      const { data } = await api.get(url);
      setLeaves(data);
    } catch (err) {
      console.error('[LeaveManagement] Fetch Error:', err);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      console.log('[LeaveManagement] Submitting new absence request...');
      
      // Map frontend fields (start/end) to backend (from/to)
      const submission = {
        user_id: user.id,
        leave_type: formData.leave_type,
        from_date: formData.start_date,
        to_date: formData.end_date,
        reason: formData.reason
      };

      await api.post('/leaves', submission);
      setShowApply(false);
      fetchLeaves();
      setFormData({ leave_type: 'Sick', start_date: '', end_date: '', reason: '' });
    } catch (err) {
      console.error('[LeaveManagement] Apply Error:', err);
      setError(err.response?.data?.message || 'Protocol Failure: Unable to record absence.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      console.log(`[LeaveManagement] Updating status to ${status} for record ID: ${id}`);
      await api.put(`/leaves/${id}`, { status });
      fetchLeaves();
    } catch (err) {
      console.error('[LeaveManagement] Status Update Error:', err);
      alert('Error updating leave status');
    }
  };

  return (
    <div className="px-4 py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">
            {user.role === 'employee' ? 'Leave Application Portal' : 'Absence Management Terminal'}
          </h4>
          <p className="text-secondary small mb-0">
            {user.role === 'employee' ? 'Submit and track your absence requests.' : 'Review and adjudicate team leave protocols.'}
          </p>
        </div>
        {user.role === 'employee' && (
          <button className="btn btn-primary d-flex align-items-center gap-2 shadow" onClick={() => setShowApply(true)}>
            <Plane size={18} /> Apply for Absence
          </button>
        )}
      </div>

      <div className="table-custom shadow-sm border-0">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              {user.role !== 'employee' && <th>Employee Identity</th>}
              <th>Protocol Type</th>
              <th>Timeframe</th>
              <th>Status</th>
              {user.role !== 'employee' && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 ? (
              <tr><td colSpan="5" className="text-center p-5 text-secondary">No active leave protocols found.</td></tr>
            ) : (
              leaves.map(lv => (
                <tr key={lv.id} className="align-middle">
                  {user.role !== 'employee' && <td>{lv.user_name}</td>}
                  <td>
                    <span className="fw-bold d-block">{lv.leave_type}</span>
                    <span className="small text-secondary">{lv.reason}</span>
                  </td>
                  <td>{lv.from_date} <span className="mx-1">→</span> {lv.to_date}</td>
                  <td>
                    <span className={`badge rounded-pill ${lv.status?.toLowerCase() === 'approved' ? 'bg-success' : lv.status?.toLowerCase() === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                       {lv.status?.toUpperCase()}
                    </span>
                  </td>
                  {user.role !== 'employee' && (
                    <td>
                      {lv.status?.toLowerCase() === 'pending' && (
                        <div className="d-flex gap-2">
                          <button onClick={() => updateStatus(lv.id, 'Approved')} className="btn btn-sm btn-success">Approve</button>
                          <button onClick={() => updateStatus(lv.id, 'Rejected')} className="btn btn-sm btn-danger">Reject</button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showApply && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0" style={{ borderRadius: '15px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold">New Leave Protocol</h5>
                <button type="button" className="btn-close" onClick={() => setShowApply(false)}></button>
              </div>
              <form onSubmit={handleApply}>
                <div className="modal-body">
                  {error && (
                    <div className="alert alert-danger small py-2 mb-3">
                      <span className="fw-bold">SYNC ERROR:</span> {error}
                    </div>
                  )}
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-bold text-secondary">Leave Classification</label>
                      <select className="form-select" value={formData.leave_type} onChange={e => setFormData({...formData, leave_type: e.target.value})}>
                        <option>Sick</option>
                        <option>Casual</option>
                        <option>Vacation</option>
                        <option>Personal</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Start Date</label>
                      <input type="date" className="form-control" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">End Date</label>
                      <input type="date" className="form-control" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold text-secondary">Reason / Justification</label>
                      <textarea className="form-control" rows="3" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} placeholder="Describe protocol requirement..."></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowApply(false)} disabled={loading}>Abort</button>
                  <button type="submit" className="btn btn-primary px-4 fw-bold shadow" disabled={loading}>
                    {loading ? 'INITIALIZING...' : 'Initialize Protocol'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
