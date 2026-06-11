import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import LiveLocationMap from './LiveLocationMap';
import '../css/Chat.css';

const ChatRoom = ({ requestId, requestType = 'normal', readOnly = false }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [womenLoc, setWomenLoc] = useState(null);
  const [helperLoc, setHelperLoc] = useState(null);
  const [isSharingLocation, setIsSharingLocation] = useState(true);
  
  const messagesEndRef = useRef(null);
  const geoWatchIdRef = useRef(null);

  // Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages on mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8000/api/chat/${requestId}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(response.data.messages || []);
      } catch (err) {
        console.error('Error fetching chat history:', err);
      }
    };

    fetchMessages();
  }, [requestId]);

  // Handle Socket listeners
  useEffect(() => {
    if (!socket) return;

    // Join the chat room
    socket.emit('join-room', requestId);

    // Listen for incoming messages
    socket.on('new-message', (newMsg) => {
      if (newMsg.requestId === requestId) {
        setMessages((prev) => [...prev, newMsg]);
      }
    });

    // Listen for live location updates
    socket.on('location-updated', (data) => {
      const { userRole, lat, lng } = data;
      if (userRole === 'women') {
        setWomenLoc({ lat, lng });
      } else {
        setHelperLoc({ lat, lng });
      }
    });

    return () => {
      socket.emit('leave-room', requestId);
      socket.off('new-message');
      socket.off('location-updated');
    };
  }, [socket, requestId]);

  // Watch current position and emit updates
  useEffect(() => {
    if (!socket || !isSharingLocation) {
      if (geoWatchIdRef.current) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
        geoWatchIdRef.current = null;
      }
      return;
    }

    if (navigator.geolocation) {
      geoWatchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Emit location update via Socket
          socket.emit('location-update', {
            requestId,
            lat,
            lng,
            userId: user._id || user.id,
            userName: user.name,
            userRole: user.role
          });

          // Update local marker directly
          if (user.role === 'women') {
            setWomenLoc({ lat, lng });
          } else {
            setHelperLoc({ lat, lng });
          }
        },
        (error) => {
          console.error('Error tracking location:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    return () => {
      if (geoWatchIdRef.current) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
        geoWatchIdRef.current = null;
      }
    };
  }, [socket, isSharingLocation, requestId, user]);

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (readOnly) return;
    if (!inputText.trim()) return;

    const msgData = {
      requestId,
      message: inputText.trim(),
      senderId: user._id || user.id,
      senderName: user.name || user.stationName || 'User',
      senderRole: user.role,
      type: 'text'
    };

    if (socket) {
      socket.emit('send-message', msgData);
    } else {
      // Fallback REST API
      const token = localStorage.getItem('token');
      axios.post(`http://localhost:8000/api/chat/${requestId}/message`, msgData, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => console.error('REST message send failed:', err));
    }

    setInputText('');
  };

  const handleShareLocationToggle = () => {
    setIsSharingLocation(!isSharingLocation);
  };

  return (
    <div className="chat-container">
      {/* Messages Column */}
      <div className="chat-messages-section">
        <div className="chat-header">
          <div className="chat-header-info">
            <span className="chat-header-title">
              {requestType === 'emergencyContact'
                ? 'Emergency Contact Chat'
                : readOnly
                ? `Case History #${requestId.substring(requestId.length - 6)}`
                : `Case #${requestId.substring(requestId.length - 6)}`}
            </span>
            <span className="chat-header-status">
              <span className="chat-status-dot"></span>
              {requestType === 'emergencyContact'
                ? 'Emergency contact channel'
                : readOnly
                ? 'Read-only case history'
                : 'Active emergency chat'}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={isSharingLocation} 
                onChange={handleShareLocationToggle}
                style={{ marginRight: '0.4rem' }}
              />
              Share Live Location
            </label>
          </div>
        </div>

        <div className="chat-messages-list">
          {messages.map((msg, index) => {
            const isOutgoing = msg.senderId === (user._id || user.id);
            return (
              <div 
                key={msg._id || index} 
                className={`chat-message-wrapper ${isOutgoing ? 'outgoing' : 'incoming'}`}
              >
                <div className="chat-message-meta">
                  {msg.senderName} ({msg.senderRole})
                </div>
                <div className="chat-message-bubble">
                  {msg.message}
                  <div className="chat-message-time">
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-area">
          <input
            type="text"
            className="chat-input-field"
            placeholder={readOnly ? 'Chat is read-only for completed case history' : 'Type your safety message...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={readOnly}
          />
          <button type="submit" className="chat-send-btn" disabled={readOnly}>
            ✈
          </button>
        </form>
      </div>

      {/* Map Column */}
      <div className="chat-map-section">
        <div className="chat-map-header">Live Case Map</div>
        <div className="chat-map-body">
          <LiveLocationMap 
            womanLocation={womenLoc}
            helperLocation={helperLoc}
            womanName="Woman"
            helperName="Responder"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
