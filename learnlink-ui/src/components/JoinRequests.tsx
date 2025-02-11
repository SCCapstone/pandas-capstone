import './JoinRequests.css';
import '../pages/messaging.css';
import './components.css';
import React, { useState } from 'react';
import axios from 'axios';

  interface JoinRequestProps {
    id: number;
    name: String;
    onClose: () => void;
   }
  
  const JoinRequests: React.FC<JoinRequestProps> = ({ id, name, onClose }) => {
    
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';
  
  
    const handleRetreivingRequests = async () => {
        // will have a get function pulling from the swipe table 

    }


    const handleApproval = async () => {
      //approves someones message request

    }
    
    
    const handledDenial = async () => {
      //rejects someones message request

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