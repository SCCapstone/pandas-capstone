import './JoinRequests.css';
import '../pages/messaging.css';
import React, { useState } from 'react';
import axios from 'axios';

  interface MessagesNaviProps {
    id: number;
    name: String;
   }
  
  const MessagesNavi: React.FC<MessagesNaviProps> = ({ id, name }) => {
    
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';
  
  
    // Fetch the study group details when the component is mounted
    const handleGoingToRequests = async () => {


    }
    
    // Fetch the study group details when the component is mounted
    const handleOpeningChat = async () => {


    }
    
    return (
      <div className="messages-panel">
        <h1>Messages</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          
        </form>
      </div>
    );
  };
  
  export default MessagesNavi;