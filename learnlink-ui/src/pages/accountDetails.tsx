import React from 'react';
import Navbar from '../components/Navbar';
import './accountDetails.css'
import CopyrightFooter from '../components/CopyrightFooter';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';


const AccountDetails: React.FC = () => {
  const navigate = useNavigate();



 

  return (
    <div className="accountDetails">
        <Navbar />
      
      
        <CopyrightFooter />
      
      
    </div> 

        
  );
};

export default AccountDetails;
