import { create } from 'zustand';

import mcqService from '../services/mcq.service';

const useMCQStore = create((set) => ({
      tests: [],
      hasMore: true,
      page: 1,
      currentTest: null,
      analytics: null,
      isLoading: false,
      isLoadingMore: false,
      error: null,
      total: 0,
      filters: { search: '', subject: 'ALL' },

      fetchMyTests: async (isLoadMore = false) => {
        try {
          const state = useMCQStore.getState();
          if (isLoadMore) {
            set({ isLoadingMore: true });
          } else {
            set({ isLoading: true, error: null, page: 1 });
          }

          const currentPage = isLoadMore ? state.page + 1 : 1;
          const data = await mcqService.getMyTests({
            page: currentPage,
            limit: 10,
            ...state.filters
          });

          const newTests = data.data.data;
          
          set((state) => ({
            tests: isLoadMore ? [...state.tests, ...newTests] : newTests,
            total: data.data.total,
            hasMore: data.data.hasMore,
            page: currentPage
          }));
        } catch (err) {
          set({ error: err.message || 'Failed to fetch tests' });
        } finally {
          set({ isLoading: false, isLoadingMore: false });
        }
      },

      setFilters: (newFilters) => {
        set((state) => ({ 
          filters: { ...state.filters, ...newFilters },
          tests: [], // Clear existing tests when filters change
          page: 1,
          hasMore: true
        }));
      },

      resetTests: () => set({ tests: [], page: 1, hasMore: true, total: 0 }),

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
          set({ isLoading: true, error: null, currentTest: null });
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
          set({ isLoading: true, error: null, analytics: null });
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
      
      pauseTest: async (id, pauseData) => {
        try {
          set({ isLoading: true, error: null });
          const data = await mcqService.pauseTest(id, pauseData);
          return data;
        } catch (err) {
          set({ error: err.message || 'Failed to pause test' });
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
      },

  assignToStudents: async (id, studentIds) => {
    try {
      set({ isLoading: true, error: null });
      const data = await mcqService.assignToStudents(id, studentIds);
      return data;
    } catch (err) {
      set({ error: err.message || 'Failed to assign students' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
  createTest: async (testData) => {
    const tempId = 'temp-' + Date.now();
    const optimisticTest = {
      _id: tempId,
      ...testData,
      totalQuestions: testData.questions?.length || 0,
      isOptimistic: true,
      createdBy: { name: 'You (Mentor)' }
    };

    set((state) => ({ tests: [optimisticTest, ...state.tests], isLoading: true, error: null }));

    try {
      const data = await mcqService.createTest(testData);
      set((state) => ({
        tests: state.communities ? state.tests.map(t => t._id === tempId ? data.data : t) : [data.data, ...state.tests],
        isLoading: false
      }));
      return data;
    } catch (err) {
      set((state) => ({
        tests: state.tests.filter(t => t._id !== tempId),
        isLoading: false,
        error: err.message || 'Failed to create test'
      }));
      throw err;
    }
  },

  deleteTest: async (id) => {
    const previousTests = [...useMCQStore.getState().tests];
    set((state) => ({
      tests: state.tests.filter(t => t._id !== id)
    }));

    try {
      await mcqService.deleteTest(id);
    } catch (err) {
      set({ tests: previousTests, error: err.message || 'Failed to delete test' });
      throw err;
    }
  },

  reassignStudent: async (testId, studentId) => {
    try {
      set({ isLoading: true, error: null });
      try {
        await mcqService.reassign(testId, studentId);
      } catch (err) {
        throw new Error(`Reassign failed: ${err.message || 'Operation failed'}`);
      }
      
      try {
        // Refresh analytics after reassigning
        const analyticsData = await mcqService.getAnalytics(testId);
        set({ analytics: analyticsData.data });
      } catch (err) {
        throw new Error(`Failed to refresh analytics: ${err.message || 'Data fetch failed'}`);
      }
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useMCQStore;
