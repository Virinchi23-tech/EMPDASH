import React from 'react';
import { Edit2, Trash2, Mail, Briefcase, MapPin } from 'lucide-react';

const EmployeeTable = ({ employees, onEdit, onDelete }) => {
  return (
    <div className="table-custom shadow-sm border-0">
      <table className="table table-hover mb-0">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Role & Dept</th>
            <th>Level</th>
            <th>Manager</th>
            <th>Salary</th>
            <th>Joining Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id} className="align-middle">
              <td>
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>
                    {emp.name.charAt(0)}
                  </div>
                  <div className="fw-bold text-dark">{emp.name}</div>
                </div>
              </td>
              <td>
                <div className="text-dark small"><Briefcase size={14} className="me-1" /> {emp.role}</div>
                <div className="text-secondary small"><MapPin size={14} className="me-1" /> {emp.department}</div>
              </td>
              <td>
                <span className={`badge ${emp.employee_level === 'Admin' ? 'bg-danger' : emp.employee_level === 'Manager' ? 'bg-primary' : 'bg-secondary'}`}>
                  {emp.employee_level}
                </span>
              </td>
              <td className="text-secondary small">
                {emp.manager_name || 'Direct / CEO'}
              </td>
              <td className="fw-bold">${emp.salary.toLocaleString()}</td>
              <td className="text-secondary">{emp.joining_date}</td>
              <td>
                <div className="d-flex gap-2">
                  <button onClick={() => onEdit(emp)} className="btn btn-sm btn-outline-primary rounded-circle p-2">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => onDelete(emp.id)} className="btn btn-sm btn-outline-danger rounded-circle p-2">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
