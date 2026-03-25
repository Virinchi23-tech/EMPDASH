import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { DollarSign, Award, Send } from 'lucide-react';

const BonusManagement = () => {
  const [bonuses, setBonuses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({ user_id: '', amount: '', reason: '' });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      console.log('[BonusManagement] Fetching reward history and eligibility...');
      const [bonusRes, userRes] = await Promise.all([
        api.get(`/bonuses?role=${user.role}&id=${user.id}`),
        api.get(user.role === 'admin' ? '/users' : `/users?role=manager&id=${user.id}`)
      ]);
      setBonuses(bonusRes.data);
      setEmployees(userRes.data);
    } catch (err) {
      console.error('[BonusManagement] Fetch Error:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(`[BonusManagement] Issuing grant of $${formData.amount} to ID: ${formData.user_id}`);
      await api.post('/bonuses', formData);
      fetchData();
      setFormData({ user_id: '', amount: '', reason: '' });
      alert('Reward protocol synchronized successfully.');
    } catch (err) {
      console.error('[BonusManagement] Grant Error:', err);
      alert('Error assigning bonus: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="px-4 py-3">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 className="fw-bold mb-1">Performance Rewards</h4>
          <p className="text-secondary small">Financial incentives and recognitions management.</p>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-5">
           <div className="stat-card shadow-sm border-0 p-4 rounded-4 bg-white">
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="rounded-circle bg-success text-white p-2 d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                  <Award size={20} />
                </div>
                <h6 className="fw-bold mb-0">Assign New Reward</h6>
              </div>
              <form onSubmit={handleSubmit}>
                 <div className="mb-3">
                   <label className="form-label small fw-bold text-secondary">Select Recipient</label>
                   <select className="form-select" value={formData.user_id} onChange={e => setFormData({...formData, user_id: e.target.value})} required>
                     <option value="">-- Identify Protocol --</option>
                     {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.email})</option>)}
                   </select>
                 </div>
                 <div className="mb-3">
                   <label className="form-label small fw-bold text-secondary">Bonus Amount ($)</label>
                   <div className="input-group shadow-none">
                     <span className="input-group-text bg-light border-end-0">$</span>
                     <input type="number" className="form-control bg-light border-start-0" placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                   </div>
                 </div>
                 <div className="mb-4">
                   <label className="form-label small fw-bold text-secondary">Reward Justification</label>
                   <textarea className="form-control bg-light" rows="3" placeholder="Performance description..." value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} required></textarea>
                 </div>
                 <button className="btn btn-success w-100 py-3 d-flex align-items-center justify-content-center gap-2 shadow fw-bold">
                   <DollarSign size={18} /> {user.role === 'admin' ? 'Process Corporate Grant' : 'Process Team Reward'}
                 </button>
              </form>
           </div>
        </div>
        <div className="col-md-7">
           <h6 className="fw-bold text-secondary mb-3 text-uppercase small" style={{letterSpacing: '0.05em'}}>Recent Grant History</h6>
           <div className="table-custom shadow-sm border-0 p-0 overflow-hidden">
              <table className="table table-hover mb-0">
                 <thead className="bg-light">
                    <tr>
                      <th>Recipient</th>
                      <th>Grant Type</th>
                      <th>Amount</th>
                      <th>Synchronized</th>
                    </tr>
                 </thead>
                 <tbody>
                    {bonuses.length === 0 ? (
                       <tr><td colSpan="4" className="text-center p-5 text-secondary">No rewards logged in history.</td></tr>
                    ) : (
                       bonuses.map(bn => (
                          <tr key={bn.id} className="align-middle">
                             <td>{bn.user_name}</td>
                             <td className="small text-secondary">{bn.reason}</td>
                             <td className="fw-bold text-success">${bn.amount}</td>
                             <td className="small">{bn.created_at ? new Date(bn.created_at).toLocaleDateString() : 'N/A'}</td>
                          </tr>
                       ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BonusManagement;
