import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../css/Auth.css';

function PoliceRegister() {
  const [formData, setFormData] = useState({
    stationName: '',
    officerName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    pincode: '',
    lat: '',
    lng: ''
  });
  const [locationStatus, setLocationStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser');
      return;
    }
    setLocationStatus('Detecting GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          lat: latitude.toString(),
          lng: longitude.toString()
        }));
        setLocationStatus(`Detected: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      (err) => {
        setLocationStatus('GPS detection failed. Manually input coordinates or reload.');
        console.error('Geo error:', err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.lat || !formData.lng) {
      setError('Please wait for GPS coordinates detection.');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:8000/api/police/register', formData);
      setRegistered(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="auth-container">
        <div className="auth-card animate-slide-in text-center">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 className="auth-title" style={{ color: '#3182ce' }}>Station Registered!</h2>
          <p className="auth-subtitle" style={{ marginBottom: '2rem' }}>
            Registration submitted successfully! Your station is currently pending admin verification and approval.
          </p>
          <Link to="/">
            <button className="auth-btn" style={{ background: 'linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)' }}>
              Return to Homepage
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card animate-slide-in" style={{ maxWidth: '650px' }}>
        <h2 className="auth-title" style={{ background: 'linear-gradient(to right, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Police Registration
        </h2>
        <p className="auth-subtitle">Register a local police station to coordinate responses</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div className="auth-form-group">
              <label className="auth-label">Station Name</label>
              <input
                type="text"
                name="stationName"
                className="auth-input"
                placeholder="City Central Police Station"
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Officer in Charge</label>
              <input
                type="text"
                name="officerName"
                className="auth-input"
                placeholder="Inspector John Doe"
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="auth-input"
                placeholder="station@police.gov.in"
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Password</label>
              <input
                type="password"
                name="password"
                className="auth-input"
                placeholder="••••••••"
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Phone / Control Room No.</label>
              <input
                type="text"
                name="phone"
                className="auth-input"
                placeholder="Control room phone"
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Zip/Pincode</label>
              <input
                type="text"
                name="pincode"
                className="auth-input"
                placeholder="Pincode"
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group" style={{ gridColumn: 'span 2' }}>
              <label className="auth-label">Station Physical Address</label>
              <input
                type="text"
                name="address"
                className="auth-input"
                placeholder="Full address of the police station"
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group" style={{ gridColumn: 'span 2' }}>
              <label className="auth-label">Station Coordinates (Auto-detected)</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input
                  type="text"
                  name="lat"
                  className="auth-input"
                  placeholder="Latitude"
                  value={formData.lat}
                  onChange={handleChange}
                  readOnly
                />
                <input
                  type="text"
                  name="lng"
                  className="auth-input"
                  placeholder="Longitude"
                  value={formData.lng}
                  onChange={handleChange}
                  readOnly
                />
                <button 
                  type="button" 
                  onClick={detectLocation} 
                  className="action-btn approve"
                  style={{ whiteSpace: 'nowrap', margin: 0, padding: '0 1rem' }}
                >
                  📍 Refresh
                </button>
              </div>
              <span style={{ fontSize: '0.75rem', color: locationStatus.includes('Detected') ? '#99ff99' : 'var(--text-muted)' }}>
                {locationStatus}
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-btn" 
            style={{ background: 'linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Submitting Registration...' : 'Register Station'}
          </button>
        </form>

        <div className="auth-footer">
          Already registered?{' '}
          <Link to="/police-login" className="auth-link" style={{ color: '#93c5fd' }}>
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PoliceRegister;
