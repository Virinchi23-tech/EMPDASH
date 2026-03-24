import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getLeaves, approveLeave } from '@/services/leavesService';
import { Check, X, FileText, User, Calendar, ShieldAlert } from 'lucide-react';

const LeaveApproval = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    setLoading(true);
    const data = await getLeaves(user.role);
    setLeaves(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleAction = async (id, status) => {
    const result = await approveLeave(id, status);
    if (result.success) {
      alert(`Leave application ${status.toLowerCase()} successfully.`);
      fetchLeaves();
    }
  };

  const pendingLeaves = leaves.filter(l => l.status === 'Pending');
  const pastLeaves = leaves.filter(l => l.status !== 'Pending');

  return (
    <div className="fade-in">
       <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Leave Approval Panel</h2>
            <p style={{ color: '#64748b' }}>Manage pending and past leave applications for your team</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
             <button className="btn btn-outline" onClick={fetchLeaves}>Refresh Requests</button>
          </div>
       </header>

       {/* Pending Requests Section */}
       <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
             <Calendar size={18} /> Pending Action Needed ({pendingLeaves.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {pendingLeaves.length === 0 ? (
               <p style={{ gridColumn: 'span 12', padding: '2rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px' }}>
                  Hooray! No pending leave applications to review.
               </p>
            ) : (
               pendingLeaves.map(leave => (
                 <div key={leave.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                       <img src={`https://ui-avatars.com/api/?name=${leave.name}&background=random`} style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
                       <div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{leave.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{leave.type}</div>
                       </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', flex: 1 }}>
                       <div style={{ fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Reason:</div>
                       <div style={{ color: '#64748b' }}>{leave.reason}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div style={{ fontWeight: 700, color: '#4f46e5', fontSize: '0.875rem' }}>{leave.date}</div>
                       <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleAction(leave.id, 'Approved')} className="btn btn-primary" style={{ padding: '0.5rem', background: '#10b981' }}><Check size={16} /></button>
                          <button onClick={() => handleAction(leave.id, 'Rejected')} className="btn btn-outline" style={{ padding: '0.5rem', color: '#ef4444', borderColor: '#fee2e2' }}><X size={16} /></button>
                       </div>
                    </div>
                 </div>
               ))
            )}
          </div>
       </div>

       {/* Audit Section */}
       <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', color: '#64748b' }}>Decided Requests History</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
               <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8' }}>Employee</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8' }}>Type</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8' }}>Date requested</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8' }}>Status</th>
               </tr>
            </thead>
            <tbody>
               {pastLeaves.map(leave => (
                  <tr key={leave.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                     <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{leave.name}</td>
                     <td style={{ padding: '1rem 1.5rem' }}>{leave.type}</td>
                     <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>{leave.date}</td>
                     <td style={{ padding: '1rem 1.5rem' }}>
                        <span className={`badge ${leave.status === 'Approved' ? 'badge-success' : 'badge-danger'}`}>
                           {leave.status}
                        </span>
                     </td>
                  </tr>
               ))}
            </tbody>
          </table>
       </div>
    </div>
  );
};

export default LeaveApproval;
