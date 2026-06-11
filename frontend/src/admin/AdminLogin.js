import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Auth.css';

function AdminLogin() {
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

    const result = await login(email, password, 'admin');
    setLoading(false);

    if (result.success) {
      navigate('/admin-dashboard');
    } else {
      setError(result.error || 'Admin login failed.');
    }
  };

  return (
    <div className="auth-container" style={{ background: 'linear-gradient(135deg, #020205 0%, #080710 100%)' }}>
      <div className="auth-card animate-slide-in" style={{ background: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
        <div style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '0.5rem' }}>🛡️</div>
        <h2 className="auth-title" style={{ background: 'linear-gradient(to right, #e2e8f0, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Admin Panel
        </h2>
        <p className="auth-subtitle">Secure access credentials required</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label">Admin Email</label>
            <input
              type="email"
              className="auth-input"
              placeholder="admin@safeher.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ background: 'rgba(255, 255, 255, 0.03)' }}
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Secure Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ background: 'rgba(255, 255, 255, 0.03)' }}
            />
          </div>

          <button 
            type="submit" 
            className="auth-btn" 
            style={{ background: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)', marginTop: '1.5rem', boxShadow: '0 0 20px rgba(71, 85, 105, 0.2)' }}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Authorize Login'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/" className="auth-link" style={{ color: '#94a3b8' }}>
            ← Back to portals
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
