import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import authService from '../services/auth.service';
import userService from '../services/user.service';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      authChecked: false,
      error: null,
      
      setUser: (userData) => {
        set({ 
          user: userData, 
          isAuthenticated: !!userData,
          authChecked: true 
        });
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true, error: null });
          const data = await userService.getProfile();
          set({ 
            user: data.data, 
            isAuthenticated: true, 
            authChecked: true 
          });
        } catch (err) {
          set({ 
            user: null, 
            isAuthenticated: false, 
            authChecked: true 
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
            authChecked: true
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
            authChecked: true
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
        } catch (err) {
          console.error('Logout failed on server', err);
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false, 
            authChecked: true,
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'xmentor-auth', // key in sessionStorage
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state) => {
        if (state && state.user) {
          state.isAuthenticated = true;
        }
      },
      partialize: (state) => ({ 
        user: state.user 
      }), // only persist user, isAuthenticated will be derived/re-checked
    }
  )
);

export default useAuthStore;
