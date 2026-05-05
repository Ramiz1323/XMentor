import { create } from 'zustand';
import authService from '../services/auth.service';
import userService from '../services/user.service';

const useAuthStore = create(
  (set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    authChecked: false,
    error: null,
    isServerDown: false,

    setServerDown: (status) => set({ isServerDown: status }),

    setUser: (userData) => {
      set({
        user: userData,
        isAuthenticated: !!userData,
        authChecked: true,
      });
    },

    checkAuth: async () => {
      try {
        // Always start fresh — no cached state trusted.
        // The loader in App blocks all UI until this resolves.
        set({ isLoading: true, error: null, authChecked: false, isAuthenticated: false });
        const data = await userService.getProfile();
        set({
          user: data.data,
          isAuthenticated: true,
          authChecked: true,
        });
      } catch (err) {
        set({
          user: null,
          isAuthenticated: false,
          authChecked: true,
        });
      } finally {
        set({ isLoading: false });
      }
    },

    login: async (email, password) => {
      try {
        set({ isLoading: true, error: null });
        const data = await authService.login(email, password);
        set({
          user: data.data,
          isAuthenticated: true,
          authChecked: true,
        });
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
        set({
          user: data.data,
          isAuthenticated: true,
          authChecked: true,
        });
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

        // Clear service worker cache
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_TACTICAL_CACHE' });
        }

        // Clear all storage keys (belt-and-suspenders cleanup)
        const keys = ['xmentor-subjective', 'xmentor-mcq', 'xmentor-user', 'xmentor-auth'];
        keys.forEach((key) => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
      } catch (err) {
        console.error('Logout failed on server', err);
      } finally {
        set({
          user: null,
          isAuthenticated: false,
          authChecked: true,
          isLoading: false,
        });
      }
    },
  })
);

export default useAuthStore;
