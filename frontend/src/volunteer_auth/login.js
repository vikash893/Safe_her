import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Auth.css';

function VolunteerLogin() {
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

    const result = await login(email, password, 'volunteer');
    setLoading(false);

    if (result.success) {
      navigate('/volunteer-dashboard');
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-slide-in">
        <h2 className="auth-title" style={{ background: 'linear-gradient(to right, #ffffff, #fcd34d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Volunteer Login
        </h2>
        <p className="auth-subtitle">Login to view pending help requests</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label">Email Address</label>
            <input
              type="email"
              className="auth-input"
              placeholder="volunteer@example.com"
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
            style={{ background: 'linear-gradient(135deg, #805ad5 0%, #b7791f 100%)' }} 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have a volunteer account?{' '}
          <Link to="/volunteer-register" className="auth-link" style={{ color: '#fcd34d' }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VolunteerLogin;