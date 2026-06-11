import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../css/Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(
        "http://localhost:8000/api/auth/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(res.data);
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const handleSOS = () => {
    // Emergency SOS functionality
    alert("🚨 SOS Alert Sent! Help is on the way.");
    // You can integrate actual SOS API here
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🛡️</span>
          <span className="logo-text">SafeHer</span>
        </Link>

        {/* Mobile Menu Button */}
        <button 
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="menu-icon">☰</span>
        </button>

        {/* Nav Links */}
        <div className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            <span>🏠</span> Home
          </Link>
          <Link to="/safety-tips" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            <span>📚</span> Safety Tips
          </Link>
          <Link to="/emergency-contacts" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            <span>📞</span> Emergency
          </Link>
          <Link to="/track-location" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            <span>📍</span> Live Track
          </Link>
          
          {/* SOS Button */}
          <button className="sos-button" onClick={handleSOS}>
            🚨 SOS
          </button>

          {/* User Profile Dropdown */}
          {user ? (
            <div className="user-dropdown">
              <button 
                className="user-profile-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <img 
                  src={user.imageUrl || "https://via.placeholder.com/40"} 
                  alt="profile"
                  className="profile-image"
                />
                <span className="user-name">{user.name?.split(" ")[0]}</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <img 
                      src={user.imageUrl || "https://via.placeholder.com/40"} 
                      alt="profile"
                      className="dropdown-profile-img"
                    />
                    <div>
                      <p className="dropdown-name">{user.name}</p>
                      <p className="dropdown-email">{user.email}</p>
                    </div>
                  </div>
                  <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                    <span>👤</span> My Profile
                  </Link>
                  <Link to="/safety-settings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                    <span>⚙️</span> Safety Settings
                  </Link>
                  <Link to="/emergency-contacts" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                    <span>👥</span> Trusted Contacts
                  </Link>
                  <Link to="/sos-history" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                    <span>📜</span> SOS History
                  </Link>
                  <hr className="dropdown-divider" />
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">Login</Link>
              <Link to="/signup" className="signup-btn">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;