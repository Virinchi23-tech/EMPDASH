import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Video, Plus, Calendar, Clock, Bookmark } from 'lucide-react';

const MeetingsLog = () => {
  const [meetings, setMeetings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', meeting_date: '', duration: '', notes: '' });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchMeetings = async () => {
    try {
      const { data } = await api.get(`/meetings?role=${user.role}&id=${user.id}`);
      setMeetings(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/meetings', { ...formData, employee_id: user.id });
      setShowModal(false);
      setFormData({ title: '', meeting_date: '', duration: '', notes: '' });
      fetchMeetings();
    } catch (err) {
      alert('Error logging meeting');
    }
  };

  return (
    <div className="px-4 py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Productivity & Meeting Logs</h4>
          <p className="text-secondary small mb-0">Track internal and external engagement sessions.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2 shadow" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Entry
        </button>
      </div>

      <div className="stat-card p-0 overflow-hidden">
        <table className="table table-hover mb-0">
          <thead className="bg-light">
            <tr>
              {user.role !== 'Staff' && <th>Employee</th>}
              <th>Topic / Title</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {meetings.length === 0 ? (
              <tr><td colSpan="5" className="text-center p-4">No sessions logged yet.</td></tr>
            ) : (
              meetings.map(m => (
                <tr key={m.id}>
                  {user.role !== 'Staff' && <td>{m.employee_name}</td>}
                  <td className="fw-bold">{m.title}</td>
                  <td>{m.meeting_date}</td>
                  <td>{m.duration} mins</td>
                  <td><span className="badge bg-success">Concluded</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0" style={{ borderRadius: '15px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold">Log New Productivity Session</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-bold text-secondary">Meeting Title</label>
                      <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Session Date</label>
                      <input type="date" className="form-control" value={formData.meeting_date} onChange={e => setFormData({...formData, meeting_date: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Duration (mins)</label>
                      <input type="number" className="form-control" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold text-secondary">Session Notes</label>
                      <textarea className="form-control" rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4 fw-bold">Save Session</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsLog;
