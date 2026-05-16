// -----------------------------------------
// Auth Context
// Global authentication state management
// Handles login, register, logout, and token persistence
// -----------------------------------------
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Fetch user profile when token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/profile');
          setUser(response.data.data);
        } catch (error) {
          // Token is invalid or expired
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  // Login with email/password
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user: userData, token: newToken } = response.data.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return response.data;
  };

  // Register new user
  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    const { user: userData, token: newToken } = response.data.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return response.data;
  };

  // Google login
  const googleLogin = async (googleData) => {
    const response = await api.post('/auth/google/login', googleData);
    const { user: userData, token: newToken } = response.data.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return response.data;
  };

  // Login with token (for Google OAuth callback)
  const loginWithToken = async (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    try {
      const response = await api.get('/auth/profile', {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      setUser(response.data.data);
    } catch (error) {
      console.error('Failed to fetch profile with token:', error);
      localStorage.removeItem('token');
      setToken(null);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Update user profile in state
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    googleLogin,
    loginWithToken,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
