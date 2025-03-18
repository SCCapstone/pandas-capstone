import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './groups.css';
import Navbar from '../components/Navbar';
import CopyrightFooter from '../components/CopyrightFooter';
import './LandingPage.css';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import EditStudyGroup from '../components/EditStudyGroup';
import ChatsNavi from "../components/ChatsNavi";
import JoinRequests from '../components/JoinRequests';
import GroupUserList from '../components/GroupUserList';
import JoinReqProfile from '../components/JoinReqProfile';
import CustomAlert from '../components/CustomAlert';
import { unescape } from 'querystring';


interface Chat {
    id: number;
    name: string;
    messages: Message[];
    users: User[]; 
    createdAt: string;
    updatedAt: string;
  }
  
  interface Message{
    id: number;
    content: string;
    createdAt: string;
    userId: number | undefined;
    chatId: number;
    liked: boolean;
    system: boolean;
    
  }
  interface User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  }


  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';


  const Groups: React.FC = () => {

      const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
      const alertVisible = alerts.some(alert => alert.visible);


    return (
        <div className="Groups">
          <div>
                  <Navbar />
          </div>
        
          <div className="Group">
            {/* Display the alert if it's visible */}
          {alertVisible && (
            <div className='alert-container'>
              {alerts.map(alert => (
                <CustomAlert
                  key={alert.id}
                  text={alert.alertText || ''}
                  severity={alert.alertSeverity || 'info' as "error" | "warning" | "info" | "success"}
                  onClose={() => setAlerts(prevAlerts => prevAlerts.filter(a => a.id !== alert.id))}
                />
              ))}
            </div>
          )}
            
            <div className="GroupsSidebar">
            
            </div>
            <div className="GroupInfo">
              
                  
                  
                  
            
       

             
            </div>
            </div>
            <CopyrightFooter />
          
          
        </div>
        
      );
};

export default Groups;