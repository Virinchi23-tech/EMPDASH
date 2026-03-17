import React, { useEffect, useState } from 'react';
import api from '../api/api';
import LeaveTable from '../components/LeaveTable';
import { Plane, Calendar, UserCheck, AlertCircle } from 'lucide-react';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [showApply, setShowApply] = useState(false);
  const [formData, setFormData] = useState({ leave_type: 'Sick', start_date: '', end_date: '', reason: '' });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchLeaves = async () => {
    try {
      const { data } = await api.get(`/leaves?role=${user.role}&id=${user.id}`);
      setLeaves(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves', { ...formData, employee_id: user.id });
      setShowApply(false);
      fetchLeaves();
    } catch (err) {
      alert('Error applying for leave');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/leaves/${id}`, { status });
      fetchLeaves();
    } catch (err) {
      alert('Error updating leave status');
    }
  };

  return (
    <div className="px-4 py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">
            {user.role === 'Staff' ? 'Leave Application Portal' : 'Absence Management Terminal'}
          </h4>
          <p className="text-secondary small mb-0">
            {user.role === 'Staff' ? 'Submit and track your absence requests.' : 'Review and adjudicate team leave protocols.'}
          </p>
        </div>
        {user.role === 'Staff' && (
          <button className="btn btn-primary d-flex align-items-center gap-2 shadow" onClick={() => setShowApply(true)}>
            <Plane size={18} /> Apply for Absence
          </button>
        )}
      </div>

      <div className="stat-card p-0 overflow-hidden">
        <table className="table table-hover mb-0">
          <thead className="bg-light">
            <tr>
              {user.role !== 'Staff' && <th>Employee</th>}
              <th>Protocol Type</th>
              <th>Timeframe</th>
              <th>Status</th>
              {user.role !== 'Staff' && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 ? (
              <tr><td colSpan="5" className="text-center p-4 text-secondary">No active leave protocols found.</td></tr>
            ) : (
              leaves.map(lv => (
                <tr key={lv.id} className="align-middle">
                  {user.role !== 'Staff' && <td>{lv.employee_name}</td>}
                  <td>
                    <span className="fw-bold d-block">{lv.leave_type}</span>
                    <span className="small text-secondary">{lv.reason}</span>
                  </td>
                  <td>{lv.start_date} <span className="mx-1">→</span> {lv.end_date}</td>
                  <td>
                    <span className={`badge rounded-pill ${lv.status === 'Approved' ? 'bg-success' : lv.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                       {lv.status}
                    </span>
                  </td>
                  {user.role !== 'Staff' && (
                    <td>
                      {lv.status === 'Pending' && (
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
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-bold">Leave Classification</label>
                      <select className="form-select" value={formData.leave_type} onChange={e => setFormData({...formData, leave_type: e.target.value})}>
                        <option>Sick</option>
                        <option>Casual</option>
                        <option>Vacation</option>
                        <option>Personal</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Start Date</label>
                      <input type="date" className="form-control" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">End Date</label>
                      <input type="date" className="form-control" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold">Reason / Justification</label>
                      <textarea className="form-control" rows="3" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowApply(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4 fw-bold">Submit Protocol</button>
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
