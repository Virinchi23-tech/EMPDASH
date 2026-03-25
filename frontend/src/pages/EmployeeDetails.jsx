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
  ChevronLeft,
  Activity
} from 'lucide-react';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        console.log(`[EmployeeDetails] Fetching protocol details for ID: ${id}`);
        // Endpoint changed from /employees to /users
        const { data } = await api.get(`/users/${id}`);
        setEmployee(data);
      } catch (err) {
        console.error('[EmployeeDetails] Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  if (loading) return <div className="p-5 text-center">Synchronizing Protocol Details...</div>;
  if (!employee) return <div className="p-5 text-center text-danger">User Protocol Not Found / Access Denied</div>;

  return (
    <div className="px-4 py-3">
      <button 
        className="btn btn-light mb-4 d-flex align-items-center gap-2 shadow-sm border"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft size={18} /> BACK TO DIRECTORY
      </button>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="stat-card text-center py-5 shadow-sm border-0 rounded-4 bg-white">
            <div className="rounded-circle bg-primary-light text-primary d-flex align-items-center justify-content-center mx-auto mb-4 border" style={{ width: '120px', height: '120px', fontSize: '3rem', fontWeight: 'bold' }}>
              {employee.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="fw-bold mb-1 text-dark">{employee.name}</h3>
            <p className="text-secondary small mb-3 text-uppercase fw-bold" style={{letterSpacing: '0.05em'}}>{employee.role}</p>
            <span className={`badge px-4 py-2 rounded-pill shadow-sm ${employee.role === 'admin' ? 'bg-danger' : employee.role === 'manager' ? 'bg-primary' : 'bg-secondary'}`}>
              <ShieldCheck size={14} className="me-2" /> {employee.role.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="col-md-8">
          <div className="stat-card h-100 shadow-sm border-0 rounded-4 bg-white p-4">
            <h5 className="fw-bold mb-4 border-bottom pb-4 d-flex align-items-center gap-2">
               <Activity size={20} className="text-primary" /> ENCRYPTION PROFILE: {employee.email.split('@')[0].toUpperCase()}
            </h5>
            
            <div className="row g-4">
              <div className="col-md-6">
                <div className="d-flex align-items-center gap-3 p-4 border rounded-4 bg-light shadow-sm">
                  <Mail className="text-primary" size={24} />
                  <div>
                    <label className="small text-secondary fw-bold text-uppercase" style={{fontSize: '0.65rem'}}>System Identifier (Email)</label>
                    <div className="fw-bold text-dark">{employee.email}</div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="d-flex align-items-center gap-3 p-4 border rounded-4 bg-light shadow-sm">
                  <Briefcase className="text-primary" size={24} />
                  <div>
                    <label className="small text-secondary fw-bold text-uppercase" style={{fontSize: '0.65rem'}}>Operational Division</label>
                    <div className="fw-bold text-dark">{employee.department || 'General Operations'}</div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="d-flex align-items-center gap-3 p-4 border rounded-4 bg-light shadow-sm">
                  <Calendar className="text-primary" size={24} />
                  <div>
                    <label className="small text-secondary fw-bold text-uppercase" style={{fontSize: '0.65rem'}}>Activation Timestamp</label>
                    <div className="fw-bold text-dark">{employee.created_at ? new Date(employee.created_at).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="d-flex align-items-center gap-3 p-4 border rounded-4 bg-light shadow-sm">
                  <ShieldCheck className="text-primary" size={24} />
                  <div>
                    <label className="small text-secondary fw-bold text-uppercase" style={{fontSize: '0.65rem'}}>Security Clearance</label>
                    <div className="fw-bold text-dark">{employee.role.toUpperCase()} LEVEL</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-top">
              <h6 className="fw-bold mb-4 text-secondary small text-uppercase" style={{letterSpacing: '0.05em'}}>Identity Authorization</h6>
              <div className="d-flex gap-3">
                <button className="btn btn-primary px-4 fw-bold shadow">SYNCHRONIZE CREDENTIALS</button>
                <button className="btn btn-outline-secondary px-4 fw-bold shadow-sm">AUDIT ACCESS LOGS</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
