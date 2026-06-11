import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import '../css/Emergency.css';

const EmergencyBuzzer = () => {
  const socket = useSocket();
  const { user } = useAuth();
  const [activeAlert, setActiveAlert] = useState(null);
  
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Play alarm sound using Web Audio API
  const startAlarmSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      // If already playing, return
      if (oscillatorRef.current) return;

      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch alarm tone
      
      // Siren effect: alternate frequency
      let alternate = true;
      const interval = setInterval(() => {
        if (!oscillatorRef.current) {
          clearInterval(interval);
          return;
        }
        osc.frequency.setValueAtTime(alternate ? 880 : 440, ctx.currentTime);
        alternate = !alternate;
      }, 300);

      gain.gain.setValueAtTime(0.5, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
    } catch (e) {
      console.error('Failed to play alarm audio:', e);
    }
  };

  const stopAlarmSound = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (e) {}
      oscillatorRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current = null;
    }
  };

  useEffect(() => {
    if (!socket || !user) return;

    // Listen for emergency alerts
    socket.on('emergency-buzzer', (alertData) => {
      // Only notify volunteers and police
      if (['volunteer', 'police'].includes(user.role)) {
        setActiveAlert(alertData);
        startAlarmSound();
      }
    });

    // Listen for alert resolution
    socket.on('alert-resolved', (data) => {
      if (activeAlert && activeAlert.alertId === data.alertId) {
        setActiveAlert(null);
        stopAlarmSound();
      }
    });

    return () => {
      socket.off('emergency-buzzer');
      socket.off('alert-resolved');
      stopAlarmSound();
    };
  }, [socket, user, activeAlert]);

  const handleAcknowledge = async () => {
    if (!activeAlert) return;

    try {
      const token = localStorage.getItem('token');
      // POST acknowledgement to API
      await axios.patch(
        `http://localhost:8000/api/emergency/alert/${activeAlert.alertId}/acknowledge`,
        {
          name: user.name || user.stationName,
          role: user.role
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Emit socket acknowledge
      if (socket) {
        socket.emit('buzzer-acknowledge', {
          alertId: activeAlert.alertId,
          userId: user.id || user._id,
          name: user.name || user.stationName,
          role: user.role
        });
      }

      setActiveAlert(null);
      stopAlarmSound();
    } catch (err) {
      console.error('Error acknowledging emergency alert:', err);
      // Clean up sound anyway
      setActiveAlert(null);
      stopAlarmSound();
    }
  };

  if (!activeAlert) return null;

  return (
    <div className="buzzer-overlay">
      <div className="buzzer-content">
        <div className="buzzer-icon">🚨</div>
        <h2 className="buzzer-title">Critical Emergency Alert</h2>
        <p className="buzzer-subtitle">Immediate response required! A user has requested assistance.</p>
        
        <div className="buzzer-details">
          <div className="buzzer-detail-item">
            <span className="buzzer-detail-label">Name:</span>
            <span>{activeAlert.womanName}</span>
          </div>
          <div className="buzzer-detail-item">
            <span className="buzzer-detail-label">Phone:</span>
            <span>{activeAlert.womanPhone}</span>
          </div>
          <div className="buzzer-detail-item">
            <span className="buzzer-detail-label">Location link:</span>
            <a 
              href={activeAlert.locationLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: '#ff9999', textDecoration: 'underline', wordBreak: 'break-all' }}
            >
              Google Maps Location
            </a>
          </div>
        </div>

        <button onClick={handleAcknowledge} className="buzzer-btn">
          Acknowledge & Mute Alarm
        </button>
      </div>
    </div>
  );
};

export default EmergencyBuzzer;
