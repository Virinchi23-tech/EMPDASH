import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { 
  User, 
  Mail, 
  Briefcase, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const { data } = await api.get(`/employees/${id}`);
        setEmployee(data);
      } catch (err) {
        console.error('Error fetching employee:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  if (loading) return <div className="p-5 text-center">Loading Protocol Details...</div>;
  if (!employee) return <div className="p-5 text-center text-danger">Employee Protocol Not Found</div>;

  return (
    <div className="px-4 py-3">
      <button 
        className="btn btn-light mb-4 d-flex align-items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft size={18} /> Back to Directory
      </button>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="stat-card text-center py-5">
            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '120px', height: '120px', fontSize: '3rem', fontWeight: 'bold' }}>
              {employee.name.charAt(0)}
            </div>
            <h3 className="fw-bold mb-1">{employee.name}</h3>
            <p className="text-secondary mb-3">{employee.role}</p>
            <span className={`badge px-3 py-2 rounded-pill ${employee.employee_level === 'Admin' ? 'bg-danger' : employee.employee_level === 'Manager' ? 'bg-primary' : 'bg-secondary'}`}>
              <ShieldCheck size={14} className="me-1" /> {employee.employee_level}
            </span>
          </div>
        </div>

        <div className="col-md-8">
          <div className="stat-card h-100">
            <h5 className="fw-bold mb-4 border-bottom pb-3">PROTOCOL DATA: {employee.username}</h5>
            
            <div className="row g-4">
              <div className="col-md-6">
                <div className="d-flex align-items-center gap-3 p-3 border rounded bg-light">
                  <Mail className="text-primary" />
                  <div>
                    <label className="small text-secondary fw-bold display-block">Email Address</label>
                    <div className="fw-bold">{employee.email}</div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="d-flex align-items-center gap-3 p-3 border rounded bg-light">
                  <MapPin className="text-primary" />
                  <div>
                    <label className="small text-secondary fw-bold display-block">Department</label>
                    <div className="fw-bold">{employee.department}</div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="d-flex align-items-center gap-3 p-3 border rounded bg-light">
                  <Calendar className="text-primary" />
                  <div>
                    <label className="small text-secondary fw-bold display-block">Joining Date</label>
                    <div className="fw-bold">{employee.joining_date}</div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="d-flex align-items-center gap-3 p-3 border rounded bg-light">
                  <DollarSign className="text-primary" />
                  <div>
                    <label className="small text-secondary fw-bold display-block">Annual Compensation</label>
                    <div className="fw-bold">${employee.salary?.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="d-flex align-items-center gap-3 p-3 border rounded bg-light">
                  <ShieldCheck className="text-primary" />
                  <div>
                    <label className="small text-secondary fw-bold display-block">Reporting Manager</label>
                    <div className="fw-bold">{employee.manager_name || 'Direct / CEO'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-top">
              <h6 className="fw-bold mb-3">Security & Access</h6>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-primary px-4">Reset Credentials</button>
                <button className="btn btn-sm btn-outline-warning px-4">Audit Access Logs</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
