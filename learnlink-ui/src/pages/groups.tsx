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



  interface User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  }

  interface Group {
    id: number;
    name: string;
    subject: string;
    description: string;
    created_by: number;
    created_at: Date;
    creator: User;
    users: User[];
    chatID: number;
    ideal_factor: string;
    profile_pic: string;
  }

  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';


  const Groups: React.FC = () => {

    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [users, setUsers] = useState<User[]>([]); // Store users
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [loadingGroups, setLoadingGroups] = useState<boolean>(true);

    const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
    const alertVisible = alerts.some(alert => alert.visible);
  


    useEffect(() => {
        const fetchGroups = async () => {
        const token = localStorage.getItem('token');
        
        const getCurrentUser = async () => {
            if (token) {
              try {
                const response = await axios.get(`${REACT_APP_API_URL}/api/currentUser`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                setCurrentUserId(response.data.id); // Set the current user ID
              } catch (error) {
                console.error('Error fetching current user:', error);
              }
            }
          }
        await getCurrentUser();
        const getGroups = async () => {
            if (token) {
                try {
                    const response = await axios.get(`${REACT_APP_API_URL}/api/study-groups`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                    setGroups(response.data);
                } catch (error) {
                    console.error('Error fetching study groups:', error);
                }
                finally {
                    setLoadingGroups(false);
                 }
            }
        }
        await getGroups();
        };
        fetchGroups();
      }, []);

    return (
        <div className="Groups">
          <div>
            <Navbar/>
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
            {/* List of groups */}
                <div className="groups-panel">
                    {/* List of groups */}
                    {loadingGroups ? (
                        <div className="loading-container">
                        Loading... <span className="loading-spinner"></span>
                        </div>
                    ) : (
                        <ul className="GroupList">
                        {groups.map((group) => (
                            <li
                            key={group.id}
                            className={`GroupListItem ${selectedGroup?.id === group.id ? 'active' : ''}`}
                            onClick={() => setSelectedGroup(group)}
                            >
                            <span>{group.name}</span>
                            </li>
                        ))}
                        </ul>
                    )}
                </div>
            </div>
            <div className="GroupInfo">
            {/* Group Stuff */}
              
                  
                  
                  
            
       

             
            </div>
            </div>
            
            <CopyrightFooter />
        </div>
      );
};

export default Groups;