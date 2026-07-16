import { create } from 'zustand';
import feeService from '../services/fee.service';

const useFeeStore = create((set, get) => ({
  overview: null,
  payments: [],
  configs: [],
  isLoading: false,
  error: null,

  fetchFeeOverview: async (month) => {
    try {
      set({ isLoading: true, error: null });
      const data = await feeService.getFeeOverview(month);
      set({ overview: data.data });
    } catch (err) {
      set({ error: err.message || 'Failed to fetch fee overview' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPayments: async (params = {}) => {
    try {
      set({ isLoading: true, error: null });
      const data = await feeService.getPayments(params);
      set({ payments: data.data });
    } catch (err) {
      set({ error: err.message || 'Failed to fetch payments' });
    } finally {
      set({ isLoading: false });
    }
  },

  addPayment: async (paymentData) => {
    try {
      set({ isLoading: true, error: null });
      const data = await feeService.recordPayment(paymentData);
      
      // Update local overview if month matches
      const paymentMonth = new Date(data.data.paymentDate).toISOString().slice(0, 7);
      const currentOverviewMonth = get().overview?.month; // Note: overview endpoint might not return month specifically, but let's refresh
      
      // Simply refresh payments list and overview to keep state in sync
      await get().fetchPayments();
      if (get().overview) {
        // Find current date filter or refresh
        await get().fetchFeeOverview();
      }
      return data.data;
    } catch (err) {
      set({ error: err.message || 'Failed to record payment' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  modifyPayment: async (id, paymentData) => {
    try {
      set({ isLoading: true, error: null });
      const data = await feeService.updatePayment(id, paymentData);
      
      // Refresh local lists
      await get().fetchPayments();
      if (get().overview) {
        await get().fetchFeeOverview();
      }
      return data.data;
    } catch (err) {
      set({ error: err.message || 'Failed to update payment' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  removePayment: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await feeService.deletePayment(id);
      
      // Refresh local lists
      await get().fetchPayments();
      if (get().overview) {
        await get().fetchFeeOverview();
      }
    } catch (err) {
      set({ error: err.message || 'Failed to delete payment' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchConfigs: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await feeService.getConfigs();
      set({ configs: data.data });
    } catch (err) {
      set({ error: err.message || 'Failed to fetch rate configurations' });
    } finally {
      set({ isLoading: false });
    }
  },

  changeConfig: async (studentId, monthlyAmount) => {
    try {
      set({ isLoading: true, error: null });
      const data = await feeService.updateConfig({ studentId, monthlyAmount });
      await get().fetchConfigs();
      if (get().overview) {
        await get().fetchFeeOverview();
      }
      return data.data;
    } catch (err) {
      set({ error: err.message || 'Failed to update rate configuration' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  changeDefaultFee: async (defaultMonthlyFee) => {
    try {
      set({ isLoading: true, error: null });
      const data = await feeService.updateDefaultFee({ defaultMonthlyFee });
      
      // Also update local defaultMonthlyFee in overview if exists
      const currentOverview = get().overview;
      if (currentOverview) {
        set({
          overview: {
            ...currentOverview,
            defaultMonthlyFee: data.data.defaultMonthlyFee
          }
        });
      }
      return data.data;
    } catch (err) {
      set({ error: err.message || 'Failed to update default monthly fee' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useFeeStore;
