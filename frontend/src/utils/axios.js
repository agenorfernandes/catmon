import axios from 'axios';

// Determinar a baseURL com base no ambiente
const getBaseURL = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  
  if (apiUrl) {
    return apiUrl;
  }
  
  // Para ambiente local
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // Para produção com proxy reverso (o /api será mapeado pelo NGINX)
  return `${window.location.origin}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 segundos
});

// Interceptador para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Usar header x-auth-token para compatibilidade com o backend existente
      config.headers['x-auth-token'] = token;
      
      // Também adicionar no Authorization para maior compatibilidade
      config.headers['Authorization'] = `Bearer ${token}`;
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
      localStorage.removeItem('token');
      // Não redirecionar automaticamente para não interromper o fluxo
    }
    return Promise.reject(error);
  }
);

export default api;