import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import './settings.css';
import CopyrightFooter from '../components/CopyrightFooter';
import { useNavigate } from 'react-router-dom';
import { logout, getLoggedInUserIdString } from '../utils/auth';

const Settings: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Fetch the logged-in user ID
  const handleDelete = async () => {
    const userId = getLoggedInUserIdString; // Retrieved from localStorage or `getLoggedInUserId`
  
    if (!userId) {
      setMessage('User ID not found. Please log in again.');
      return;
    }
  
    try {
      const token = localStorage.getItem('token'); // Retrieve the JWT
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Add JWT to headers
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
  
        // Log out and navigate to welcome page
        logout();
        navigate('/welcome');
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };
  

    const handleLogOut = () => {
        navigate('/welcome');
    };

    const handleUpdateEmail = () => {
      navigate('/updateEmail');
  };

  const handleChangePassword = () => {
    navigate('/changePassword');
};
  return (
    <div className="settings">
      <Navbar />
      <div className="settings-content">
        <button onClick={logout}>Log Out</button>
        <button onClick={handleUpdateEmail}>Update Email</button>
        <button onClick={handleChangePassword}>Change Password</button>
        <button onClick={handleDelete}>Delete Account</button>
        {message && <p>{message}</p>}

      </div>
      <div>
        <CopyrightFooter />
      </div>
      
    </div> 

        
  );
};

export default Settings;
