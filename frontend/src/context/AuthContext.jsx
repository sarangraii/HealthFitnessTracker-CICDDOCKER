import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    setToken(response.data.access_token);
    setUser(response.data.user);
    localStorage.setItem('token', response.data.access_token);
    return response.data;
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    setToken(response.data.access_token);
    setUser(response.data.user);
    localStorage.setItem('token', response.data.access_token);
    return response.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  // NEW: Update user data (for profile updates)
  const updateUser = (updatedData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedData
    }));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser: updateUser,  // Added this!
      token, 
      loading, 
      login, 
      register, 
      logout, 
      loadUser,             // Add this for manual refresh
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};