import { create } from 'zustand';
import communityService from '../services/community.service';

const useCommunityStore = create((set) => ({
  communities: [],
  currentCommunity: null,
  messages: [],
  members: [],
  hasMore: true,
  isLoading: false,
  isFetchingMore: false,
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
      set({ isLoading: true, error: null, currentCommunity: null });
      const data = await communityService.getCommunityById(id);
      set({ currentCommunity: data.data });
    } catch (err) {
      set({ error: err.message || 'Failed to fetch community details' });
    } finally {
      set({ isLoading: false });
    }
  },

  createCommunity: async (communityData) => {
    const tempId = 'temp-' + Date.now();
    const optimisticCommunity = {
      _id: tempId,
      ...communityData,
      memberCount: 1,
      isMember: true,
      isOptimistic: true
    };

    set((state) => ({ communities: [optimisticCommunity, ...state.communities] }));

    try {
      const data = await communityService.createCommunity(communityData);
      set((state) => ({
        communities: state.communities.map(c => c._id === tempId ? data.data : c)
      }));
      return data;
    } catch (err) {
      set((state) => ({
        communities: state.communities.filter(c => c._id !== tempId),
        error: err.message || 'Failed to create community'
      }));
      throw err;
    }
  },

  joinCommunity: async (id, alias, accessCode) => {
    // We can't fully update the community object without the server response (member info, etc.),
    // but we can mark it as joining.
    set((state) => ({
      communities: state.communities.map(c => 
        c._id === id ? { ...c, isJoining: true } : c
      )
    }));

    try {
      const data = await communityService.joinCommunity(id, alias, accessCode);
      set((state) => ({
        communities: state.communities.map(c => 
          c._id === id ? { ...c, isMember: true, memberCount: (c.memberCount || 0) + 1, isJoining: false } : c
        )
      }));
      return data;
    } catch (err) {
      set((state) => ({
        communities: state.communities.map(c => 
          c._id === id ? { ...c, isJoining: false } : c
        ),
        error: err.message || 'Failed to join community'
      }));
      throw err;
    }
  },

  leaveCommunity: async (id) => {
    const previousCommunities = [...useCommunityStore.getState().communities];
    
    set((state) => ({
      communities: state.communities.map(c => 
        c._id === id ? { ...c, isMember: false, memberCount: Math.max(0, (c.memberCount || 1) - 1) } : c
      )
    }));

    try {
      await communityService.leaveCommunity(id);
    } catch (err) {
      set({ 
        communities: previousCommunities,
        error: err.message || 'Failed to leave community' 
      });
      throw err;
    }
  },

  fetchHistory: async (id, page = 1) => {
    try {
      if (page === 1) {
        set({ isLoading: true, error: null, messages: [], hasMore: true });
      } else {
        set({ isFetchingMore: true, error: null });
      }
      const data = await communityService.getHistory(id, page);
      const newMessages = data.data || [];
      
      set((state) => ({ 
        messages: page === 1 ? newMessages : [...newMessages, ...state.messages],
        hasMore: newMessages.length === 30
      }));
    } catch (err) {
      set({ error: err.message || 'Failed to fetch chat history' });
    } finally {
      set((state) => {
        const updates = { isFetchingMore: false };
        if (page === 1) updates.isLoading = false;
        return updates;
      });
    }
  },

  fetchMembers: async (id) => {
    let didSetLoading = false;
    set((state) => {
      if (!state.isLoading) {
        didSetLoading = true;
        return { isLoading: true, error: null };
      }
      return { error: null };
    });
    try {
      const data = await communityService.getMembers(id);
      set({ members: data.data });
    } catch (err) {
      set({ error: err.message || 'Failed to fetch members' });
    } finally {
      if (didSetLoading) {
        set({ isLoading: false });
      }
    }
  },

  deleteCommunity: async (id) => {
    const previousCommunities = [...useCommunityStore.getState().communities];
    
    set((state) => ({
      communities: state.communities.filter(c => c._id !== id)
    }));

    try {
      await communityService.deleteCommunity(id);
    } catch (err) {
      set({ 
        communities: previousCommunities,
        error: err.message || 'Failed to delete community' 
      });
      throw err;
    }
  },

  verifyPasscode: async (id, passcode) => {
    try {
      set({ isLoading: true, error: null });
      await communityService.verifyPasscode(id, passcode);
      return true;
    } catch (err) {
      set({ error: err.message || 'Verification failed' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useCommunityStore;
