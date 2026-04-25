import api from '../lib/api';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

const doubtService = {
  /**
   * @desc Submit a new doubt
   */
  askDoubt: async (doubtData) => {
    const response = await api.post('/doubt', doubtData);
    return response.data;
  },

  getDoubts: async (params = {}) => {
    const response = await api.get('/doubt', { params });
    return response.data;
  },

  getDoubtById: async (id) => {
    const response = await api.get(`/doubt/${id}`);
    return response.data;
  },

  resolveDoubt: async (id, content) => {
    const response = await api.put(`/doubt/${id}/resolve`, { content });
    return response.data;
  },

  deleteDoubt: async (id) => {
    const response = await api.delete(`/doubt/${id}`);
    return response.data;
  }
};

export default doubtService;
