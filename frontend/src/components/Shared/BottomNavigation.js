import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Home, Plus, Bell, User } from 'react-feather';

// Contextos
import { AuthContext } from '../../contexts/AuthContext';

// Estilos
import './BottomNavigation.css';

const BottomNavigation = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  
  // Verificar rota atual para destacar o item ativo
  const isActive = (path) => location.pathname === path;
  
  return (
    <div className="bottom-navigation">
      <Link to="/" className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}>
        <div className="bottom-nav-icon">
          <Home size={24} />
        </div>
        <span>{t('nav.home')}</span>
      </Link>
      
      <Link to="/map" className={`bottom-nav-item ${isActive('/map') ? 'active' : ''}`}>
        <div className="bottom-nav-icon">
          <MapPin size={24} />
        </div>
        <span>{t('nav.map')}</span>
      </Link>
      
      {isAuthenticated && (
        <Link to="/add-cat" className="bottom-nav-item add-button">
          <div className="bottom-nav-icon add-icon">
            <Plus size={24} />
          </div>
        </Link>
      )}
      
      <Link to="/notifications" className={`bottom-nav-item ${isActive('/notifications') ? 'active' : ''}`}>
        <div className="bottom-nav-icon">
          <Bell size={24} />
        </div>
        <span>Notificações</span>
      </Link>
      
      <Link to={isAuthenticated ? "/profile" : "/login"} className={`bottom-nav-item ${isActive('/profile') || isActive('/login') ? 'active' : ''}`}>
        <div className="bottom-nav-icon">
          <User size={24} />
        </div>
        <span>{isAuthenticated ? t('nav.profile') : t('auth.login')}</span>
      </Link>
    </div>
  );
};

export default BottomNavigation;