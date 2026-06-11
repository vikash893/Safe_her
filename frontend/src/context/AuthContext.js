import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set auth token for all axios requests
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  const login = async (email, password, role) => {
    try {
      let endpoint = 'http://localhost:8000/api/auth/login'; // default to women
      if (role === 'volunteer') {
        endpoint = 'http://localhost:8000/api/volunteers/login';
      } else if (role === 'admin') {
        endpoint = 'http://localhost:8000/api/admin/login';
      } else if (role === 'police') {
        endpoint = 'http://localhost:8000/api/police/login';
      }

      const response = await axios.post(endpoint, { email, password });
      const { token } = response.data;
      
      let userData;
      if (role === 'women') {
        userData = { ...response.data.user, role: 'women' };
      } else if (role === 'volunteer') {
        userData = { ...response.data.volunteer, role: 'volunteer' };
      } else if (role === 'admin') {
        userData = { ...response.data.admin, role: 'admin' };
      } else if (role === 'police') {
        userData = { ...response.data.station, role: 'police' };
      }

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setAuthToken(token);
      
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('user');
  }, []);

  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.warn('Failed to parse cached user:', error);
          localStorage.removeItem('user');
        }
      }

      if (storedToken) {
        try {
          setAuthToken(storedToken);
          const decoded = parseJwt(storedToken);
          if (decoded) {
            const role = decoded.role || decoded.user?.role || (storedUser ? JSON.parse(storedUser).role : null);
            let response;
            
            if (role === 'women') {
              response = await axios.get('http://localhost:8000/api/auth/me');
              setUser({ ...response.data, role: 'women' });
              localStorage.setItem('user', JSON.stringify({ ...response.data, role: 'women' }));
            } else if (role === 'volunteer') {
              response = await axios.get('http://localhost:8000/api/volunteers/verify');
              if (response.data.valid) {
                setUser({ ...response.data.user, role: 'volunteer' });
                localStorage.setItem('user', JSON.stringify({ ...response.data.user, role: 'volunteer' }));
              } else {
                logout();
              }
            } else if (role === 'admin') {
              await axios.get('http://localhost:8000/api/admin/dashboard-stats');
              const adminUser = { id: decoded.id, email: decoded.email, name: decoded.name, role: 'admin' };
              setUser(adminUser);
              localStorage.setItem('user', JSON.stringify(adminUser));
            } else if (role === 'police') {
              await axios.get('http://localhost:8000/api/police/active-alerts');
              const policeUser = { id: decoded.id, email: decoded.email, name: decoded.stationName, role: 'police' };
              setUser(policeUser);
              localStorage.setItem('user', JSON.stringify(policeUser));
            } else {
              logout();
            }
          } else {
            logout();
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    validateToken();
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};