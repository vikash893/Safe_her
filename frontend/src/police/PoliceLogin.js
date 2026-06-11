import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Auth.css';

function PoliceLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password, 'police');
    setLoading(false);

    if (result.success) {
      navigate('/police-dashboard');
    } else {
      setError(result.error || 'Police login failed. Please verify credentials.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-slide-in">
        <div style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '0.5rem' }}>👮</div>
        <h2 className="auth-title" style={{ background: 'linear-gradient(to right, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Police Login
        </h2>
        <p className="auth-subtitle">Sign in to monitor alerts and coordinates</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label">Station Email Address</label>
            <input
              type="email"
              className="auth-input"
              placeholder="station@police.gov.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-btn" 
            style={{ background: 'linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Control Room Login'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have a station account?{' '}
          <Link to="/police-register" className="auth-link" style={{ color: '#93c5fd' }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PoliceLogin;
