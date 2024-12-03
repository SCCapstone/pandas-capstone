// Navbar.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './components.css';
import Logo from '../components/Logo';
import { FaSearch, FaBell, FaCog, FaUserCircle } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

    const handleSettings = () => {
        navigate('/settings');
    };
    const handleMessaging = () => {
        navigate('/messaging');
    };
    const handleAccountDetails = () => { 
        navigate('/accountDetails');
    }
  return (
    <header className="navbar">
      <div className="nav-logo"><Logo/></div>
      <nav className="nav-links">
        <a href="/swiping">Match</a>
        <a href="/profile">Profile</a>
        <a href="/messaging" onClick={handleMessaging} >Messaging</a>
        <a href="/resources/studyTips">Resources</a>
      </nav>
      <div className="search-bar">
          <input type="text" placeholder="search" />
          <FaSearch className="search-icon" />
        </div>
      <div className="nav-icons">
        {/*give user a notification*/}
        <FaBell className="icon" />
        {/*create an onclick function to go to settings page*/}
        <FaCog className="icon" onClick={handleSettings} />
        <FaUserCircle className="icon profile-icon" onClick={handleAccountDetails}/>
        {/* create a drag down menu for the profile and resources*/}
      </div>
    </header>
  );
};

export default Navbar;
