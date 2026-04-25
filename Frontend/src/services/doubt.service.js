import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

const doubtService = {
  /**
   * @desc Submit a new doubt
   */
  askDoubt: async (doubtData) => {
    const response = await axios.post(`${API_URL}/doubt`, doubtData, { withCredentials: true });
    return response.data;
  },

  /**
   * @desc Get all doubts (role-based)
   */
  getDoubts: async (params = {}) => {
    const response = await axios.get(`${API_URL}/doubt`, { 
      params, 
      withCredentials: true 
    });
    return response.data;
  },

  /**
   * @desc Get single doubt details
   */
  getDoubtById: async (id) => {
    const response = await axios.get(`${API_URL}/doubt/${id}`, { withCredentials: true });
    return response.data;
  },

  /**
   * @desc Resolve a doubt (Teacher only)
   */
  resolveDoubt: async (id, content) => {
    const response = await axios.put(`${API_URL}/doubt/${id}/resolve`, { content }, { withCredentials: true });
    return response.data;
  },

  /**
   * @desc Remove a doubt (Student only)
   */
  deleteDoubt: async (id) => {
    const response = await axios.delete(`${API_URL}/doubt/${id}`, { withCredentials: true });
    return response.data;
  }
};

export default doubtService;
