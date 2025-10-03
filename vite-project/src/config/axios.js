import axios from 'axios';

// Set the base URL for all API requests
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://100.27.30.139';

// Add a request interceptor to add the auth token to requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios; 