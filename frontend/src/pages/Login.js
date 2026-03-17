import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles/login.css';
import { ShieldAlert } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { username, password });
      
      // Store core auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Security Breach: Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-circle">
          <ShieldAlert size={36} />
        </div>
        <h3 className="login-title">EMP Protocol Access</h3>
        <p className="text-secondary small mb-4">Enter credentials to initialize secure session.</p>
        
        {error && (
          <div className="alert alert-danger py-2 mb-4 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
            <span className="fw-bold">ERR:</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="text-start mb-1 ms-1 small fw-bold text-secondary text-uppercase" style={{ fontSize: '0.65rem' }}>Identity ID</div>
          <input
            type="text"
            className="form-control form-control-custom"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <div className="text-start mb-1 mt-3 ms-1 small fw-bold text-secondary text-uppercase" style={{ fontSize: '0.65rem' }}>Access Key</div>
          <input
            type="password"
            className="form-control form-control-custom"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn btn-primary w-100 py-3 mt-4 shadow-lg fw-bold"
            disabled={loading}
          >
            {loading ? 'CALCULATING HANDSHAKE...' : 'INITIALIZE PROTOCOL'}
          </button>
        </form>
        
        <div className="mt-4 pt-3 border-top border-light text-secondary small">
          <div className="fw-bold mb-1">Standard Node Debug Keys:</div>
          <div className="d-flex justify-content-between">
            <span>Admin: <code>admin</code></span>
            <span>Pass: <code>password123</code></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
