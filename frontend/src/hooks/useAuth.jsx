// frontend/src/hooks/useAuth.js
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while checking session on mount

  // On mount — try to restore session via refresh token cookie
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.post('/auth/refresh');
        window.__accessToken = data.accessToken;
        const me = await api.get('/auth/me');
        setUser(me.data);
      } catch {
        // No valid session — stay logged out
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    if (data.requiresOtp) {
      return { requiresOtp: true, userId: data.userId };
    }
    window.__accessToken = data.accessToken;
    setUser(data.user);
    return { requiresOtp: false };
  }, []);

  const verifyOtp = useCallback(async (userId, code) => {
    const { data } = await api.post('/auth/verify-otp', { userId, code });
    window.__accessToken = data.accessToken;
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch {}
    window.__accessToken = null;
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
