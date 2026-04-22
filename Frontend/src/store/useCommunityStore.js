import { create } from 'zustand';
import communityService from '../services/community.service';

const useCommunityStore = create((set) => ({
  communities: [],
  currentCommunity: null,
  members: [],
  isLoading: false,
  error: null,

  fetchAllCommunities: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await communityService.getAllCommunities();
      set({ communities: data.data });
    } catch (err) {
      set({ error: err.message || 'Failed to fetch communities' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCommunityById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const data = await communityService.getCommunityById(id);
      set({ currentCommunity: data.data });
    } catch (err) {
      set({ error: err.message || 'Failed to fetch community details' });
    } finally {
      set({ isLoading: false });
    }
  },

  createCommunity: async (communityData) => {
    try {
      set({ isLoading: true, error: null });
      const data = await communityService.createCommunity(communityData);
      set((state) => ({ communities: [data.data, ...state.communities] }));
      return data;
    } catch (err) {
      set({ error: err.message || 'Failed to create community' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  joinCommunity: async (id, joinCode) => {
    try {
      set({ isLoading: true, error: null });
      const data = await communityService.joinCommunity(id, joinCode);
      return data;
    } catch (err) {
      set({ error: err.message || 'Failed to join community' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMembers: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const data = await communityService.getMembers(id);
      set({ members: data.data });
    } catch (err) {
      set({ error: err.message || 'Failed to fetch members' });
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useCommunityStore;
