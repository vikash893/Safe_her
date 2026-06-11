import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../css/Auth.css';

function VolunteerRegister() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    alternate_number: '',
    pincode: '',
    lat: '',
    log: '',
    aadhar_number: ''
  });

  const [photo, setPhoto] = useState(null);
  const [aadharPhoto, setAadharPhoto] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported by browser.');
      return;
    }

    setLocationStatus('Detecting location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          lat: latitude.toString(),
          log: longitude.toString()
        }));
        setLocationStatus(`Detected: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      (err) => {
        setLocationStatus('Could not auto-detect location. Please input coordinates or refresh.');
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

    if (!formData.lat || !formData.log) {
      setError('Please wait for location detection or reload.');
      setLoading(false);
      return;
    }

    if (!photo || !aadharPhoto) {
      setError('Both Profile and Aadhar photos are required.');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      data.append('photo', photo);
      data.append('aadharPhoto', aadharPhoto);

      await axios.post('http://localhost:8000/api/volunteers/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

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
          <h2 className="auth-title" style={{ color: '#fcd34d' }}>Registration Submitted!</h2>
          <p className="auth-subtitle" style={{ marginBottom: '2rem' }}>
            Your registration is currently pending admin approval. We will review your Aadhar information and verify your profile.
          </p>
          <Link to="/">
            <button className="auth-btn" style={{ background: 'linear-gradient(135deg, #805ad5 0%, #b7791f 100%)' }}>
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
        <h2 className="auth-title" style={{ background: 'linear-gradient(to right, #ffffff, #fcd34d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Volunteer Register
        </h2>
        <p className="auth-subtitle">Join the safety response community</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div className="auth-form-group">
              <label className="auth-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="auth-input"
                placeholder="John Doe"
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
                placeholder="Phone number"
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
                placeholder="john@example.com"
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
              <label className="auth-label">Alternate Phone Number</label>
              <input
                type="text"
                name="alternate_number"
                className="auth-input"
                placeholder="Alternate number"
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

            <div className="auth-form-group" style={{ gridColumn: 'span 1' }}>
              <label className="auth-label">Aadhar Card Number</label>
              <input
                type="text"
                name="aadhar_number"
                className="auth-input"
                placeholder="12-digit Aadhar number"
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Location (Coordinates)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  name="lat"
                  className="auth-input"
                  placeholder="Lat"
                  value={formData.lat}
                  onChange={handleChange}
                  readOnly
                />
                <input
                  type="text"
                  name="log"
                  className="auth-input"
                  placeholder="Lng"
                  value={formData.log}
                  onChange={handleChange}
                  readOnly
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: locationStatus.includes('Detected') ? '#99ff99' : 'var(--text-muted)' }}>
                {locationStatus}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
            <div className="auth-form-group">
              <label className="auth-label">Profile Photo</label>
              <div className="auth-input-file">
                <span className="auth-file-label">
                  {photo ? `Profile: ${photo.name}` : '📁 Upload Photo'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files[0])}
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Aadhar Card Photo</label>
              <div className="auth-input-file">
                <span className="auth-file-label">
                  {aadharPhoto ? `Aadhar: ${aadharPhoto.name}` : '📁 Upload Aadhar'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAadharPhoto(e.target.files[0])}
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-btn" 
            style={{ background: 'linear-gradient(135deg, #805ad5 0%, #b7791f 100%)' }}
            disabled={loading}
          >
            {loading ? 'Creating Volunteer Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already registered?{' '}
          <Link to="/volunteer-login" className="auth-link" style={{ color: '#fcd34d' }}>
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VolunteerRegister;