import { create } from 'zustand';
import authService from '../services/auth.service';
import userService from '../services/user.service';

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
    isLoading: false,
    authChecked: false,
    error: null,
    
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
        set({ isLoading: true, error: null });
        const data = await userService.getProfile();
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
        set({ isLoading: true, error: null });
        const data = await authService.login(email, password);
        localStorage.setItem('user', JSON.stringify(data.data));
        set({ user: data.data, isAuthenticated: true });
        return data;
      } catch (err) {
        const errorMsg = err.message || 'Login failed';
        set({ error: errorMsg });
        throw err;
      } finally {
        set({ isLoading: false });
      }
    },

    register: async (userData) => {
      try {
        set({ isLoading: true, error: null });
        const data = await authService.register(userData);
        localStorage.setItem('user', JSON.stringify(data.data));
        set({ user: data.data, isAuthenticated: true });
        return data;
      } catch (err) {
        const errorMsg = err.message || 'Registration failed';
        set({ error: errorMsg });
        throw err;
      } finally {
        set({ isLoading: false });
      }
    },

    logout: async () => {
      try {
        set({ isLoading: true });
        await authService.logout();
      } catch (err) {
        console.error('Logout failed on server', err);
      } finally {
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    },
  };
});

export default useAuthStore;
