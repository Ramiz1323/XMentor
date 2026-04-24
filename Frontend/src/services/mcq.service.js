import api from '../lib/api';

const mcqService = {
  createTest: async (testData) => {
    const { data } = await api.post('/mcq', testData);
    return data;
  },

  getMyTests: async () => {
    const { data } = await api.get('/mcq/my-tests');
    return data;
  },

  getTestsByCommunity: async (communityId) => {
    const { data } = await api.get(`/mcq/community/${communityId}`);
    return data;
  },

  getTestById: async (id) => {
    const { data } = await api.get(`/mcq/${id}`);
    return data;
  },

  getAnalytics: async (id) => {
    const { data } = await api.get(`/mcq/${id}/analytics`);
    return data;
  },

  submitTest: async (id, submissionData) => {
    const { data } = await api.post(`/mcq/${id}/submit`, submissionData);
    return data;
  },

  getTeacherOverview: async () => {
    const { data } = await api.get('/mcq/teacher/overview');
    return data;
  }
};

export default mcqService;
