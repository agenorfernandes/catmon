import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Contextos
import { AuthContext } from '../../contexts/AuthContext';

// Ícones SVG
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
    <line x1="8" y1="2" x2="8" y2="18"></line>
    <line x1="16" y1="6" x2="16" y2="22"></line>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const LoginIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
    <polyline points="10 17 15 12 10 7"></polyline>
    <line x1="15" y1="12" x2="3" y2="12"></line>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

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
          <HomeIcon />
        </div>
        <span>{t('nav.home')}</span>
      </Link>
      
      <Link to="/map" className={`bottom-nav-item ${isActive('/map') ? 'active' : ''}`}>
        <div className="bottom-nav-icon">
          <MapIcon />
        </div>
        <span>{t('nav.map')}</span>
      </Link>
      
      {isAuthenticated && (
        <Link to="/add-cat" className="bottom-nav-item add-button">
          <div className="bottom-nav-icon add-icon">
            <PlusIcon />
          </div>
        </Link>
      )}
      
      {isAuthenticated ? (
        <Link to="/profile" className={`bottom-nav-item ${isActive('/profile') ? 'active' : ''}`}>
          <div className="bottom-nav-icon">
            <UserIcon />
          </div>
          <span>{t('nav.profile')}</span>
        </Link>
      ) : (
        <Link to="/login" className={`bottom-nav-item ${isActive('/login') ? 'active' : ''}`}>
          <div className="bottom-nav-icon">
            <LoginIcon />
          </div>
          <span>{t('auth.login')}</span>
        </Link>
      )}
    </div>
  );
};

export default BottomNavigation;