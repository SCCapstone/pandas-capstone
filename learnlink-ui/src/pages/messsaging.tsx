
import React from 'react';
import './messaging.css'
import Navbar from '../components/Navbar';
import CopyrightFooter from '../components/CopyrightFooter';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';

const Messaging: React.FC = () => {
  return (
    <div className="chat">
      <Navbar />
      <div className="content">
       <p> Hello </p>
      </div>
      <div className = "copy4">
        <CopyrightFooter />
      </div>
    
    </div>
  );
};

export default Messaging;
