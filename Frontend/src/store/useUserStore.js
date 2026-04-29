import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import userService from '../services/user.service';
import useAuthStore from './useAuthStore';

const useUserStore = create(
  persist(
    (set) => ({
      profile: null,
      stats: null,
      leaderboard: [],
      isLoading: false,
      error: null,

      fetchLeaderboard: async () => {
        try {
          set({ isLoading: true, error: null });
          const data = await userService.getLeaderboard();
          set({ leaderboard: data.data });
        } catch (err) {
          set({ error: err.message || 'Failed to fetch leaderboard' });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchStats: async () => {
        try {
          set({ isLoading: true, error: null });
          const data = await userService.getStats();
          set({ stats: data.data });
        } catch (err) {
          set({ error: err.message || 'Failed to fetch stats' });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchProfile: async () => {
        try {
          set({ isLoading: true, error: null });
          const data = await userService.getProfile();
          set({ profile: data.data });
        } catch (err) {
          set({ error: err.message || 'Failed to fetch profile' });
        } finally {
          set({ isLoading: false });
        }
      },

      updateProfile: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          const data = await userService.updateProfile(userData);
          set({ profile: data.data });
          useAuthStore.getState().setUser(data.data);
          return data;
        } catch (err) {
          set({ error: err.message || 'Failed to update profile' });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      uploadAvatar: async (formData) => {
        try {
          set({ isLoading: true, error: null });
          const data = await userService.uploadProfilePic(formData);
          set({ profile: data.data });
          useAuthStore.getState().setUser(data.data);
          return data;
        } catch (err) {
          set({ error: err.message || 'Failed to upload avatar' });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'xmentor-user',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        stats: state.stats, 
        leaderboard: state.leaderboard 
      }),
    }
  )
);

export default useUserStore;
