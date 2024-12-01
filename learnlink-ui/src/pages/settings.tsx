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
        <button>Delete Account</button>
      </div>
      <div>
        <CopyrightFooter />
      </div>
      
    </div> 

        
  );
};

export default Settings;
