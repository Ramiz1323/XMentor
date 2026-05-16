import { create } from 'zustand';
import api from '../lib/api';
import useAuthStore from './useAuthStore';

const useShopStore = create((set, get) => ({
  items: [],
  isLoading: false,
  isBuying: false,
  isClaimingDaily: false,
  error: null,

  // ──────────────────────────────────────
  // Fetch all shop items
  // ──────────────────────────────────────
  fetchItems: async () => {
    if (get().items.length > 0) return; // Already loaded
    try {
      set({ isLoading: true, error: null });
      const res = await api.get('/shop/items');
      set({ items: res.data.data });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  // ──────────────────────────────────────
  // Buy an item — optimistically updates user points in authStore
  // ──────────────────────────────────────
  buyItem: async (itemId) => {
    set({ isBuying: itemId });
    try {
      const res = await api.post('/shop/buy', { itemId });
      const { newBalance, inventory } = res.data.data;

      // Sync balance + inventory back into auth store
      const currentUser = useAuthStore.getState().user;
      useAuthStore.getState().setUser({
        ...currentUser,
        points: newBalance,
        inventory,
      });

      return res.data;
    } finally {
      set({ isBuying: false });
    }
  },

  // ──────────────────────────────────────
  // Claim daily login bonus
  // ──────────────────────────────────────
  claimDailyLogin: async () => {
    set({ isClaimingDaily: true });
    try {
      const res = await api.post('/shop/daily-login');
      const { newBalance } = res.data.data;

      const currentUser = useAuthStore.getState().user;
      useAuthStore.getState().setUser({
        ...currentUser,
        points: newBalance,
        lastDailyLogin: new Date().toISOString(),
      });

      return res.data;
    } finally {
      set({ isClaimingDaily: false });
    }
  },

  usePauseToken: async (testId) => {
    try {
      const res = await api.post('/shop/use-pause', { testId });
      const { inventory, newPauseLimit } = res.data.data;

      const currentUser = useAuthStore.getState().user;
      useAuthStore.getState().setUser({ ...currentUser, inventory });

      return { ...res.data, newPauseLimit };
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  useDeadlineExtend: async (testId) => {
    try {
      const res = await api.post('/shop/use-deadline-extend', { testId });
      const { inventory, newDeadline } = res.data.data;

      const currentUser = useAuthStore.getState().user;
      useAuthStore.getState().setUser({ ...currentUser, inventory });

      return { ...res.data, newDeadline };
    } catch (err) {
      throw err.response?.data || err;
    }
  },
}));

export default useShopStore;
