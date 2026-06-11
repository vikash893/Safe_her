import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../css/Dashboard.css';
import '../css/Admin.css';

function ManageRequests() {
  const { logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequestChat, setSelectedRequestChat] = useState(null); // for chat logs modal
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/api/admin/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewChat = async (req) => {
    setSelectedRequestChat(req);
    setChatLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8000/api/chat/${req._id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatMessages(res.data.messages || []);
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    } finally {
      setChatLoading(false);
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
          <Link to="/admin/police" className="dashboard-nav-item">
            👮 Manage Police
          </Link>
          <Link to="/admin/requests" className="dashboard-nav-item active" style={{ color: '#ffffff', background: '#1d1b26' }}>
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
            <h1 className="dashboard-title" style={{ color: '#ffffff' }}>Help Requests Logs</h1>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Audit trail of all emergency alerts and companion requests</p>
          </div>
        </div>

        {/* Requests Table */}
        <div className="admin-table-container" style={{ background: '#12111a', borderColor: '#1d1b26' }}>
          {loading ? (
            <div className="text-center" style={{ padding: '3rem', color: '#94a3b8' }}>Loading request logs...</div>
          ) : requests.length === 0 ? (
            <div className="text-center" style={{ padding: '3rem', color: '#94a3b8' }}>No requests logged yet.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Request ID</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>User</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Details</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Type</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Status</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Responder</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Date</th>
                  <th style={{ color: '#94a3b8', borderBottomColor: '#1d1b26' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id} style={{ borderBottomColor: '#1d1b26' }}>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>#{req._id.substring(req._id.length - 6)}</td>
                    <td style={{ color: '#ffffff', fontWeight: 600 }}>
                      <div>{req.womenName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{req.womenPhone}</div>
                    </td>
                    <td style={{ color: '#94a3b8', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req.description || 'No description provided'}
                    </td>
                    <td>
                      <span className={`status-badge ${req.type === 'feel_unsafe' ? 'pending' : req.type === 'emergency' ? 'rejected' : 'completed'}`}>
                        {req.type}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${req.status}`}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                      {req.acceptedBy ? req.acceptedBy : <span style={{ color: '#64748b' }}>Unassigned</span>}
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                      {new Date(req.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td>
                      {req.status === 'accepted' || req.status === 'completed' ? (
                        <button 
                          onClick={() => handleViewChat(req)} 
                          className="action-btn approve"
                          style={{ margin: 0 }}
                        >
                          Audit Chat
                        </button>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>No Chat</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Audit Chat Logs Modal */}
        {selectedRequestChat && (
          <div className="admin-modal-overlay" onClick={() => setSelectedRequestChat(null)}>
            <div className="admin-modal animate-slide-in" onClick={(e) => e.stopPropagation()} style={{ background: '#12111a', borderColor: '#1d1b26' }}>
              <button className="admin-modal-close" onClick={() => setSelectedRequestChat(null)}>×</button>
              <h3 className="admin-modal-title" style={{ color: '#ffffff' }}>Audit Chat Logs: #{selectedRequestChat._id.substring(selectedRequestChat._id.length - 6)}</h3>
              
              <div style={{ maxHeight: '350px', overflowY: 'auto', background: '#09080f', borderRadius: '8px', padding: '1rem', border: '1px solid #1d1b26', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {chatLoading ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center' }}>Loading message audit trail...</p>
                ) : chatMessages.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center' }}>No messages exchanged in this session.</p>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} style={{ borderBottom: '1px solid #1d1b26', paddingBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.2rem' }}>
                        <span><strong>{msg.senderName}</strong> ({msg.senderRole})</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p style={{ color: '#ffffff', margin: 0, fontSize: '0.95rem' }}>{msg.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                <button 
                  onClick={() => setSelectedRequestChat(null)} 
                  className="action-btn approve"
                  style={{ background: '#1e293b', color: '#ffffff', border: '1px solid #1d1b26' }}
                >
                  Close Audit Logs
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageRequests;
