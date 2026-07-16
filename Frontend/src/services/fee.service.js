import api from '../lib/api';

const feeService = {
  getFeeOverview: async (month) => {
    const query = month ? `?month=${month}` : '';
    const { data } = await api.get(`/fee/overview${query}`);
    return data;
  },

  getPayments: async (params = {}) => {
    const { data } = await api.get('/fee/payments', { params });
    return data;
  },

  recordPayment: async (paymentData) => {
    const { data } = await api.post('/fee/payments', paymentData);
    return data;
  },

  updatePayment: async (id, paymentData) => {
    const { data } = await api.put(`/fee/payments/${id}`, paymentData);
    return data;
  },

  deletePayment: async (id) => {
    const { data } = await api.delete(`/fee/payments/${id}`);
    return data;
  },

  getConfigs: async () => {
    const { data } = await api.get('/fee/configs');
    return data;
  },

  updateConfig: async (configData) => {
    const { data } = await api.post('/fee/configs', configData);
    return data;
  },

  updateDefaultFee: async (defaultFeeData) => {
    const { data } = await api.post('/fee/default-fee', defaultFeeData);
    return data;
  }
};

export default feeService;
