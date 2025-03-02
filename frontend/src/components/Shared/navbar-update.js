import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X } from 'react-feather';
import { useTranslation } from 'react-i18next';

// Contextos
import { AuthContext } from '../../contexts/AuthContext';

// Componentes 
import LanguageSwitcher from '../LanguageSwitcher';

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
          <img src="/assets/logo.png" alt="KatMon" />
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
                  <LogOut size={16} />
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
                  <User />
                )}
              </div>
            </Link>
          )}
          
          <button className="menu-toggle" onClick={toggleMenu}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;