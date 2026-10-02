import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('revina_user')) || null; } catch { return null; }
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('revina_token')));

  useEffect(() => {
    if (!localStorage.getItem('revina_token')) return;
    api.get('/auth/me')
      .then(({ data }) => { setUser(data); localStorage.setItem('revina_user', JSON.stringify(data)); })
      .catch(() => { setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('revina_token', data.token);
    localStorage.setItem('revina_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (details) => api.post('/auth/register', details);
  const refreshUser = async () => {
    const { data } = await api.get('/auth/me');
    setUser(data);
    localStorage.setItem('revina_user', JSON.stringify(data));
    return data;
  };
  const logout = () => {
    localStorage.removeItem('revina_token');
    localStorage.removeItem('revina_user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, refreshUser, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);