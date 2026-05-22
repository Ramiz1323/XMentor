import api from './api';

export const generateQA = async (data) => {
  const response = await api.post('/ai/generate-qa', data);
  return response.data;
};
