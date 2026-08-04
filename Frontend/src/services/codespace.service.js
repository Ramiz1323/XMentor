import api from '../lib/api';

const codespaceService = {
  getCodeSpace: async () => {
    const { data } = await api.get('/codespace');
    return data;
  },

  saveCodeSpace: async (payload) => {
    const { data } = await api.post('/codespace/save', payload);
    return data;
  },

  executeJava: async (code) => {
    const { data } = await api.post('/codespace/execute-java', { code });
    return data;
  },
};

export default codespaceService;
