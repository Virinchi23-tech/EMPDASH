import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Coffee, Play, Square, User } from 'lucide-react';
import { format } from 'date-fns';

const BreakTracker = () => {
  const [breaks, setBreaks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      console.log('[BreakTracker] Fetching rest cycle data...');
      const breakUrl = (user.role === 'admin' || user.role === 'manager') 
        ? `/breaks?role=${user.role}` 
        : `/breaks?role=${user.role}&user_id=${user.id}`;
      const [breakRes, userRes] = await Promise.all([
        api.get(breakUrl),
        user.role !== 'employee' ? api.get('/users') : Promise.resolve({ data: [] })
      ]);
      setBreaks(breakRes.data);
      if (user.role !== 'employee') setEmployees(userRes.data);
    } catch (err) {
      console.error('[BreakTracker] Fetch Error:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (type) => {
    const targetId = user.role === 'employee' ? user.id : selectedEmp;
    if (!targetId) return alert('Select User Identity!');
    try {
      console.log(`[BreakTracker] ${type === 'start' ? 'Starting' : 'Ending'} rest cycle for ID: ${targetId}`);
      const endpoint = type === 'start' ? '/breaks/start' : '/breaks/end';
      await api.post(endpoint, { user_id: targetId });
      fetchData();
    } catch (err) {
      console.error('[BreakTracker] Action Error:', err);
      alert(err.response?.data?.message || 'Error recording rest cycle!');
    }
  };

  const formatTime = (iso) => iso ? format(new Date(iso), 'h:mm a MMM d') : '-';

  return (
    <div className="px-4 py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">
            {user.role === 'employee' ? 'My Rest & Recovery' : 'Human Fatigue Management'}
          </h4>
          <p className="text-secondary small mb-0">
            {user.role === 'employee' ? 'Track your daily break intervals and recharge status.' : 'Oversee user rest cycles and wellbeing intervals.'}
          </p>
        </div>
        <div className="d-flex gap-2">
          {user.role !== 'employee' && (
            <select className="form-select" style={{ width: '200px' }} value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)}>
               <option value="">Choose User</option>
               {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          )}
          <button className="btn btn-outline-primary fw-bold px-3 d-flex align-items-center gap-2" onClick={() => handleAction('start')}>
            <Play size={16} /> Start Rest
          </button>
          <button className="btn btn-outline-danger fw-bold px-3 d-flex align-items-center gap-2" onClick={() => handleAction('end')}>
            <Square size={16} /> Resume Work
          </button>
        </div>
      </div>

      <div className="table-custom shadow-sm border-0">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              {user.role !== 'employee' && <th>User Identity</th>}
              <th>Break Start</th>
              <th>Break End</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {breaks.length === 0 ? (
              <tr><td colSpan="5" className="text-center p-5 text-secondary">No active rest cycles logged today.</td></tr>
            ) : (
              breaks.map(br => (
                <tr key={br.id} className="align-middle">
                  {user.role !== 'employee' && (
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="fw-bold">{br.user_name}</div>
                      </div>
                    </td>
                  )}
                  <td>{formatTime(br.break_start)}</td>
                  <td>{formatTime(br.break_end)}</td>
                  <td>
                     <span className={`badge rounded-pill ${br.break_end ? 'bg-success' : 'bg-warning'}`}>
                        {br.break_end ? 'RECHARGED' : 'IN RECOVERY'}
                     </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BreakTracker;
