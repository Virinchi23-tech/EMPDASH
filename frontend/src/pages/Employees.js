import React, { useEffect, useState } from 'react';
import api from '../api/api';
import EmployeeTable from '../components/EmployeeTable';
import { Plus, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [filterLevel, setFilterLevel] = useState('All');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [currentEmp, setCurrentEmp] = useState({ 
    username: '',
    password: '',
    name: '', 
    email: '', 
    role: '', 
    department: '', 
    salary: '', 
    joining_date: '',
    employee_level: 'Staff',
    manager_id: ''
  });

  const fetchEmployees = async () => {
    try {
      const url = user.role === 'Admin' ? '/employees' : `/employees?role=Manager&id=${user.id}`;
      const { data } = await api.get(url);
      setEmployees(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchManagers = async () => {
    try {
      const { data } = await api.get('/employees/managers');
      setManagers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchManagers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...currentEmp };
      if (payload.manager_id === '') payload.manager_id = null;
      
      if (editMode) {
        await api.put(`/employees/${currentEmp.id}`, payload);
      } else {
        await api.post('/employees', payload);
      }
      setShowModal(false);
      fetchEmployees();
      fetchManagers();
      resetForm();
    } catch (err) {
      alert('Error saving employee: ' + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setCurrentEmp({ 
      username: '',
      password: '',
      name: '', 
      email: '', 
      role: '', 
      department: '', 
      salary: '', 
      joining_date: '',
      employee_level: 'Staff',
      manager_id: ''
    });
  };

  const handleEdit = (emp) => {
    setEditMode(true);
    setCurrentEmp({ ...emp, manager_id: emp.manager_id || '', password: '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        fetchEmployees();
      } catch (err) {
        alert('Error deleting employee');
      }
    }
  };

  const viewProtocolDetails = (id) => {
    navigate(`/employee/${id}`);
  };

  const filteredEmployees = employees.filter(emp => 
    filterLevel === 'All' ? true : emp.employee_level === filterLevel
  );

  return (
    <div className="px-4 py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">
            {user.role === 'Admin' ? 'Enterprise User Management' : 'Team Directory'}
          </h4>
          <p className="text-secondary small mb-0">Total of {employees.length} records available.</p>
        </div>
        <div className="d-flex gap-3">
          <select 
            className="form-select" 
            style={{ width: '150px' }}
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="All">All Levels</option>
            <option value="Staff">Staff Only</option>
            <option value="Manager">Managers</option>
            <option value="Admin">Administrators</option>
          </select>
          {user.role === 'Admin' && (
            <button className="btn btn-primary d-flex align-items-center gap-2 shadow" onClick={() => { setEditMode(false); resetForm(); setShowModal(true); }}>
              <Plus size={18} /> New User
            </button>
          )}
        </div>
      </div>

      <div className="table-custom shadow-sm border-0">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>Protocol Identity</th>
              <th>Assignment</th>
              <th>Access Level</th>
              <th>Reporting To</th>
              <th>Security Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => (
              <tr key={emp.id} className="align-middle">
                <td>
                  <div className="fw-bold mb-0">{emp.name}</div>
                  <div className="small text-secondary">{emp.email}</div>
                </td>
                <td>
                  <div className="text-dark small">{emp.role}</div>
                  <div className="text-secondary small">{emp.department}</div>
                </td>
                <td>
                  <span className={`badge ${emp.employee_level === 'Admin' ? 'bg-danger' : emp.employee_level === 'Manager' ? 'bg-primary' : 'bg-secondary'}`}>
                    {emp.employee_level}
                  </span>
                </td>
                <td>{emp.manager_name || 'Direct / CEO'}</td>
                <td>
                  <div className="d-flex gap-2">
                    {/* Role-Based Protocol Details Button */}
                    <button 
                      className="btn btn-sm btn-primary px-3 shadow-sm"
                      onClick={() => viewProtocolDetails(emp.id)}
                    >
                      PROTOCOL DETAILS
                    </button>
                    {user.role === 'Admin' && (
                      <>
                        <button onClick={() => handleEdit(emp)} className="btn btn-sm btn-outline-secondary">Edit</button>
                        <button onClick={() => handleDelete(emp.id)} className="btn btn-sm btn-outline-danger">Delete</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0" style={{ borderRadius: '15px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold">{editMode ? 'Edit User Configuration' : 'Create New User Protocol'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Login Username</label>
                      <input type="text" className="form-control" value={currentEmp.username} onChange={e => setCurrentEmp({...currentEmp, username: e.target.value})} required={!editMode} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">{editMode ? 'New Password (Optional)' : 'Login Password'}</label>
                      <input type="password" className="form-control" value={currentEmp.password} onChange={e => setCurrentEmp({...currentEmp, password: e.target.value})} required={!editMode} />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label small fw-bold">Display Name</label>
                      <input type="text" className="form-control" value={currentEmp.name} onChange={e => setCurrentEmp({...currentEmp, name: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Email</label>
                      <input type="email" className="form-control" value={currentEmp.email} onChange={e => setCurrentEmp({...currentEmp, email: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Job Role</label>
                      <input type="text" className="form-control" value={currentEmp.role} onChange={e => setCurrentEmp({...currentEmp, role: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Department</label>
                      <input type="text" className="form-control" value={currentEmp.department} onChange={e => setCurrentEmp({...currentEmp, department: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Access Level</label>
                      <select className="form-select" value={currentEmp.employee_level} onChange={e => setCurrentEmp({...currentEmp, employee_level: e.target.value})} required>
                        <option value="Staff">Staff</option>
                        <option value="Manager">Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Reporting Manager</label>
                      <select className="form-select" value={currentEmp.manager_id} onChange={e => setCurrentEmp({...currentEmp, manager_id: e.target.value})}>
                        <option value="">Direct / None</option>
                        {managers.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Annual Salary ($)</label>
                      <input type="number" className="form-control" value={currentEmp.salary} onChange={e => setCurrentEmp({...currentEmp, salary: e.target.value})} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold">Joining Date</label>
                      <input type="date" className="form-control" value={currentEmp.joining_date} onChange={e => setCurrentEmp({...currentEmp, joining_date: e.target.value})} required />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4 fw-bold">Execute Update</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
