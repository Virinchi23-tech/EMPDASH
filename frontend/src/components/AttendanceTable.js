import React from 'react';
import { format } from 'date-fns';

const AttendanceTable = ({ attendance }) => {
  const formatTime = (isoString) => (isoString ? format(new Date(isoString), 'h:mm a') : '-');

  return (
    <div className="table-custom shadow-sm border-0 mt-4">
      <table className="table table-hover mb-0">
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Date</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Work Hours</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((att) => (
            <tr key={att.id}>
              <td>{att.employee_name}</td>
              <td>{att.date}</td>
              <td>{formatTime(att.check_in)}</td>
              <td>{formatTime(att.check_out)}</td>
              <td><span className="badge bg-secondary">{att.work_hours.toFixed(2)} hrs</span></td>
              <td>
                <span className={`badge rounded-pill ${att.check_out ? 'bg-success' : 'bg-warning'}`}>
                  {att.check_out ? 'Completed' : 'On-duty'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
