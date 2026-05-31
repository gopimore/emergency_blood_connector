import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  const applyAuthData = (data) => {
    setUser(data?.user ?? null);
    setNeedsProfileSetup(Boolean(data?.needsProfileSetup));
  };

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      applyAuthData(res.data);
    } catch {
      setUser(null);
      setNeedsProfileSetup(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    applyAuthData(res.data);
    return res.data.user;
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    applyAuthData(res.data);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      setNeedsProfileSetup(false);
    }
  };

  const value = {
    user,
    loading,
    needsProfileSetup,
    login,
    register,
    logout,
    refreshUser: fetchMe,
    isDonor: user?.role === 'donor',
    isHospital: user?.role === 'hospital',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
