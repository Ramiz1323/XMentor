import { create } from 'zustand';
import userService from '../services/user.service';

const useUserStore = create((set) => ({
  profile: null,
  isLoading: false,
  error: null,

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
      return data;
    } catch (err) {
      set({ error: err.message || 'Failed to upload avatar' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useUserStore;
