import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../css/Dashboard.css';
import '../css/Admin.css';

function ManagePolice() {
  const { logout } = useAuth();
  const [stations, setStations] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, rejected
  const [loading, setLoading] = useState(false);

  const fetchStations = React.useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8000/api/admin/police-stations?status=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStations(res.data.policeStations || []);
    } catch (err) {
      console.error('Error fetching police stations:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:8000/api/admin/police-stations/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Police station approved successfully!');
      fetchStations();
    } catch (err) {
      console.error('Error approving police station:', err);
      alert('Failed to approve police station');
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:8000/api/admin/police-stations/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Police station rejected.');
      fetchStations();
    } catch (err) {
      console.error('Error rejecting police station:', err);
      alert('Failed to reject police station');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this police station?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/admin/police-stations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Police station deleted.');
      fetchStations();
    } catch (err) {
      console.error('Error deleting police station:', err);
      alert('Failed to delete police station');
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
          <Link to="/admin/volunteers" className="dashboard-nav-item">
            🤝 Manage Volunteers
          </Link>
          <Link to="/admin/police" className="dashboard-nav-item active" style={{ color: '#ffffff', background: '#1d1b26' }}>
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
            <h1 className="dashboard-title" style={{ color: '#ffffff' }}>Manage Police Stations</h1>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Review and approve registrations for nearby police stations</p>
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

        {/* Police Table */}
        <div className="admin-table-container" style={{ background: '#12111a', borderColor: '#1d1b26' }}>
          {loading ? (
            <div className="text-center" style={{ padding: '3rem', color: '#94a3b8' }}>Loading police stations...</div>
          ) : stations.length === 0 ? (
            <div className="text-center" style={{ padding: '3rem', color: '#94a3b8' }}>No police stations in this tab.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Station Name</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Officer in Charge</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Email</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Phone</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Address</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Pincode</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stations.map((station) => (
                  <tr key={station._id} style={{ borderBottomColor: '#1d1b26' }}>
                    <td style={{ color: '#ffffff', fontWeight: 600 }}>{station.stationName}</td>
                    <td style={{ color: '#94a3b8' }}>{station.officerName}</td>
                    <td style={{ color: '#94a3b8' }}>{station.email}</td>
                    <td style={{ color: '#94a3b8' }}>{station.phone}</td>
                    <td style={{ color: '#94a3b8', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {station.address}
                    </td>
                    <td style={{ color: '#94a3b8' }}>{station.pincode}</td>
                    <td>
                      {activeTab === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(station._id)} className="action-btn approve">Approve</button>
                          <button onClick={() => handleReject(station._id)} className="action-btn reject">Reject</button>
                        </>
                      )}
                      {activeTab !== 'pending' && (
                        <button onClick={() => handleDelete(station._id)} className="action-btn delete">Delete</button>
                      )}
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

export default ManagePolice;
