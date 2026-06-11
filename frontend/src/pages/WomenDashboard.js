import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ChatRoom from '../components/ChatRoom';
import '../css/Dashboard.css';
import '../css/Emergency.css';

function WomenDashboard() {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [description, setDescription] = useState('');
  const [isFeelUnsafe, setIsFeelUnsafe] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [activeChatMode, setActiveChatMode] = useState('volunteer');
  const [feedbackRequest, setFeedbackRequest] = useState(null);
  const [volunteerRating, setVolunteerRating] = useState(0);
  const [volunteerFeedback, setVolunteerFeedback] = useState('');
  const [policeRating, setPoliceRating] = useState(0);
  const [policeFeedback, setPoliceFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/auth/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const incomingRequests = response.data.requests || [];
      setRequests(incomingRequests);
      const acceptedRequest = incomingRequests.find((req) => req.status === 'accepted');
      setActiveRequest((current) => {
        if (current) return current;
        if (acceptedRequest) {
          setActiveChatMode('volunteer');
          return acceptedRequest;
        }
        return current;
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8000/api/request/send-request',
        {
          email: user.email,
          description,
          type: isFeelUnsafe ? 'feel_unsafe' : 'normal'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message);
      setDescription('');
      setIsFeelUnsafe(false);
      fetchDashboardData();
    } catch (err) {
      console.error('Error sending request:', err);
      alert(err.response?.data?.error || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const openFeedbackForm = (req) => {
    setFeedbackRequest(req);
    setVolunteerRating(req.volunteerRating || 0);
    setVolunteerFeedback(req.volunteerFeedback || '');
    setPoliceRating(req.policeRating || 0);
    setPoliceFeedback(req.policeFeedback || '');
  };

  const closeFeedbackForm = () => {
    setFeedbackRequest(null);
    setVolunteerRating(0);
    setVolunteerFeedback('');
    setPoliceRating(0);
    setPoliceFeedback('');
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackRequest) return;

    setFeedbackLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:8000/api/request/feedback/${feedbackRequest._id}`,
        {
          volunteerFeedback,
          volunteerRating,
          policeFeedback: feedbackRequest.type !== 'normal' ? policeFeedback : undefined,
          policeRating: feedbackRequest.type !== 'normal' ? policeRating : undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedRequest = response.data.request;
      setRequests((prev) => prev.map((item) => item._id === updatedRequest._id ? updatedRequest : item));
      alert('Thank you! Your feedback has been recorded.');
      closeFeedbackForm();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert(err.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleEmergencyAlert = async () => {
    if (!window.confirm('Are you sure you want to trigger a CRITICAL EMERGENCY ALERT? This will notify all nearby volunteers and police stations.')) {
      return;
    }

    setEmergencyLoading(true);
    try {
      // Get current location coords
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          const token = localStorage.getItem('token');
          await axios.post(
            'http://localhost:8000/api/emergency/alert',
            { lat, lng },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          alert('🚨 EMERGENCY ALERT SENT! Help is on the way.');
          fetchDashboardData();
        },
        async (err) => {
          console.error('Failed to get location, sending default coords:', err);
          const token = localStorage.getItem('token');
          await axios.post(
            'http://localhost:8000/api/emergency/alert',
            {}, // Use default coords from backend women model
            { headers: { Authorization: `Bearer ${token}` } }
          );
          alert('🚨 EMERGENCY ALERT SENT (using home location)! Help is on the way.');
          fetchDashboardData();
        }
      );
    } catch (err) {
      console.error('Emergency alert failed:', err);
      alert('Failed to send emergency alert');
    } finally {
      setEmergencyLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="dashboard-brand">SafeHer Portal</div>
        <div className="dashboard-nav">
          <button
            className={`dashboard-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            🏠 Dashboard
          </button>
          <button
            className={`dashboard-nav-item ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            📥 My Requests
          </button>
          <button
            className={`dashboard-nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📚 History
          </button>
          <button
            className={`dashboard-nav-item ${activeTab === 'emergency' ? 'active' : ''}`}
            onClick={() => setActiveTab('emergency')}
          >
            🚨 Emergency
          </button>
          <button
            className={`dashboard-nav-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Chat
          </button>
          <button
            className={`dashboard-nav-item ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            📝 Feedback
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
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Protecting you and your community.</p>
          </div>

          <div className="dashboard-user-profile">
            <div className="dashboard-user-info">
              <span className="dashboard-user-name">{user?.name}</span>
              <span className="dashboard-user-role">Safety Member</span>
            </div>
            {user?.imageUrl && (
              <img 
                src={user.imageUrl} 
                alt="Avatar" 
                className="dashboard-user-avatar" 
              />
            )}
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <>
            {/* Big Emergency Button */}
            <div className="emergency-btn-container animate-pulse" style={{ marginBottom: '2rem' }}>
              <button
                className="emergency-btn"
                onClick={handleEmergencyAlert}
                disabled={emergencyLoading}
              >
                {emergencyLoading ? 'Triggering...' : '🚨 Emergency Alert'}
              </button>
            </div>

            <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
              <div className="dashboard-card" style={{ padding: '1.5rem' }}>
                <h3 className="dashboard-card-title">Trusted Emergency Contact</h3>
                <p className="text-muted" style={{ marginBottom: '1rem' }}>Quickly reach your trusted contact outside of the app.</p>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <a className="auth-link" href={`tel:${user?.emergency_phone}`} style={{ display: 'inline-block' }}>
                    📞 Call: {user?.emergency_phone || 'Not available'}
                  </a>
                  <a className="auth-link" href={`mailto:${user?.emergency_email}`} style={{ display: 'inline-block' }}>
                    ✉️ Email: {user?.emergency_email || 'Not available'}
                  </a>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'chat' && (
          <>
            <div className="dashboard-card animate-slide-in">
              <div className="dashboard-card-title">Live Support Chat Options</div>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    className="auth-btn"
                    type="button"
                    onClick={() => setActiveChatMode('volunteer')}
                    disabled={!activeRequest}
                    style={{ flex: 1, minWidth: '200px' }}
                  >
                    Chat with Volunteer
                  </button>
                  <button
                    className="auth-btn"
                    type="button"
                    onClick={() => setActiveChatMode('emergencyContact')}
                    style={{ flex: 1, minWidth: '200px' }}
                  >
                    Chat with Emergency Contact
                  </button>
                </div>
                {!activeRequest && activeChatMode === 'volunteer' && (
                  <p className="text-muted" style={{ marginTop: '0.5rem' }}>
                    No volunteer is assigned yet. Send a request and wait for acceptance before chatting with a volunteer.
                  </p>
                )}
              </div>
            </div>

            {(activeChatMode === 'emergencyContact' || (activeChatMode === 'volunteer' && activeRequest)) && (
              <div className="dashboard-card animate-slide-in">
                <div className="dashboard-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{activeChatMode === 'volunteer' ? 'Volunteer Assistance Chat' : 'Emergency Contact Chat'}</span>
                  <button
                    onClick={() => setActiveChatMode('')}
                    style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 600 }}
                  >
                    Close Chat
                  </button>
                </div>
                <ChatRoom
                  requestId={activeChatMode === 'volunteer' ? activeRequest._id : `emergency-${user?._id || user?.id}`}
                  requestType={activeChatMode}
                />
              </div>
            )}
          </>
        )}

        {activeTab === 'feedback' && (
          <div className="dashboard-card animate-slide-in">
            {feedbackRequest ? (
              <>
                <div className="dashboard-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Submit Case Feedback</span>
                  <button
                    onClick={closeFeedbackForm}
                    style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 600 }}
                  >
                    Close
                  </button>
                </div>
                <form onSubmit={handleSubmitFeedback} style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label className="auth-label">Volunteer Rating</label>
                    <select
                      className="auth-input"
                      value={volunteerRating}
                      onChange={(e) => setVolunteerRating(Number(e.target.value))}
                      required
                    >
                      <option value={0}>Rate volunteer</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="auth-label">Volunteer Feedback</label>
                    <textarea
                      className="auth-input"
                      rows={3}
                      placeholder="Describe your experience with the volunteer"
                      value={volunteerFeedback}
                      onChange={(e) => setVolunteerFeedback(e.target.value)}
                      required
                    />
                  </div>
                  {feedbackRequest.type !== 'normal' && (
                    <>
                      <div>
                        <label className="auth-label">Police Rating</label>
                        <select
                          className="auth-input"
                          value={policeRating}
                          onChange={(e) => setPoliceRating(Number(e.target.value))}
                          required
                        >
                          <option value={0}>Rate police support</option>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="auth-label">Police Feedback</label>
                        <textarea
                          className="auth-input"
                          rows={3}
                          placeholder="Describe your experience with police response"
                          value={policeFeedback}
                          onChange={(e) => setPoliceFeedback(e.target.value)}
                          required
                        />
                      </div>
                    </>
                  )}
                  <button type="submit" className="auth-btn" disabled={feedbackLoading}>
                    {feedbackLoading ? 'Submitting feedback...' : 'Submit Feedback'}
                  </button>
                </form>
              </>
            ) : (
              <div>
                <h3 className="dashboard-card-title">Submit Feedback</h3>
                <p className="text-muted">Select a completed case from the Requests tab to fill feedback.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            {/* Send Request Form */}
            <div className="dashboard-card">
              <h3 className="dashboard-card-title">Log a Help Request</h3>
              <form onSubmit={handleSendRequest}>
                <div className="auth-form-group">
                  <label className="auth-label" style={{ color: 'var(--text-primary)' }}>Describe your situation</label>
                  <textarea
                    className="auth-input"
                    style={{ minHeight: '100px', resize: 'vertical', background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                    placeholder="Need assistance walking home, feeling followed, general safety companion needed..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                {/* Feel Unsafe Toggle */}
                <div className="unsafe-card">
                  <div className="unsafe-info">
                    <span className="unsafe-title">⚠️ Feel Unsafe?</span>
                    <span className="unsafe-desc">This immediately alerts the nearest police station.</span>
                  </div>
                  <label className="unsafe-switch">
                    <input
                      type="checkbox"
                      checked={isFeelUnsafe}
                      onChange={(e) => setIsFeelUnsafe(e.target.checked)}
                    />
                    <span className="unsafe-slider"></span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="auth-btn"
                  style={{ width: '100%', margin: 0 }}
                  disabled={loading}
                >
                  {loading ? 'Submitting request...' : 'Send Help Request'}
                </button>
              </form>
            </div>

            {/* Past Requests List */}
            <div className="dashboard-card">
              <h3 className="dashboard-card-title">Your Active & Past Requests</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                {requests.length === 0 ? (
                  <p className="text-muted text-center" style={{ padding: '2rem' }}>No safety requests logged yet.</p>
                ) : (
                  requests.map((req) => (
                    <div
                      key={req._id}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--border-radius-sm)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-primary)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                          {req.type === 'feel_unsafe' ? '⚠️ Police Alert' : '🤝 Volunteer Companion'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          {req.description || 'No description provided'}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
                          <span className={`status-badge ${req.status}`}>
                            {req.status}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {req.status === 'accepted' ? (
                        <button
                          onClick={() => setActiveRequest(req)}
                          className="action-btn approve"
                          style={{ padding: '0.5rem 1rem', margin: 0 }}
                        >
                          💬 Chat
                        </button>
                      ) : req.status === 'completed' && !req.feedbackSubmitted ? (
                        <button
                          onClick={() => {
                            openFeedbackForm(req);
                            setActiveTab('feedback');
                          }}
                          className="action-btn approve"
                          style={{ padding: '0.5rem 1rem', margin: 0 }}
                        >
                          📝 Submit Feedback
                        </button>
                      ) : req.status === 'completed' && req.feedbackSubmitted ? (
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>Feedback submitted</span>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="dashboard-card">
            <h3 className="dashboard-card-title">Request History</h3>
            {requests.length === 0 ? (
              <p className="text-muted">No request history available yet.</p>
            ) : (
              requests.map((req) => (
                <div key={req._id} className="dashboard-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{req.type === 'feel_unsafe' ? 'Police Alert' : 'Support Request'}</div>
                      <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>Status: {req.status}</p>
                      <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Submitted on: {new Date(req.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`status-badge ${req.status}`} style={{ alignSelf: 'center' }}>{req.status}</span>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{req.description || 'No description provided.'}</div>
                    {req.history && req.history.length > 0 && (
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem' }}>History</h4>
                        {req.history.map((entry, idx) => (
                          <div key={idx} style={{ marginTop: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                              <strong>{entry.action.replace('_', ' ')}</strong>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(entry.timestamp).toLocaleString()}</span>
                            </div>
                            <p style={{ margin: '0.3rem 0 0', color: 'var(--text-muted)' }}>{entry.comments}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default WomenDashboard;
