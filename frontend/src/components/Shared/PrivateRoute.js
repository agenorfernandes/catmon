import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    // Pode-se adicionar um spinner de carregamento aqui
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    // Redirecionar para login, salvando o local de onde veio para redirecionamento posterior
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default PrivateRoute;