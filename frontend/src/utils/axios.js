import axios from 'axios';

// Determine the baseURL based on environment
const getBaseURL = () => {
  // First priority: use the configured API URL from environment
  if (process.env.REACT_APP_API_URL) {
    console.log('Using API URL from env:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // For local environment
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Using localhost API URL');
    return 'http://localhost:5000';
  }
  
  // For production with reverse proxy (the /api will be mapped by NGINX)
  console.log('Using origin-based API URL:', `${window.location.origin}/api`);
  return `${window.location.origin}/api`;
};

const apiBaseUrl = getBaseURL();
console.log('API Base URL configured as:', apiBaseUrl);

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 seconds
});

// Interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Use x-auth-token header for compatibility with existing backend
      config.headers['x-auth-token'] = token;
      
      // Also add it in Authorization for broader compatibility
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Received 401 Unauthorized, clearing token');
      localStorage.removeItem('token');
      // Don't automatically redirect to avoid interrupting flow
    }
    return Promise.reject(error);
  }
);

export default api;