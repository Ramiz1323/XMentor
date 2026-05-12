import api from '../lib/api';

const userService = {
  getProfile: async () => {
    const { data } = await api.get('/user/profile');
    return data;
  },

  updateProfile: async (userData) => {
    const { data } = await api.put('/user/profile', userData);
    return data;
  },

  uploadProfilePic: async (formData) => {
    const { data } = await api.post('/user/upload-profile-pic', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  addStudent: async (studentData) => {
    const { data } = await api.post('/user/add-student', studentData);
    return data;
  },

  getStats: async () => {
    const { data } = await api.get('/user/stats');
    return data;
  },

  getLeaderboard: async () => {
    const { data } = await api.get('/user/leaderboard');
    return data;
  },

  getPendingTeachers: async () => {
    const { data } = await api.get('/user/pending-teachers');
    return data;
  },

  verifyTeacher: async (id) => {
    const { data } = await api.patch(`/user/verify-teacher/${id}`);
    return data;
  }
};

export default userService;
