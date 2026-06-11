import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ChatRoom from '../components/ChatRoom';
import '../css/Dashboard.css';
import '../css/Admin.css';

function PoliceDashboard() {
  const { user, logout } = useAuth();
  const [activeAlertits, setActiveAlertits] = useState([]);
  const [assignedCases, setAssignedCases] = useState([]);
  const [activeChatCase, setActiveChatCase] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPoliceData();
    const interval = setInterval(fetchPoliceData, 12000); // Auto refresh every 12s
    return () => clearInterval(interval);
  }, []);

  const fetchPoliceData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch active alerts
      const alertsRes = await axios.get('http://localhost:8000/api/police/active-alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveAlertits(alertsRes.data.alerts || []);

      // Fetch assigned cases
      const casesRes = await axios.get('http://localhost:8000/api/police/assigned-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignedCases(casesRes.data.requests || []);
    } catch (err) {
      console.error('Error fetching police dashboard data:', err);
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:8000/api/police/acknowledge/${alertId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Alert acknowledged successfully.');
      fetchPoliceData();
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      alert('Failed to acknowledge alert.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId) => {
    if (!window.confirm('Are you sure you want to mark this critical alert as resolved?')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:8000/api/emergency/alert/${alertId}/resolve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Alert marked as resolved.');
      fetchPoliceData();
    } catch (err) {
      console.error('Error resolving alert:', err);
      alert('Failed to resolve alert.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="dashboard-sidebar" style={{ background: '#0f172a', borderRightColor: '#1e293b' }}>
        <div className="dashboard-brand" style={{ background: 'linear-gradient(135deg, #93c5fd 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          👮 Police Portal
        </div>
        <div className="dashboard-nav">
          <button className="dashboard-nav-item active" style={{ color: '#ffffff', background: '#1e293b' }}>🚨 Control Room</button>
        </div>
        <button onClick={logout} className="dashboard-logout">
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="dashboard-header animate-fade-in">
          <div>
            <h1 className="dashboard-title">{user?.name || user?.stationName}</h1>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Control Room Monitor & Emergency Dispatch</p>
          </div>

          <div className="dashboard-user-profile">
            <div className="dashboard-user-info">
              <span className="dashboard-user-name">{user?.name || user?.stationName}</span>
              <span className="dashboard-user-role">Duty Officer</span>
            </div>
          </div>
        </div>

        {/* Active Chat Section */}
        {activeChatCase && (
          <div className="dashboard-card animate-slide-in">
            <div className="dashboard-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Live Assistance Tracking (User: {activeChatCase.womenName})</span>
              <button 
                onClick={() => setActiveChatCase(null)}
                style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 600 }}
              >
                Close Chat
              </button>
            </div>
            <ChatRoom requestId={activeChatCase._id} requestType={activeChatCase.type} />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          {/* Critical Emergency Alerts */}
          <div className="dashboard-card">
            <h3 className="dashboard-card-title" style={{ color: 'var(--danger)' }}>🚨 Active Critical Alerts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '450px', overflowY: 'auto' }}>
              {activeAlertits.length === 0 ? (
                <p className="text-muted text-center" style={{ padding: '2rem' }}>No critical emergency alerts reported.</p>
              ) : (
                activeAlertits.map((alert) => (
                  <div 
                    key={alert._id}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--border-radius)',
                      border: '2px solid rgba(255, 68, 68, 0.2)',
                      background: 'rgba(255, 68, 68, 0.02)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--danger)' }}>{alert.womenName}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Phone: {alert.womenPhone}
                      </div>
                      <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        <a 
                          href={`https://maps.google.com/?q=${alert.lat},${alert.lng}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#2563eb', textDecoration: 'underline' }}
                        >
                          View Location Link
                        </a>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Alert Time: {new Date(alert.createdAt).toLocaleTimeString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleAcknowledgeAlert(alert._id)}
                        className="action-btn approve"
                        style={{ margin: 0, padding: '0.5rem 1rem' }}
                        disabled={loading}
                      >
                        Acknowledge
                      </button>
                      <button 
                        onClick={() => handleResolveAlert(alert._id)}
                        className="action-btn reject"
                        style={{ margin: 0, padding: '0.5rem 1rem' }}
                        disabled={loading}
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Assigned "Feel Unsafe" Cases */}
          <div className="dashboard-card">
            <h3 className="dashboard-card-title">⚠️ Feel Unsafe Companion Cases</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '450px', overflowY: 'auto' }}>
              {assignedCases.length === 0 ? (
                <p className="text-muted text-center" style={{ padding: '2rem' }}>No pincode-assigned "feel unsafe" reports.</p>
              ) : (
                assignedCases.map((req) => (
                  <div 
                    key={req._id}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--border-radius)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem' }}>{req.womenName}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Phone: {req.womenPhone}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Status: <span className="status-badge pending">{req.status}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setActiveChatCase(req)}
                      className="action-btn approve"
                      style={{ padding: '0.5rem 1.2rem', margin: 0 }}
                    >
                      💬 Monitor & Chat
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PoliceDashboard;
