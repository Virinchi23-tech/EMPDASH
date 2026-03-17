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
    try {
      const [breakRes, empRes] = await Promise.all([
        api.get(`/break?role=${user.role}&id=${user.id}`),
        user.role !== 'Staff' ? api.get('/employees') : Promise.resolve({ data: [] })
      ]);
      setBreaks(breakRes.data);
      if (user.role !== 'Staff') setEmployees(empRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (type) => {
    const targetId = user.role === 'Staff' ? user.id : selectedEmp;
    if (!targetId) return alert('Select Employee!');
    try {
      await api.post(`/break/${type}`, { employee_id: targetId });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording break!');
    }
  };

  const formatTime = (iso) => iso ? format(new Date(iso), 'h:mm a') : '-';

  return (
    <div className="px-4 py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">
            {user.role === 'Staff' ? 'My Rest & Recovery' : 'Human Fatigue Management'}
          </h4>
          <p className="text-secondary small mb-0">
            {user.role === 'Staff' ? 'Track your daily break intervals and recharge status.' : 'Oversee employee rest cycles and wellbeing intervals.'}
          </p>
        </div>
        <div className="d-flex gap-2">
          {user.role !== 'Staff' && (
            <select className="form-select" style={{ width: '200px' }} value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)}>
               <option value="">Choose Employee</option>
               {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          )}
          <button className="btn btn-outline-primary fw-bold" onClick={() => handleAction('start')}>
            <Play size={16} className="me-2" /> Start Rest
          </button>
          <button className="btn btn-outline-danger fw-bold" onClick={() => handleAction('end')}>
            <Square size={16} className="me-2" /> Resume Work
          </button>
        </div>
      </div>

      <div className="table-custom shadow-sm border-0">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              {user.role !== 'Staff' && <th>Employee Name</th>}
              <th>Date</th>
              <th>Break Start</th>
              <th>Break End</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {breaks.length === 0 ? (
              <tr><td colSpan="5" className="text-center p-4 text-secondary">No rest cycles logged today.</td></tr>
            ) : (
              breaks.map(br => (
                <tr key={br.id} className="align-middle">
                  {user.role !== 'Staff' && (
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <User size={14} className="text-secondary" /> {br.employee_name}
                      </div>
                    </td>
                  )}
                  <td>{br.date}</td>
                  <td>{formatTime(br.break_start)}</td>
                  <td>{formatTime(br.break_end)}</td>
                  <td>
                    <span className="badge bg-light text-primary border" style={{ fontSize: '0.9rem' }}>
                      {br.break_duration} min
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
