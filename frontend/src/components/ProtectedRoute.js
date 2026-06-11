import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid var(--border-color)',
          borderTop: '5px solid var(--primary)',
          borderRadius: '50%',
          animation: 'pulse 1.5s infinite linear'
        }}></div>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Securing session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = '/';
    return null;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    window.location.href = '/';
    return null;
  }

  return children;
};

export default ProtectedRoute;