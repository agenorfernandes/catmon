import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'react-feather';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <AlertCircle size={100} className="not-found-icon" />
        <h1>404 - Página Não Encontrada</h1>
        <p>Desculpe, a página que você está procurando não existe.</p>
        
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            Voltar para Início
          </Link>
          <Link to="/map" className="btn btn-secondary">
            Ver Mapa de Gatos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
