import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../css/Dashboard.css';
import '../css/Admin.css';

function ManageWomen() {
  const { logout } = useAuth();
  const [women, setWomen] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWomen();
  }, []);

  const fetchWomen = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/api/admin/women', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWomen(res.data.women || []);
    } catch (err) {
      console.error('Error fetching women:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user profile? This action is permanent.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/admin/women/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User deleted successfully.');
      fetchWomen();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user.');
    }
  };

  return (
    <div className="dashboard-layout" data-theme="dark">
      {/* Sidebar */}
      <div className="dashboard-sidebar" style={{ background: '#0e0d16', borderRightColor: '#1d1b26' }}>
        <div className="dashboard-brand" style={{ background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🛡️ SafeHer Admin
        </div>
        <div className="dashboard-nav">
          <Link to="/admin-dashboard" className="dashboard-nav-item">
            📊 Stats Overview
          </Link>
          <Link to="/admin/women" className="dashboard-nav-item active" style={{ color: '#ffffff', background: '#1d1b26' }}>
            👩 Manage Women Users
          </Link>
          <Link to="/admin/volunteers" className="dashboard-nav-item">
            🤝 Manage Volunteers
          </Link>
          <Link to="/admin/police" className="dashboard-nav-item">
            👮 Manage Police
          </Link>
          <Link to="/admin/requests" className="dashboard-nav-item">
            📜 Help Requests
          </Link>
        </div>
        <button onClick={logout} className="dashboard-logout">
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-content" style={{ background: '#09080f' }}>
        <div className="dashboard-header" style={{ borderBottom: '1px solid #1d1b26', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <h1 className="dashboard-title" style={{ color: '#ffffff' }}>Manage Women Users</h1>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>View and audit registered women user profiles</p>
          </div>
        </div>

        <div className="admin-table-container" style={{ background: '#12111a', borderColor: '#1d1b26' }}>
          {loading ? (
            <div className="text-center" style={{ padding: '3rem', color: '#94a3b8' }}>Loading users...</div>
          ) : women.length === 0 ? (
            <div className="text-center" style={{ padding: '3rem', color: '#94a3b8' }}>No women users registered yet.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Photo</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Name</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Email</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Phone</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Emergency Contact</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {women.map((woman) => (
                  <tr key={woman._id} style={{ borderBottomColor: '#1d1b26' }}>
                    <td>
                      {woman.photo ? (
                        <img 
                          src={`http://localhost:8000/${woman.photo.replace(/\\/g, '/')}`} 
                          alt={woman.name} 
                          className="admin-thumbnail" 
                        />
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td style={{ color: '#ffffff', fontWeight: 600 }}>{woman.name}</td>
                    <td style={{ color: '#94a3b8' }}>{woman.email}</td>
                    <td style={{ color: '#94a3b8' }}>{woman.phone}</td>
                    <td style={{ color: '#94a3b8' }}>
                      <div>{woman.emergency_phone}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{woman.emergency_email}</div>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleDelete(woman._id)}
                        className="action-btn delete"
                        style={{ margin: 0 }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageWomen;
