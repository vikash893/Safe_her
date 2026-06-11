import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ChatRoom from '../components/ChatRoom';
import '../css/Dashboard.css';
import '../css/Admin.css';

function VolunteerDashboard() {
  const { user, logout } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [historyRequests, setHistoryRequests] = useState([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [myEmergencyResponses, setMyEmergencyResponses] = useState([]);
  const [activeChatRequest, setActiveChatRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch pending requests
      const pendingRes = await axios.get('http://localhost:8000/api/volunteers/pending-request', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingRequests(pendingRes.data.requests || []);

      const emergencyRes = await axios.get('http://localhost:8000/api/volunteers/emergency-alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmergencyAlerts(emergencyRes.data.alerts || []);

      const responseRes = await axios.get('http://localhost:8000/api/volunteers/my-emergency-responses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyEmergencyResponses(responseRes.data.alerts || []);

      // Fetch my accepted requests
      const myRes = await axios.get('http://localhost:8000/api/volunteers/my-accepted-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyRequests(myRes.data.requests || []);

      const historyRes = await axios.get('http://localhost:8000/api/volunteers/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistoryRequests(historyRes.data.requests || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:8000/api/volunteers/request/${requestId}`,
        {
          email: user.email,
          action: 'accepted'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Request accepted successfully! You can now chat with the user.');
      fetchRequests();
    } catch (err) {
      console.error('Error accepting request:', err);
      alert(err.response?.data?.error || 'Failed to accept request');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to mark this request as completed/resolved?')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:8000/api/volunteers/complete-request/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Request marked as completed.');
      if (activeChatRequest?._id === requestId) {
        setActiveChatRequest(null);
      }
      fetchRequests();
    } catch (err) {
      console.error('Error completing request:', err);
      alert('Failed to complete request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="dashboard-brand">SafeHer Volunteer</div>
        <div className="dashboard-nav">
          <button
            className={`dashboard-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`dashboard-nav-item ${activeTab === 'emergency' ? 'active' : ''}`}
            onClick={() => setActiveTab('emergency')}
          >
            🚨 Emergency Alerts
          </button>
          <button
            className={`dashboard-nav-item ${activeTab === 'responses' ? 'active' : ''}`}
            onClick={() => setActiveTab('responses')}
          >
            ✅ My Responses
          </button>
          <button
            className={`dashboard-nav-item ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            📥 Requests
          </button>
          <button
            className={`dashboard-nav-item ${activeTab === 'cases' ? 'active' : ''}`}
            onClick={() => setActiveTab('cases')}
          >
            🧑‍🤝‍🧑 Active Cases
          </button>
          <button
            className={`dashboard-nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📚 History
          </button>
          <button
            className={`dashboard-nav-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
            disabled={!activeChatRequest}
          >
            💬 Chat
          </button>
        </div>
        <button onClick={logout} className="dashboard-logout">
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="dashboard-header animate-fade-in">
          <div>
            <h1 className="dashboard-title">Welcome back, {user?.name}</h1>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Thank you for volunteering to keep women safe.</p>
          </div>
          <div className="dashboard-user-profile">
            <div className="dashboard-user-info">
              <span className="dashboard-user-name">{user?.name}</span>
              <span className="dashboard-user-role">Community Guardian</span>
            </div>
            {user?.photo && (
              <img
                src={`http://localhost:8000/${user.photo.replace(/\\/g, '/')}`}
                alt="Avatar"
                className="dashboard-user-avatar"
              />
            )}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3 className="dashboard-card-title">Volunteer Overview</h3>
              <p className="text-muted">Navigate your active work, emergency alerts, and assigned cases from the sidebar.</p>
              <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
                <div className="dashboard-card" style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 600 }}>Pending Requests</div>
                  <div style={{ fontSize: '2rem', color: 'var(--primary)' }}>{pendingRequests.length}</div>
                </div>
                <div className="dashboard-card" style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 600 }}>Active Cases</div>
                  <div style={{ fontSize: '2rem', color: 'var(--success)' }}>{myRequests.length}</div>
                </div>
                <div className="dashboard-card" style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 600 }}>Emergency Alerts</div>
                  <div style={{ fontSize: '2rem', color: 'var(--danger)' }}>{emergencyAlerts.length}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="dashboard-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="dashboard-card-title">Emergency Alerts</h3>
              <button onClick={fetchRequests} className="action-btn approve" style={{ margin: 0, padding: '0.3rem 0.8rem' }}>🔄 Refresh</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {emergencyAlerts.length === 0 ? (
                <p className="text-muted">No active emergency alerts right now. You will see them here when someone triggers an alert.</p>
              ) : (
                emergencyAlerts.map((alert) => (
                  <div key={alert._id} className="dashboard-card" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{alert.womenName}</div>
                        <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>Phone: {alert.womenPhone}</p>
                        <p style={{ color: 'var(--text-secondary)' }}>{alert.alreadyAcknowledged ? 'Alarm muted by you.' : 'Please acknowledge and respond.'}</p>
                      </div>
                      <a href={alert.locationLink} target="_blank" rel="noreferrer" className="action-btn approve" style={{ whiteSpace: 'nowrap' }}>
                        View Location
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'responses' && (
          <div className="dashboard-card">
            <h3 className="dashboard-card-title">My Emergency Responses</h3>
            {myEmergencyResponses.length === 0 ? (
              <p className="text-muted">You haven’t responded to any emergency alerts yet.</p>
            ) : (
              myEmergencyResponses.map((alert) => (
                <div key={alert._id} className="dashboard-card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{alert.womenName}</div>
                      <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>Status: {alert.status === 'resolved' ? 'Resolved' : 'Active'}</p>
                      <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Acknowledged on: {alert.acknowledgedAt ? new Date(alert.acknowledgedAt).toLocaleString() : '-'}</p>
                    </div>
                    <a href={alert.locationLink} target="_blank" rel="noreferrer" className="action-btn approve">
                      Open Map
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="dashboard-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="dashboard-card-title">Pending Requests</h3>
              <button onClick={fetchRequests} className="action-btn approve" style={{ margin: 0, padding: '0.3rem 0.8rem' }}>🔄 Refresh</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingRequests.length === 0 ? (
                <p className="text-muted">No pending requests right now.</p>
              ) : (
                pendingRequests.map((req) => (
                  <div key={req._id} className="dashboard-card" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{req.womenName}</div>
                        <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>Phone: {req.womenPhone}</p>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{req.description || 'No description'}</p>
                      </div>
                      <button
                        onClick={() => handleAcceptRequest(req._id)}
                        className="action-btn approve"
                        disabled={loading}
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'cases' && (
          <div className="dashboard-card">
            <h3 className="dashboard-card-title">My Active Cases</h3>
            {myRequests.length === 0 ? (
              <p className="text-muted">You have no accepted cases yet.</p>
            ) : (
              myRequests.map((req) => (
                <div key={req._id} className="dashboard-card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{req.womenName}</div>
                      <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>Phone: {req.womenPhone}</p>
                      <span className={`status-badge ${req.status === 'completed' ? 'completed' : 'approved'}`}>
                        {req.status === 'completed' ? 'Completed' : 'Active'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setActiveChatRequest(req);
                          setActiveTab('chat');
                        }}
                        className="action-btn approve"
                      >
                        💬 Chat
                      </button>
                      {req.status === 'accepted' && (
                        <button
                          onClick={() => handleCompleteRequest(req._id)}
                          className="action-btn reject"
                          disabled={loading}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="dashboard-card">
            <h3 className="dashboard-card-title">Volunteer Request History</h3>
            {historyRequests.length === 0 ? (
              <p className="text-muted">No historical request activity available yet.</p>
            ) : (
              historyRequests.map((req) => (
                <div key={req._id} className="dashboard-card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{req.womenName}</div>
                      <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>Status: {req.status}</p>
                      <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Type: {req.type}</p>
                    </div>
                    <div style={{ minWidth: '140px', textAlign: 'right' }}>
                      <span className={`status-badge ${req.status}`}>{req.status}</span>
                      <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>{new Date(req.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {req.history && req.history.length > 0 && (
                    <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                      {req.history.map((entry, idx) => (
                        <div key={idx} style={{ marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                            <strong>{entry.action.replace('_', ' ')}</strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(entry.timestamp).toLocaleString()}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{entry.comments}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="dashboard-card animate-slide-in">
            <div className="dashboard-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Volunteer Assistance Chat</span>
              <button
                onClick={() => setActiveTab('cases')}
                style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 600 }}
              >
                Back
              </button>
            </div>
            {activeChatRequest ? (
              <ChatRoom
                requestId={activeChatRequest._id}
                requestType={activeChatRequest.type}
                readOnly={activeChatRequest.status === 'completed'}
              />
            ) : (
              <p className="text-muted">Select an active case from the Cases tab to open chat.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VolunteerDashboard;
