import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import './settings.css';
import CopyrightFooter from '../components/CopyrightFooter';
import { useNavigate } from 'react-router-dom';
import { logout, getLoggedInUserIdString} from '../utils/auth';
import ConfirmPopup from '../components/ConfirmPopup';
import { handleSendSystemMessage,updateChatTimestamp} from "../utils/messageUtils";


interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
}



const Settings: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [confirmDeleteMessage, setConfirmDeleteMessage] = useState('Are you sure you want to delete your account? This action cannot be undone.');
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

  // Fetch all chats the user is part of
  const fetchUserChats = async (userId: string, token: string) => {
    const response = await fetch(`${REACT_APP_API_URL}/api/chats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      setMessage('Failed to fetch chats.');
      return [];
    }

    return await response.json();
  };

  const fetchUser = async (userId: string) => {
    try {
      const response = await fetch(`${REACT_APP_API_URL}/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const user = await response.json();
        console.log('User retrieved:', user);
        setDeleteUser(user);
        return user;
      } else {
        const errorData = await response.json();
        console.error('Error fetching user:', errorData);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  };

  

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

      if (token && userId) {
        // Fetch the user data and update the state
        const duser = await fetchUser(userId); // This will fetch the user and set the deleteUser state
        if (!duser) {
          setMessage("Failed to fetch user data.");
          return;
        }
        console.log("Fetched user:", duser); // You can log the user here to check the data
  
        // Fetch all the chats the user is part of
        const chats = await fetchUserChats(userId, token);
        for (const chat of chats) {
          const message = `${duser?.firstName} ${duser?.lastName} deleted their account.`;
          await handleSendSystemMessage(message, chat.id);
          await updateChatTimestamp(chat.id);
        }
      }

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
          <button onClick={logout} data-testid="logout">Log Out</button>
          <button onClick={handleUpdateEmail} data-testid="buttonemail">Update Email</button>
          <button onClick={handleChangePassword} data-testid="buttonchangepass">Change Password</button>
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
