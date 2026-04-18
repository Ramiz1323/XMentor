import { create } from 'zustand';
import api from '../lib/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('user'),
  isLoading: true, // Start with loading true for initial check
  
  setUser: (userData) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData, isAuthenticated: true });
    } else {
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const { data } = await api.get('/user/profile');
      localStorage.setItem('user', JSON.stringify(data.data));
      set({ user: data.data, isAuthenticated: true });
    } catch (err) {
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(data.data));
      set({ user: data.data, isAuthenticated: true });
      return data;
    } catch (err) {
      throw err.response?.data || { message: 'Login failed' };
    }
  },

  register: async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('user', JSON.stringify(data.data));
      set({ user: data.data, isAuthenticated: true });
      return data;
    } catch (err) {
      throw err.response?.data || { message: 'Registration failed' };
    }
  },

  logout: async () => {
    try {
      await api.get('/auth/logout');
    } catch (err) {
      console.error('Logout failed on server', err);
    } finally {
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
    }
  },
}));

export default useAuthStore;
