import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import defaultAvatar from '../assets/default-avatar.png';
import katmonLogo from '../assets/katmon-logo.svg';
import '../styles/navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src={katmonLogo} alt="KatMon Logo" className="logo" />
        <Link to="/">KatMon</Link>
      </div>

      <div className="navbar-menu">
        <LanguageSwitcher />
        
        {isAuthenticated ? (
          <div className="navbar-user">
            <Link to="/profile" className="profile-link">
              <img 
                src={user?.photoUrl || defaultAvatar} 
                alt="Profile" 
                className="profile-icon"
              />
              {user?.name}
            </Link>
            <button onClick={logout} className="logout-btn">
              Sair
            </button>
          </div>
        ) : (
          <div className="navbar-auth">
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Cadastrar</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
