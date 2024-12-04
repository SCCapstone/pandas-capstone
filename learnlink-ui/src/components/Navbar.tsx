// Navbar.tsx
import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './components.css';
import Logo from '../components/Logo';
import { FaSearch, FaBell, FaCog, FaUserCircle } from 'react-icons/fa';

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
        const response = await fetch(`http://localhost:2020/api/users/search?query=${query}`, {
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
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search for users"
        />
        {/* {searchResults.length}
        {isDropdownVisible.toString()} */}
        {isDropdownVisible && searchResults.length > 0 && (
          <ul className="dropdown">
            {searchResults.map((user) => (
              <p key={user.id} onClick={() => handleSelectUser(user.id)}>
                {user.firstName} {user.lastName} (@{user.username})
              </p>
            ))}
          </ul>
        )}
        {/* <p>{searchResults.length} results found</p> */}
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

