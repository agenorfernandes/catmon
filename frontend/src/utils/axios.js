import axios from 'axios';
import https from 'https';

const getBaseURL = () => {
  if (process.env.REACT_APP_API_URL) {
    console.log('Using API URL from environment:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  if (process.env.NODE_ENV === 'production') {
    return 'https://catmon.com.br/api';
  }
  
  return 'https://catmon.com.br:5000';
};

const apiBaseUrl = getBaseURL();
console.log('API base URL configured as:', apiBaseUrl);

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000,
  withCredentials: true,
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false // Only use in development, remove in production
  })
});

export default api;