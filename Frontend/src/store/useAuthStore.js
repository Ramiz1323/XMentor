import { create } from 'zustand';
import api from '../lib/api';

const getInitialUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (err) {
    console.error('Failed to parse user from localStorage', err);
    return null;
  }
};

const useAuthStore = create((set) => {
  const initialUser = getInitialUser();
  
  return {
    user: initialUser,
    isAuthenticated: !!initialUser,
    isLoading: true, // Start with loading true for initial check
    authChecked: false, // Specific flag for initial check completion
    
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
        set({ user: data.data, isAuthenticated: true, authChecked: true });
      } catch (err) {
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false, authChecked: true });
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
        await api.post('/auth/logout'); // Changed to POST to match secondary backend update
      } catch (err) {
        console.error('Logout failed on server', err);
      } finally {
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false });
      }
    },
  };
});

export default useAuthStore;
