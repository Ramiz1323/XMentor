import api from '../lib/api';

const communityService = {
  getAllCommunities: async () => {
    const { data } = await api.get(`/community?t=${Date.now()}`);
    return data;
  },

  getCommunityById: async (id) => {
    const { data } = await api.get(`/community/${id}?t=${Date.now()}`);
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

  getHistory: async (id, page = 1) => {
    const { data } = await api.get(`/community/${id}/history?page=${page}&t=${Date.now()}`);
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
  },

  verifyPasscode: async (id, passcode) => {
    const { data } = await api.post(`/community/${id}/verify-passcode`, { passcode });
    return data;
  }
};

export default communityService;
