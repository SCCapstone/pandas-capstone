// Navbar.tsx
import React from 'react';
import './components.css';
import Logo from '../components/Logo';
import { FaSearch, FaBell, FaCog, FaUserCircle } from 'react-icons/fa';

const Navbar: React.FC = () => {
  return (
    <header className="navbar">
      <div className="logo"><Logo/></div>
      <nav className="nav-links">
        <a href="/profile">Profile</a>
        <a href="/messaging">Messaging</a>
        <a href="/resources">Resources</a>
      </nav>
      <div className="nav-icons">
        <div className="search-bar">
          <input type="text" placeholder="search" />
          <FaSearch className="search-icon" />
        </div>
        <FaBell className="icon" />
        <FaCog className="icon" />
        <FaUserCircle className="icon profile-icon" />
      </div>
    </header>
  );
};

export default Navbar;
