import api from '../lib/api';

const mcqService = {
  createTest: async (testData) => {
    const { data } = await api.post('/mcq', testData);
    return data;
  },

  getMyTests: async () => {
    const { data } = await api.get(`/mcq/my-tests?t=${Date.now()}`);
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
    const { data } = await api.get(`/mcq/teacher/overview?t=${Date.now()}`);
    return data;
  },

  deleteTest: async (id) => {
    const { data } = await api.delete(`/mcq/${id}`);
    return data;
  }
};

export default mcqService;
