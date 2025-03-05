import axios from 'axios';

const getBaseURL = () => {
  // Prioridade 1: variável de ambiente
  if (process.env.REACT_APP_API_URL) {
    console.log('Usando URL da API do ambiente:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // Produção: usar origem atual + /api
  if (process.env.NODE_ENV === 'production') {
    return `${window.location.origin}/api`;
  }
  
  // Desenvolvimento: localhost padrão
  return 'http://localhost:5000';
};

const apiBaseUrl = getBaseURL();
console.log('URL base da API configurada como:', apiBaseUrl);

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000,
  withCredentials: true
});

export default api;