import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.9:5000',  // Remove trailing slash
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = global.authToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add debug logging
    console.log('=== Request Debug ===');
    console.log('URL:', `${config.baseURL}${config.url}`);
    console.log('Method:', config.method?.toUpperCase());
    console.log('Headers:', config.headers);
    console.log('Data:', config.data);
    console.log('=== End Request Debug ===');
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Success logs removed for cleaner output
    return response;
  },
  (error) => {
    console.error('=== Error Debug ===');
    console.error('URL:', error.config?.url);
    console.error('Method:', error.config?.method?.toUpperCase());
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Headers:', error.response?.headers);
    console.error('Data:', error.response?.data);
    console.error('=== End Error Debug ===');
    
    if (error.response?.status === 401) {
      // Clear auth token if unauthorized
      global.authToken = undefined;
    }
    return Promise.reject(error);
  }
);

export default api; 