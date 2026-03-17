import React, { useEffect, useState } from 'react';
import api from '../api/api';
import AttendanceTable from '../components/AttendanceTable';
import { LogIn, LogOut, CheckCircle, Play, Square } from 'lucide-react';
import { format } from 'date-fns';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = async () => {
    try {
      const [attRes, empRes] = await Promise.all([
        api.get(`/attendance?role=${user.role}&id=${user.id}`),
        user.role !== 'Staff' ? api.get('/employees') : Promise.resolve({ data: [] })
      ]);
      setAttendance(attRes.data);
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
    if (!targetId) return alert('Please select an employee!');
    
    try {
      await api.post(`/attendance/${type}`, { employee_id: targetId });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
    }
  };

  const concludeSession = async (id) => {
    try {
      await api.put(`/attendance/conclude/${id}`);
      fetchData();
    } catch (err) {
      alert('Error concluding session');
    }
  };

  return (
    <div className="px-4 py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">
            {user.role === 'Staff' ? 'My Work Sessions' : 'Workforce Presence Tracker'}
          </h4>
          <p className="text-secondary small mb-0">
            {user.role === 'Staff' ? 'Log your daily work and conclude sessions.' : 'Monitor team activity and session progress.'}
          </p>
        </div>

        <div className="d-flex gap-2">
          {user.role !== 'Staff' && (
            <select className="form-select" value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)}>
               <option value="">Select Employee</option>
               {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          )}
          <button className="btn btn-success d-flex align-items-center gap-2 shadow-sm" onClick={() => handleAction('checkin')}>
            <Play size={18} /> {user.role === 'Staff' ? 'Start Work' : 'Check-in'}
          </button>
          <button className="btn btn-warning d-flex align-items-center gap-2 shadow-sm" onClick={() => handleAction('checkout')}>
            <Square size={18} /> {user.role === 'Staff' ? 'Stop Work' : 'Check-out'}
          </button>
        </div>
      </div>

      <div className="table-custom shadow-sm border-0">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              {user.role !== 'Staff' && <th>Employee</th>}
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
              <th>Hours</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((att) => (
              <tr key={att.id} className="align-middle">
                {user.role !== 'Staff' && <td>{att.employee_name}</td>}
                <td>{att.date}</td>
                <td>{att.check_in ? format(new Date(att.check_in), 'h:mm a') : '-'}</td>
                <td>{att.check_out ? format(new Date(att.check_out), 'h:mm a') : '-'}</td>
                <td>
                  <span className={`badge rounded-pill ${att.status === 'Concluded' ? 'bg-success' : 'bg-primary'}`}>
                    {att.status || 'Active'}
                  </span>
                </td>
                <td className="fw-bold">
                  {att.work_hours?.toFixed(2) || '0.00'} hrs
                </td>
                <td>
                  {att.status !== 'Concluded' && (
                    <button 
                      className="btn btn-sm btn-outline-success d-flex align-items-center gap-1 shadow-sm"
                      onClick={() => concludeSession(att.id)}
                    >
                      <CheckCircle size={14} /> Conclude Session
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
