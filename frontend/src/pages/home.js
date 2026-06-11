import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Auth.css';

function Home() {
  return (
    <div className="auth-container" style={{ flexDirection: 'column', gap: '2rem' }}>
      <div className="text-center animate-fade-in" style={{ zIndex: 2 }}>
        <h1 className="auth-title" style={{ fontSize: '3rem', margin: 0, letterSpacing: '-0.5px' }}>
          SafeHer
        </h1>
        <p className="auth-subtitle" style={{ fontSize: '1.2rem', marginTop: '0.5rem', marginBottom: 0 }}>
          Empowering women safety through community and real-time response
        </p>
      </div>

      <div 
        className="animate-slide-in"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          width: '100%',
          maxWidth: '1000px',
          padding: '0 1rem',
          zIndex: 2
        }}
      >
        {/* Women Section */}
        <div className="auth-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>👩</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.75rem', textAlign: 'center' }}>Women Portal</h3>
          <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', flex: 1, marginBottom: '1.5rem' }}>
            Request assistance, trigger emergency alerts, track live location, and chat with responders.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/login" style={{ width: '100%' }}>
              <button className="auth-btn" style={{ margin: 0 }}>Login</button>
            </Link>
            <Link to="/register" style={{ width: '100%' }}>
              <button 
                className="auth-btn" 
                style={{ 
                  margin: 0, 
                  background: 'transparent', 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: 'none'
                }}
              >
                Register
              </button>
            </Link>
          </div>
        </div>

        {/* Volunteer Section */}
        <div className="auth-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>🤝</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.75rem', textAlign: 'center' }}>Volunteer Portal</h3>
          <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', flex: 1, marginBottom: '1.5rem' }}>
            Register as a community volunteer to receive nearby help requests and save lives.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/volunteer-login" style={{ width: '100%' }}>
              <button className="auth-btn" style={{ margin: 0, background: 'linear-gradient(135deg, #805ad5 0%, #b7791f 100%)' }}>Login</button>
            </Link>
            <Link to="/volunteer-register" style={{ width: '100%' }}>
              <button 
                className="auth-btn" 
                style={{ 
                  margin: 0, 
                  background: 'transparent', 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: 'none'
                }}
              >
                Register
              </button>
            </Link>
          </div>
        </div>

        {/* Police Station Section */}
        <div className="auth-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>👮</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.75rem', textAlign: 'center' }}>Police Station</h3>
          <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', flex: 1, marginBottom: '1.5rem' }}>
            Monitor alerts, coordinate emergency dispatch, and maintain live chats with citizens.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/police-login" style={{ width: '100%' }}>
              <button className="auth-btn" style={{ margin: 0, background: 'linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)' }}>Login</button>
            </Link>
            <Link to="/police-register" style={{ width: '100%' }}>
              <button 
                className="auth-btn" 
                style={{ 
                  margin: 0, 
                  background: 'transparent', 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: 'none'
                }}
              >
                Register
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div style={{ zIndex: 2 }}>
        <Link to="/admin-login" className="auth-link" style={{ fontSize: '0.9rem' }}>
          🛡 Access Admin Panel
        </Link>
      </div>
    </div>
  );
}

export default Home;