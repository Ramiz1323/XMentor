import { create } from 'zustand';
import mcqService from '../services/mcq.service';

const useMCQStore = create((set) => ({
  tests: [],
  currentTest: null,
  analytics: null,
  isLoading: false,
  error: null,

  createTest: async (testData) => {
    try {
      set({ isLoading: true, error: null });
      const data = await mcqService.createTest(testData);
      set((state) => ({ tests: [data.data, ...state.tests] }));
      return data;
    } catch (err) {
      set({ error: err.message || 'Failed to create test' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyTests: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await mcqService.getMyTests();
      set({ tests: data.data });
    } catch (err) {
      set({ error: err.message || 'Failed to fetch tests' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTestsByCommunity: async (communityId) => {
    try {
      set({ isLoading: true, error: null });
      const data = await mcqService.getTestsByCommunity(communityId);
      set({ tests: data.data });
    } catch (err) {
      set({ error: err.message || 'Failed to fetch community tests' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTestById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const data = await mcqService.getTestById(id);
      set({ currentTest: data.data });
    } catch (err) {
      set({ error: err.message || 'Failed to fetch test details' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAnalytics: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const data = await mcqService.getAnalytics(id);
      set({ analytics: data.data });
    } catch (err) {
      set({ error: err.message || 'Failed to fetch analytics' });
    } finally {
      set({ isLoading: false });
    }
  },

  submitTest: async (id, submissionData) => {
    try {
      set({ isLoading: true, error: null });
      const data = await mcqService.submitTest(id, submissionData);
      return data;
    } catch (err) {
      set({ error: err.message || 'Failed to submit test' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTeacherOverview: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await mcqService.getTeacherOverview();
      return data.data;
    } catch (err) {
      set({ error: err.message || 'Failed to fetch overview' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useMCQStore;
