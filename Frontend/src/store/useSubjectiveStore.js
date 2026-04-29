import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const useSubjectiveStore = create(
  persist(
    (set, get) => ({
      tests: [],
      pendingSubmissions: [],
      isLoading: false,
      error: null,

      createTest: async (testData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.post(`${API_URL}/subjective`, testData, { withCredentials: true });
          set((state) => ({ tests: [data.data, ...state.tests], isLoading: false }));
          return data.data;
        } catch (err) {
          set({ error: err.response?.data?.message || 'Failed to create test', isLoading: false });
          throw err;
        }
      },

      fetchTests: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.get(`${API_URL}/subjective`, { withCredentials: true });
          set({ tests: data.data, isLoading: false });
        } catch (err) {
          set({ error: err.response?.data?.message || 'Failed to fetch tests', isLoading: false });
        }
      },

      fetchTestById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.get(`${API_URL}/subjective/${id}`, { withCredentials: true });
          set({ isLoading: false });
          return data; // { data: test, submission: submission }
        } catch (err) {
          set({ error: err.response?.data?.message || 'Failed to fetch test', isLoading: false });
          throw err;
        }
      },

      submitSignal: async (testId) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.post(`${API_URL}/subjective/${testId}`, {}, { withCredentials: true });
          set({ isLoading: false });
          return data.data;
        } catch (err) {
          set({ error: err.response?.data?.message || 'Failed to submit', isLoading: false });
          throw err;
        }
      },

      fetchPendingSubmissions: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.get(`${API_URL}/subjective/submissions/pending`, { withCredentials: true });
          set({ pendingSubmissions: data.data, isLoading: false });
        } catch (err) {
          set({ error: err.response?.data?.message || 'Failed to fetch pending submissions', isLoading: false });
        }
      },

      gradeSubmission: async (id, marksObtained) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.put(`${API_URL}/subjective/grade/${id}`, { marksObtained }, { withCredentials: true });
          set((state) => ({
            pendingSubmissions: state.pendingSubmissions.filter(s => s._id !== id),
            isLoading: false
          }));
          return data.data;
        } catch (err) {
          set({ error: err.response?.data?.message || 'Failed to grade submission', isLoading: false });
          throw err;
        }
      },

      deleteTest: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await axios.delete(`${API_URL}/subjective/${id}`, { withCredentials: true });
          set((state) => ({
            tests: state.tests.filter(t => t._id !== id),
            isLoading: false
          }));
        } catch (err) {
          set({ error: err.response?.data?.message || 'Failed to delete task', isLoading: false });
          throw err;
        }
      }
    }),
    {
      name: 'xmentor-subjective',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ tests: state.tests }),  
    }
  )
);

export default useSubjectiveStore;
