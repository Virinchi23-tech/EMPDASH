import React, { useEffect, useState } from 'react';
import api from '../api/api';
import BonusTable from '../components/BonusTable';
import { DollarSign, Award, Send } from 'lucide-react';

const BonusManagement = () => {
  const [bonuses, setBonuses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({ employee_id: '', bonus_amount: '', bonus_reason: '' });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = async () => {
    try {
      const [bonusRes, empRes] = await Promise.all([
        api.get(`/bonuses?role=${user.role}&id=${user.id}`),
        api.get(user.role === 'Admin' ? '/employees' : `/employees?role=Manager&id=${user.id}`)
      ]);
      setBonuses(bonusRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bonuses', formData);
      fetchData();
      setFormData({ employee_id: '', bonus_amount: '', bonus_reason: '' });
    } catch (err) {
      alert('Error assigned bonus');
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
           <div className="stat-card">
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="rounded-circle bg-success text-white p-2"><Award size={20} /></div>
                <h6 className="fw-bold mb-0">Assign New Reward</h6>
              </div>
              <form onSubmit={handleSubmit}>
                 <div className="mb-3">
                   <label className="form-label small fw-bold">Select Recipient</label>
                   <select className="form-select" value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} required>
                     <option value="">-- Employee --</option>
                     {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                   </select>
                 </div>
                 <div className="mb-3">
                   <label className="form-label small fw-bold">Bonus Amount ($)</label>
                   <div className="input-group">
                     <span className="input-group-text">$</span>
                     <input type="number" className="form-control" placeholder="0.00" value={formData.bonus_amount} onChange={e => setFormData({...formData, bonus_amount: e.target.value})} required />
                   </div>
                 </div>
                 <div className="mb-4">
                   <label className="form-label small fw-bold">Reward Justification</label>
                   <textarea className="form-control" rows="3" placeholder="Performance description..." value={formData.bonus_reason} onChange={e => setFormData({...formData, bonus_reason: e.target.value})} required></textarea>
                 </div>
                 {/* Role based button text */}
                 <button className="btn btn-success w-100 py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm">
                   <DollarSign size={18} /> {user.role === 'Admin' ? 'Process Corporate Grant' : 'Process Team Reward'}
                 </button>
              </form>
           </div>
        </div>
        <div className="col-md-7">
           <h6 className="fw-bold text-secondary mb-3">Recent Grant History</h6>
           <BonusTable bonuses={bonuses} />
        </div>
      </div>
    </div>
  );
};

export default BonusManagement;
