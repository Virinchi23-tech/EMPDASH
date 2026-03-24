import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { TrendingUp } from 'lucide-react';
import EmployeeDashboard from '@/features/employee/pages/EmployeeDashboard';
import AdminDashboard from '@/features/admin/pages/AdminDashboard';
import ManagerDashboard from '@/features/manager/pages/ManagerDashboard';
import ProductivityTable from '@/features/manager/components/ProductivityTable';

const Dashboard = () => {
  const { user } = useAuth();

  const handleExport = () => {
    const headers = "ID,Name,Role,Email\n";
    const rows = "1,Admin User,Admin,admin@company.com\n2,Manager User,Manager,manager@company.com\n3,Employee User,Employee,employee@company.com";
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emp_intelligence_report.csv';
    a.click();
  };

  const handleRefresh = () => {
    window.location.reload(); 
  };

  if (user.role === 'Employee') {
    return <EmployeeDashboard user={user} />;
  }

  return (
    <div className="fade-in">
       <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.025em' }}>{user.role} Intelligence Hub</h2>
            <p style={{ color: '#64748b' }}>Precision monitoring and organizational control panel</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
             <button className="btn btn-outline" onClick={handleExport}>
               <TrendingUp size={16} /> Export Intelligence
             </button>
             <button className="btn btn-primary" onClick={handleRefresh}>Refresh Streams</button>
          </div>
       </header>

       {user.role === 'Admin' ? <AdminDashboard user={user} /> : <ManagerDashboard user={user} />}
       <ProductivityTable />
    </div>
  );
};

export default Dashboard;
