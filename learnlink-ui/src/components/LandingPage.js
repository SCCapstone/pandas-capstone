import React from 'react';
import './LandingPage.css';
import { FaSearch, FaBell, FaCog, FaUserCircle } from 'react-icons/fa';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="navbar">
        <div className="logo">LearnLink</div>
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
      <main className="content">
        <p>To start searching please update your profile via top left corner!</p>
      </main>
      <footer className="footer">© LearnLink</footer>
    </div>
  );
};

export default LandingPage;