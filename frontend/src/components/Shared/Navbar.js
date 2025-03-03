import React from 'react';
import { Link } from 'react-router-dom';
import katmonLogo from '../../assets/Logo_Katmon-removebg-preview.png';
import './NavBar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-wrapper">
            <img src={katmonLogo} alt="KatMon" className="navbar-logo-image" />
          </div>
          <span className="navbar-brand-text">KatMon</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;