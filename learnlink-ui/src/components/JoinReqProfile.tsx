import './JoinRequests.css';
import '../pages/messaging.css';
import React, { useState } from 'react';
import axios from 'axios';

  interface JoinReqProfileProps {
    id: number;
    name: String;
    onClose: () => void;
   }
  
  const JoinReqProfile: React.FC<JoinReqProfileProps> = ({ id, name, onClose }) => {
    
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

    
    return (
      <div className="profile-panel">
        <h1>User Profile</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          
        </form>
      </div>
    );
  };
  
  export default JoinReqProfile;