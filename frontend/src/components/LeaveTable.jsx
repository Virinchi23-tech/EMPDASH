import React from 'react';

const LeaveTable = ({ leaves, onStatusUpdate }) => {
  return (
    <div className="table-custom shadow-sm border-0">
      <table className="table table-hover mb-0">
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Leave Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave) => (
            <tr key={leave.id}>
              <td>{leave.employee_name}</td>
              <td><span className="badge bg-info text-dark">{leave.leave_type}</span></td>
              <td>{leave.start_date}</td>
              <td>{leave.end_date}</td>
              <td style={{ maxWidth: '200px' }} className="truncate-text">{leave.reason}</td>
              <td>
                <span className={`badge ${leave.status === 'Approved' ? 'bg-success' : leave.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                  {leave.status}
                </span>
              </td>
              <td>
                {leave.status === 'Pending' && (
                  <div className="d-flex gap-2">
                    <button onClick={() => onStatusUpdate(leave.id, 'Approved')} className="btn btn-sm btn-success">Approve</button>
                    <button onClick={() => onStatusUpdate(leave.id, 'Rejected')} className="btn btn-sm btn-danger">Reject</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveTable;
