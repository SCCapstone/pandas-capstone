import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import './settings.css';
import CopyrightFooter from '../components/CopyrightFooter';
import { useNavigate } from 'react-router-dom';
import { logout, getLoggedInUserIdString} from '../utils/auth';
import ConfirmPopup from '../components/ConfirmPopup';

const Settings: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [confirmDeleteMessage, setConfirmDeleteMessage] = useState('Are you sure you want to delete your account? This action cannot be undone.');
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';


  // Fetch the logged-in user ID
  const handleDelete = async () => {
    const userId = getLoggedInUserIdString();
    console.log('userId:', userId);
  
    if (!userId) {
      setMessage(`User ID not found. Please log in again.`);
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);
  
      if (!token) {
        setMessage('Authentication token not found. Please log in again.');
        return;
      }
  
      const response = await fetch(`${REACT_APP_API_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        setMessage(data.message);
  
        logout();
        navigate('/welcome');
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        setMessage(`Error ${response.status}: ${errorData.error || 'Unable to delete user.'}`);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setMessage(`Unexpected error: ${(error as Error).message}`);
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
    <div className="page-container">
    <header>
      <Navbar />
    </header>
    {confirmDeleteVisible && (
      <ConfirmPopup
        message={confirmDeleteMessage}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteVisible(false)}
      />
    )}
    <main className="content">
      <div className="settings">
        <div className="heading">Manage Account</div>
        <div className="buttons">
          <button onClick={logout}>Log Out</button>
          <button onClick={handleUpdateEmail}>Update Email</button>
          <button onClick={handleChangePassword}>Change Password</button>
          <button onClick={() => setConfirmDeleteVisible(true)}>Delete Account</button>
        </div>
      </div>
    </main>

    <footer>
      <CopyrightFooter />
    </footer>
</div>

  );
};

export default Settings;
