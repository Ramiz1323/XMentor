import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Intercept responses to handle errors globally while preserving context
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Preserve full axios error context while surfacing the friendly message
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    
    const enrichedError = new Error(message);
    enrichedError.status = error.response?.status;
    enrichedError.data = error.response?.data;
    enrichedError.config = error.config;
    enrichedError.code = error.code;
    enrichedError.originalError = error;

    return Promise.reject(enrichedError);
  }
);

export default api;
