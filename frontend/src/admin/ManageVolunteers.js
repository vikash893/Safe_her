import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../css/Dashboard.css';
import '../css/Admin.css';

function ManageVolunteers() {
  const { logout } = useAuth();
  const [volunteers, setVolunteers] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, rejected
  const [loading, setLoading] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null); // for modal view

  const fetchVolunteers = React.useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8000/api/admin/volunteers?status=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVolunteers(res.data.volunteers || []);
    } catch (err) {
      console.error('Error fetching volunteers:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchVolunteers();
  }, [fetchVolunteers]);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:8000/api/admin/volunteers/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Volunteer approved successfully!');
      fetchVolunteers();
    } catch (err) {
      console.error('Error approving volunteer:', err);
      alert('Failed to approve volunteer');
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:8000/api/admin/volunteers/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Volunteer registration rejected.');
      fetchVolunteers();
    } catch (err) {
      console.error('Error rejecting volunteer:', err);
      alert('Failed to reject volunteer');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this volunteer?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/admin/volunteers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Volunteer record deleted.');
      fetchVolunteers();
    } catch (err) {
      console.error('Error deleting volunteer:', err);
      alert('Failed to delete volunteer');
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
          <Link to="/admin/women" className="dashboard-nav-item">
            👩 Manage Women Users
          </Link>
          <Link to="/admin/volunteers" className="dashboard-nav-item active" style={{ color: '#ffffff', background: '#1d1b26' }}>
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
            <h1 className="dashboard-title" style={{ color: '#ffffff' }}>Manage Volunteers</h1>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Approve, reject, or delete community guardians</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs" style={{ borderBottomColor: '#1d1b26' }}>
          <button 
            className={`admin-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Approval
          </button>
          <button 
            className={`admin-tab ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved
          </button>
          <button 
            className={`admin-tab ${activeTab === 'rejected' ? 'active' : ''}`}
            onClick={() => setActiveTab('rejected')}
          >
            Rejected
          </button>
        </div>

        {/* Volunteers Table */}
        <div className="admin-table-container" style={{ background: '#12111a', borderColor: '#1d1b26' }}>
          {loading ? (
            <div className="text-center" style={{ padding: '3rem', color: '#94a3b8' }}>Loading volunteers...</div>
          ) : volunteers.length === 0 ? (
            <div className="text-center" style={{ padding: '3rem', color: '#94a3b8' }}>No volunteers in this tab.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Profile</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Name</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Contact Details</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Aadhar info</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Zipcode</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map((vol) => (
                  <tr key={vol._id} style={{ borderBottomColor: '#1d1b26' }}>
                    <td>
                      {vol.photo ? (
                        <img 
                          src={`http://localhost:8000/${vol.photo.replace(/\\/g, '/')}`} 
                          alt={vol.name} 
                          className="admin-thumbnail" 
                        />
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td style={{ color: '#ffffff', fontWeight: 600 }}>{vol.name}</td>
                    <td style={{ color: '#94a3b8' }}>
                      <div>{vol.email}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{vol.phone}</div>
                    </td>
                    <td style={{ color: '#94a3b8' }}>
                      <span 
                        style={{ cursor: 'pointer', textDecoration: 'underline', color: '#fcd34d' }}
                        onClick={() => setSelectedVolunteer(vol)}
                      >
                        {vol.aadhar_number}
                      </span>
                    </td>
                    <td style={{ color: '#94a3b8' }}>{vol.pincode}</td>
                    <td>
                      {activeTab === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(vol._id)} className="action-btn approve">Approve</button>
                          <button onClick={() => handleReject(vol._id)} className="action-btn reject">Reject</button>
                        </>
                      )}
                      {activeTab !== 'pending' && (
                        <button onClick={() => handleDelete(vol._id)} className="action-btn delete">Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal View for Aadhar verification */}
        {selectedVolunteer && (
          <div className="admin-modal-overlay" onClick={() => setSelectedVolunteer(null)}>
            <div className="admin-modal animate-slide-in" onClick={(e) => e.stopPropagation()} style={{ background: '#12111a', borderColor: '#1d1b26' }}>
              <button className="admin-modal-close" onClick={() => setSelectedVolunteer(null)}>×</button>
              <h3 className="admin-modal-title" style={{ color: '#ffffff' }}>Verify Documents: {selectedVolunteer.name}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Profile Picture</h4>
                  <img 
                    src={`http://localhost:8000/${selectedVolunteer.photo.replace(/\\/g, '/')}`} 
                    alt="Profile" 
                    style={{ width: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #1d1b26' }}
                  />
                </div>
                <div>
                  <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Aadhar Document</h4>
                  <img 
                    src={`http://localhost:8000/${selectedVolunteer.aadharPhoto.replace(/\\/g, '/')}`} 
                    alt="Aadhar" 
                    style={{ width: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #1d1b26' }}
                  />
                </div>
              </div>
              <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'left' }}>
                  <strong>Aadhar Number:</strong> {selectedVolunteer.aadhar_number}
                </p>
                <button 
                  onClick={() => setSelectedVolunteer(null)} 
                  className="action-btn approve"
                  style={{ background: '#1e293b', color: '#ffffff', border: '1px solid #1d1b26' }}
                >
                  Close Verification
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageVolunteers;
