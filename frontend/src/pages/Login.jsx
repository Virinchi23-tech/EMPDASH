import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Shield, Zap, Mail, Lock } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setError('');
    
    setIsLoggingIn(true);
    try {
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Invalid credentials.');
      }
    } catch (e) {
      setError("An unexpected error occurred during login.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4f46e5 100%)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(99,102,241,0.3)', filter: 'blur(80px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(167,139,250,0.25)', filter: 'blur(80px)' }}></div>

      <div className="fade-in" style={{
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '28px',
        padding: '3.5rem',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 32px 64px rgba(0,0,0,0.45)',
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: 'rgba(255,255,255,0.15)', borderRadius: '18px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Zap size={28} style={{ color: '#a5b4fc' }} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
            EMP Dashboard
          </h1>
          <p style={{ color: 'rgba(165, 180, 252, 0.85)', fontSize: '0.9375rem' }}>
            Sign in securely with your credentials
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.5)', padding: '1rem', borderRadius: '12px', color: '#fca5a5', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Real Form Options */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} size={20} />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex. employee@test.com"
                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: 'white', outline: 'none', transition: 'border 0.2s', fontSize: '1rem' }}
                onFocus={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.4)'}
                onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.15)'}
              />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} size={20} />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: 'white', outline: 'none', transition: 'border 0.2s', fontSize: '1rem' }}
                onFocus={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.4)'}
                onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.15)'}
              />
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={isLoggingIn}
            style={{ 
              marginTop: '0.5rem',
              padding: '1rem', 
              background: '#4f46e5', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              fontSize: '1rem', 
              fontWeight: 700, 
              cursor: isLoggingIn ? 'not-allowed' : 'pointer',
              opacity: isLoggingIn ? 0.7 : 1,
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => !isLoggingIn && (e.target.style.background = '#4338ca')}
            onMouseOut={(e) => !isLoggingIn && (e.target.style.background = '#4f46e5')}
          >
            {isLoggingIn ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Development Quick Accounts */}
        <div style={{ marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', textAlign: 'center' }}>Quick Test Credentials</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button 
              onClick={(e) => { e.preventDefault(); setEmail('employee@test.com'); setPassword('password123'); }}
              style={{ padding: '0.625rem 1rem', background: 'rgba(255,255,255,0.05)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.3)', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.target.style.background = 'rgba(129,140,248,0.1)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
            >
              Employee
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); setEmail('manager@test.com'); setPassword('password123'); }}
              style={{ padding: '0.625rem 1rem', background: 'rgba(255,255,255,0.05)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.target.style.background = 'rgba(167,139,250,0.1)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
            >
              Manager
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); setEmail('admin@test.com'); setPassword('password123'); }}
              style={{ padding: '0.625rem 1rem', background: 'rgba(255,255,255,0.05)', color: '#fca5a5', border: '1px solid rgba(252,165,165,0.3)', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.target.style.background = 'rgba(252,165,165,0.1)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
            >
              Admin
            </button>
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8125rem', color: 'rgba(165,180,252,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Shield size={14} />
          Protected by AES-GCM Encrypted JWT Authorization
        </div>
      </div>
    </div>
  );
};

export default Login;
