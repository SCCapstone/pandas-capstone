import './JoinRequests.css';
import '../pages/messaging.css';
import React, { useState } from 'react';
import axios from 'axios';

  interface JoinRequestProps {
    id: number;
    name: String;
    onClose: () => void;
   }
  
  const JoinRequests: React.FC<JoinRequestProps> = ({ id, name, onClose }) => {
    
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';
  
  
    // Fetch the study group details when the component is mounted
    const handleApproval = async () => {


    }
    
    // Fetch the study group details when the component is mounted
    const handledDenial = async () => {


    }

    const handleGoingToMessages = async () => {
        
    }
    
    return (
      <div className="requests-panel">
        <h1>Requests</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          
        </form>
      </div>
    );
  };
  
  export default JoinRequests;