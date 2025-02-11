// Navbar.tsx
import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './components.css';
import Logo from '../components/Logo';
import { FaSearch, FaBell, FaCog, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';


interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL;
  // Function to handle search and display results
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults([]);
      setIsDropdownVisible(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${REACT_APP_API_URL}/api/users/search?query=${query}`, {
          headers: {
            'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          },
        });
      
      const data = await response.json();

      if (response.ok) {
        console.log('Search results:', data.users);
        setSearchResults(data.users);
        setIsDropdownVisible(true);
      } else {
        console.error('Error fetching search results:', data.error);
        setSearchResults([]);
        setIsDropdownVisible(false);
      }
    }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setSearchResults([]);
      setIsDropdownVisible(false);
    }
  };

  // Function to handle when a user selects a search result
  const handleSelectUser = (userId: number) => {
    navigate(`/user-profile/${userId}`); // Navigate to the user's profile page
    setSearchQuery('');
    setSearchResults([]);
    setIsDropdownVisible(false);
  };


    const handleSettings = () => {
        navigate('/settings');
    };
    const handleMessaging = () => {
        navigate('/messaging');
    };
    const handleAccountDetails = () => { 
        navigate('/accountDetails');
    }
    const [isNavOpen, setIsNavOpen] = useState(false);
  return (
    <header className="navbar">
      <div className="nav-logo"><Logo /></div>
      <FaBars className="hamburger" onClick={() => setIsNavOpen(true)} />


      {/* Full-Screen Menu */}
      <div className={`fullscreen-menu ${isNavOpen ? "show" : ""}`}>
        <FaTimes className="close-icon" onClick={() => setIsNavOpen(false)} />
        <a href="/swiping">Match</a>
        <a href="/profile">Profile</a>
        <a href="/messaging" onClick={handleMessaging}>Messaging</a>
        <a href="/resources/studyTips">Resources</a>
      </div>

      <div className="search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search for users"
        />
        {isDropdownVisible && searchResults.length > 0 && (
          <ul className="dropdown">
            {searchResults.map((user) => (
              <p key={user.id} onClick={() => handleSelectUser(user.id)}>
                {user.firstName} {user.lastName} (@{user.username})
              </p>
            ))}
          </ul>
        )}
        <FaSearch className="search-icon" />
      </div>

      {/* Normal Navigation Links - Hidden on Mobile */}
      <nav className="nav-links">
        <a href="/swiping">Match</a>
        <a href="/profile">Profile</a>
        <a href="/messaging" onClick={handleMessaging}>Messaging</a>
        <a href="/resources/studyTips">Resources</a>
      </nav>

      <div className="nav-icons">
        <FaBell className="icon" />
        <FaCog className="icon" onClick={handleSettings} />
        <FaUserCircle className="icon profile-icon" onClick={handleAccountDetails} />
      </div>
    </header>
  );
};

export default Navbar;

