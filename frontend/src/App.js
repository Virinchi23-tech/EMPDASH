import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeDetails from './pages/EmployeeDetails';
import Attendance from './pages/Attendance';
import LeaveManagement from './pages/LeaveManagement';
import BreakTracker from './pages/BreakTracker';
import BonusManagement from './pages/BonusManagement';
import MeetingsLog from './pages/MeetingsLog';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Protected Route Component with Role Check
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="d-flex">
      <Sidebar userRole={user.role} />
      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <Navbar />
        <main className="p-4 bg-light min-vh-100">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Shared Dashboard (view differs by role) */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* Admin and Manager features */}
        <Route path="/employees" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
            <Employees />
          </ProtectedRoute>
        } />
        
        {/* Protocol Details / Employee Specific View */}
        <Route path="/employee/:id" element={<ProtectedRoute><EmployeeDetails /></ProtectedRoute>} />
        
        {/* Attendance (Personal or Team based) */}
        <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        
        {/* Leave (Apply or Approve) */}
        <Route path="/leaves" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
        
        {/* Break Tracking */}
        <Route path="/breaks" element={<ProtectedRoute><BreakTracker /></ProtectedRoute>} />
        
        {/* Bonus (Admin/Manager only view, or personal view) */}
        <Route path="/bonuses" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
            <BonusManagement />
          </ProtectedRoute>
        } />

        {/* Meeting Logs */}
        <Route path="/meetings" element={<ProtectedRoute><MeetingsLog /></ProtectedRoute>} />
        
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
