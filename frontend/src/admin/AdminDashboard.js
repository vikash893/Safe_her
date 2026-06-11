import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../css/Dashboard.css';
import '../css/Admin.css';

// Leaflet marker fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons for Admin Map
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const violetIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalWomen: 0,
    totalVolunteers: 0,
    pendingVolunteers: 0,
    approvedVolunteers: 0,
    totalPolice: 0,
    pendingPolice: 0,
    totalRequests: 0,
    activeRequests: 0
  });

  const [activeRequestsList, setActiveRequestsList] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [policeStations, setPoliceStations] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchMapEntities();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/api/admin/dashboard-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  const fetchMapEntities = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch active requests
      const reqsRes = await axios.get('http://localhost:8000/api/admin/requests?status=pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveRequestsList(reqsRes.data.requests || []);

      // Fetch approved volunteers
      const volsRes = await axios.get('http://localhost:8000/api/admin/volunteers?status=approved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVolunteers(volsRes.data.volunteers || []);

      // Fetch approved police
      const policeRes = await axios.get('http://localhost:8000/api/admin/police-stations?status=approved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPoliceStations(policeRes.data.policeStations || []);
    } catch (err) {
      console.error('Error fetching map entities:', err);
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
          <Link to="/admin-dashboard" className="dashboard-nav-item active" style={{ color: '#ffffff', background: '#1d1b26' }}>
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
        <div className="dashboard-header animate-fade-in" style={{ borderBottom: '1px solid #1d1b26', paddingBottom: '1.5rem' }}>
          <div>
            <h1 className="dashboard-title" style={{ color: '#ffffff' }}>System Dashboard</h1>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Real-time system health and portal auditing</p>
          </div>
          <div className="dashboard-user-profile">
            <div className="dashboard-user-info">
              <span className="dashboard-user-name" style={{ color: '#ffffff' }}>{user?.name || 'Administrator'}</span>
              <span className="dashboard-user-role" style={{ color: '#64748b' }}>Root Admin</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card animate-slide-in" style={{ background: '#12111a', borderColor: '#1d1b26' }}>
            <div className="stat-info">
              <span className="stat-value" style={{ color: '#ffffff' }}>{stats.totalWomen}</span>
              <span className="stat-label" style={{ color: '#94a3b8' }}>Women Users</span>
            </div>
            <div className="stat-icon purple">👩</div>
          </div>

          <div className="stat-card animate-slide-in" style={{ background: '#12111a', borderColor: '#1d1b26' }}>
            <div className="stat-info">
              <span className="stat-value" style={{ color: '#ffffff' }}>{stats.approvedVolunteers}</span>
              <span className="stat-label" style={{ color: '#94a3b8' }}>Active Volunteers ({stats.pendingVolunteers} pending)</span>
            </div>
            <div className="stat-icon green">🤝</div>
          </div>

          <div className="stat-card animate-slide-in" style={{ background: '#12111a', borderColor: '#1d1b26' }}>
            <div className="stat-info">
              <span className="stat-value" style={{ color: '#ffffff' }}>{stats.totalPolice}</span>
              <span className="stat-label" style={{ color: '#94a3b8' }}>Police Stations ({stats.pendingPolice} pending)</span>
            </div>
            <div className="stat-icon blue">👮</div>
          </div>

          <div className="stat-card animate-slide-in" style={{ background: '#12111a', borderColor: '#1d1b26' }}>
            <div className="stat-info">
              <span className="stat-value" style={{ color: '#ffffff' }}>{stats.activeRequests}</span>
              <span className="stat-label" style={{ color: '#94a3b8' }}>Active Requests</span>
            </div>
            <div className="stat-icon red">🚨</div>
          </div>
        </div>

        {/* Interactive Live Command Center Map (Senior Developer Feature) */}
        <div className="dashboard-card animate-slide-in" style={{ background: '#12111a', borderColor: '#1d1b26', padding: '1.5rem' }}>
          <div className="dashboard-card-title" style={{ color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Live Security Command Map</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '1rem' }}>
              <span>🔴 Active Alerts</span>
              <span>🟣 Volunteers</span>
              <span>🔵 Police Stations</span>
            </span>
          </div>

          <div style={{ height: '400px', borderRadius: 'var(--border-radius)', overflow: 'hidden', border: '1px solid #1d1b26' }}>
            <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Active Requests */}
              {activeRequestsList.map((req) => (
                req.lat && req.lng && (
                  <Marker key={req._id} position={[req.lat, req.lng]} icon={redIcon}>
                    <Popup>
                      <strong>Active Emergency!</strong><br />
                      User: {req.womenName}<br />
                      Type: {req.type}<br />
                      Phone: {req.womenPhone}
                    </Popup>
                  </Marker>
                )
              ))}

              {/* Volunteers */}
              {volunteers.map((vol) => (
                vol.lat && vol.log && (
                  <Marker key={vol._id} position={[vol.lat, vol.log]} icon={violetIcon}>
                    <Popup>
                      <strong>Volunteer: {vol.name}</strong><br />
                      Pincode: {vol.pincode}<br />
                      Status: {vol.status}
                    </Popup>
                  </Marker>
                )
              ))}

              {/* Police Stations */}
              {policeStations.map((station) => (
                station.lat && station.lng && (
                  <Marker key={station._id} position={[station.lat, station.lng]} icon={blueIcon}>
                    <Popup>
                      <strong>Station: {station.stationName}</strong><br />
                      Officer: {station.officerName}<br />
                      Phone: {station.phone}
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
