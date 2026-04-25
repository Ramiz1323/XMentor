import { create } from 'zustand';
import doubtService from '../services/doubt.service';

const useDoubtStore = create((set, get) => ({
  doubts: [],
  currentDoubt: null,
  isLoading: false,
  error: null,

  /**
   * @desc Fetch all doubts with optional filters
   */
  fetchDoubts: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await doubtService.getDoubts(filters);
      set({ doubts: response.data, isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error fetching doubts', 
        isLoading: false 
      });
    }
  },

  /**
   * @desc Submit a new doubt
   */
  askDoubt: async (doubtData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await doubtService.askDoubt(doubtData);
      set((state) => ({ 
        doubts: [response.data, ...state.doubts],
        isLoading: false 
      }));
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Error submitting doubt';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  /**
   * @desc Resolve a doubt (Teacher)
   */
  resolveDoubt: async (id, content) => {
    set({ isLoading: true, error: null });
    try {
      const response = await doubtService.resolveDoubt(id, content);
      set((state) => ({
        doubts: state.doubts.map(d => d._id === id ? response.data : d),
        currentDoubt: response.data,
        isLoading: false
      }));
    } catch (error) {
      const msg = error.response?.data?.message || 'Error resolving doubt';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  /**
   * @desc Fetch single doubt details
   */
  fetchDoubtById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await doubtService.getDoubtById(id);
      set({ currentDoubt: response.data, isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error fetching doubt details', 
        isLoading: false 
      });
    }
  },

  /**
   * @desc Delete a pending doubt
   */
  deleteDoubt: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await doubtService.deleteDoubt(id);
      set((state) => ({
        doubts: state.doubts.filter(d => d._id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error deleting doubt', 
        isLoading: false 
      });
    }
  },

  /**
   * @desc Reset error state
   */
  clearError: () => set({ error: null })
}));

export default useDoubtStore;
