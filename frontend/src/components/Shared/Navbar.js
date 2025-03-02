import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Contextos
import { AuthContext } from '../../contexts/AuthContext';

// Componentes 
import LanguageSwitcher from '../LanguageSwitcher';

// Ícones SVG
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const closeMenu = () => {
    setMenuOpen(false);
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-xl">K</span>
          </div>
          <span>KatMon</span>
        </Link>
        
        <div className="navbar-right">
          <LanguageSwitcher />
          
          <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
            <Link to="/" onClick={closeMenu}>{t('nav.home')}</Link>
            <Link to="/map" onClick={closeMenu}>{t('nav.map')}</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={closeMenu}>{t('nav.profile')}</Link>
                <Link to="/ranking" onClick={closeMenu}>{t('nav.ranking')}</Link>
                <Link to="/settings" onClick={closeMenu}>{t('nav.settings')}</Link>
                <button className="logout-btn" onClick={handleLogout}>
                  <LogOutIcon />
                  <span>{t('auth.logout')}</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu} className="login-link">
                  {t('auth.login')}
                </Link>
                <Link to="/register" onClick={closeMenu} className="register-btn">
                  {t('auth.register')}
                </Link>
              </>
            )}
          </div>
          
          {isAuthenticated && (
            <Link to="/profile" className="profile-icon" onClick={closeMenu}>
              <div className="avatar">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} />
                ) : (
                  <UserIcon />
                )}
              </div>
            </Link>
          )}
          
          <button className="menu-toggle" onClick={toggleMenu}>
            {menuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;