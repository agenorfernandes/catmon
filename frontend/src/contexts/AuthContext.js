import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Verificar token ao iniciar
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // Verificar se o token é válido
        const res = await axios.get('/api/auth/verify', {
          headers: {
            'x-auth-token': token
          }
        });
        
        if (res.data.valid) {
          // Obter dados do usuário
          const userRes = await axios.get('/api/auth/me', {
            headers: {
              'x-auth-token': token
            }
          });
          
          setUser(userRes.data);
          setIsAuthenticated(true);
        } else {
          // Token inválido
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error);
        localStorage.removeItem('token');
      }
      
      setLoading(false);
    };
    
    checkToken();
  }, []);
  
  // Configurar interceptor para incluir token em todas as requisições
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Configurar cabeçalho para todas as requisições
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      // Remover cabeçalho se não houver token
      delete axios.defaults.headers.common['x-auth-token'];
    }
    
    // Configurar interceptor para lidar com erros de autenticação
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          // Token expirado ou inválido
          logout();
        }
        
        return Promise.reject(error);
      }
    );
    
    return () => {
      // Remover interceptor ao desmontar
      axios.interceptors.response.eject(interceptor);
    };
  }, [isAuthenticated]);
  
  // Função de login
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
    
    // Configurar cabeçalho para requisições
    axios.defaults.headers.common['x-auth-token'] = token;
  };
  
  // Função de logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    
    // Remover cabeçalho
    delete axios.defaults.headers.common['x-auth-token'];
  };
  
  // Função para atualizar dados do usuário
  const updateUser = (userData) => {
    setUser(userData);
  };
  
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
