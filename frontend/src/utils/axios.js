import axios from 'axios';

const getBaseURL = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000';
  }
  return 'http://api.catmon.com.br';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Alterado para false
  timeout: 10000 // 10 segundos
});

// Interceptador para adicionar token em todas as requisições
api.interceptors.request.use(
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

// Interceptador para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Não redirecionar automaticamente, apenas limpar os dados
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
