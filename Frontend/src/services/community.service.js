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

  joinCommunity: async (id, joinCode) => {
    const { data } = await api.post(`/community/${id}/join`, { joinCode });
    return data;
  },

  leaveCommunity: async (id) => {
    const { data } = await api.post(`/community/${id}/leave`);
    return data;
  },

  getMembers: async (id) => {
    const { data } = await api.get(`/community/${id}/members`);
    return data;
  }
};

export default communityService;
