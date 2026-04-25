import api from '../lib/api';

const communityService = {
  getAllCommunities: async () => {
    const { data } = await api.get('/community');
    return data;
  },

  getCommunityById: async (id) => {
    const { data } = await api.get(`/community/${id}`);
    return data;
  },

  createCommunity: async (communityData) => {
    const { data } = await api.post('/community', communityData);
    return data;
  },

  joinCommunity: async (id, alias, accessCode) => {
    const { data } = await api.post(`/community/${id}/join`, { alias, accessCode });
    return data;
  },

  getHistory: async (id) => {
    const { data } = await api.get(`/community/${id}/history`);
    return data;
  },

  leaveCommunity: async (id) => {
    const { data } = await api.post(`/community/${id}/leave`);
    return data;
  },

  getMembers: async (id) => {
    const { data } = await api.get(`/community/${id}/members`);
    return data;
  },

  deleteCommunity: async (id) => {
    const { data } = await api.delete(`/community/${id}`);
    return data;
  }
};

export default communityService;
