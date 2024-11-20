import React from 'react';
import Navbar from '../components/Navbar';
import './settings.css'
import CopyrightFooter from '../components/CopyrightFooter';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';


const Settings: React.FC = () => {
  const navigate = useNavigate();

    const handleLogOut = () => {
        navigate('/welcome');
    };
  return (
    <div className="settings">
      <Navbar />
      <div className="content">
        <button className="logOut" onClick={logout}>Log Out</button>
        <button className="changePassword">Change Password</button>
        <button className="deleteAccount">Delete Account</button>
      </div>
      <div>
        <CopyrightFooter />
      </div>
      
    </div> 

        
  );
};

export default Settings;
