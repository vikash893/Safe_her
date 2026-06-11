import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../css/Auth.css';

function Register() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    alternate_number: '',
    photo: null,
    emergency_phone: '',
    emergency_email: '',
    pincode: '',
    lat: '',
    log: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUser((prev) => ({
          ...prev,
          lat: position.coords.latitude,
          log: position.coords.longitude,
        }));
      },
      (err) => {
        console.error('Failed to get location:', err);
      }
    );
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setUser((prev) => ({
      ...prev,
      photo: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user.photo) {
      setError('Profile photo is required');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', user.name);
      formData.append('phone', user.phone);
      formData.append('email', user.email);
      formData.append('password', user.password);
      formData.append('alternate_number', user.alternate_number);
      formData.append('photo', user.photo);
      formData.append('emergency_phone', user.emergency_phone);
      formData.append('emergency_email', user.emergency_email);
      formData.append('pincode', user.pincode);
      formData.append('lat', user.lat);
      formData.append('log', user.log);

      await axios.post('http://localhost:8000/api/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Registered successfully!');
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-slide-in" style={{ maxWidth: '650px' }}>
        <h2 className="auth-title">Women Register</h2>
        <p className="auth-subtitle">Create a safety profile for emergency monitoring</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div className="auth-form-group">
              <label className="auth-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="auth-input"
                placeholder="Jane Doe"
                value={user.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Phone Number</label>
              <input
                type="text"
                name="phone"
                className="auth-input"
                placeholder="e.g. +91 9876543210"
                value={user.phone}
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
                placeholder="jane@example.com"
                value={user.email}
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
                value={user.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Alternate Phone Number</label>
              <input
                type="text"
                name="alternate_number"
                className="auth-input"
                placeholder="Alternate phone"
                value={user.alternate_number}
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
                value={user.pincode}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Emergency Phone (Trusted Contact)</label>
              <input
                type="text"
                name="emergency_phone"
                className="auth-input"
                placeholder="Emergency contact phone"
                value={user.emergency_phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Emergency Email (Trusted Contact)</label>
              <input
                type="email"
                name="emergency_email"
                className="auth-input"
                placeholder="Emergency contact email"
                value={user.emergency_email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-form-group" style={{ marginTop: '0.5rem' }}>
            <label className="auth-label">Profile Photo</label>
            <div className="auth-input-file">
              <span className="auth-file-label">
                {user.photo ? `Selected: ${user.photo.name}` : '📁 Upload Profile Picture'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating Profile...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already registered?{' '}
          <Link to="/login" className="auth-link">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;