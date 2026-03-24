import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="fade-in" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      paddingTop: '5rem',
      textAlign: 'center'
    }}>
      <div style={{ background: '#fee2e2', padding: '1.5rem', borderRadius: '24px', marginBottom: '2rem' }}>
        <AlertTriangle size={60} style={{ color: '#ef4444' }} />
      </div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>Access Restricted</h1>
      <p style={{ color: '#64748b', maxWidth: '500px', fontSize: '1.125rem', marginBottom: '2.5rem' }}>
        Oops! You don't have the necessary clearance to access this department. 
        Your attempt has been logged for security review.
      </p>
      
      <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ padding: '1.25rem 2rem', fontSize: '1rem' }}>
        <Home size={20} /> Return to Your Workspace
      </button>
    </div>
  );
};

export default Unauthorized;
