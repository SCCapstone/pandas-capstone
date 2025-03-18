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
    const [currentGroupId, setCurrentGroupId] =  useState<number | null>(null);
    const [users, setUsers] = useState<User[]>([]); // Store users
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [loadingGroups, setLoadingGroups] = useState<boolean>(true);
     const [groupNames, setGroupNames] = useState<{ [key: number]: string }>({});

    const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
    const alertVisible = alerts.some(alert => alert.visible);
  

    const [isUserPanelVisible, setIsUserPanelVisible] = useState(false);
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const [selectedGroupUsers, setSelectedGroupUsers] = useState<User[] | null>(null);
    const hasStudyGroup = Boolean(selectedGroup);


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




    const updateUsers = (userId: number) => {
    setSelectedGroupUsers(prevUsers => (prevUsers || []).filter(user => user.id !== userId));
    };




    const updateChatName = (chatId: number, newName: string) => {
    setGroupNames((prevGroupNames) => ({
        ...prevGroupNames,
        [chatId]: newName,
    }));
    };



    
    //deletes a user from a study group
    const removeUser = async (userId: number, groupId: number | null) => {
        if (!groupId) {
        console.error('Group ID is missing.');
        return;
        }
        try {
        const response = await axios.delete(`${REACT_APP_API_URL}/api/study-groups/${groupId}/users/${userId}`);
        
        if (response.status === 200) {
            // Log the updated users state to ensure it reflects the change
            //setSelectedChatUsers(prevUsers => (prevUsers || []).filter(user => user.id !== userId));

            setSelectedGroupUsers((prevUsers) => (prevUsers|| []).filter(user => user.id !== userId));
            if (selectedGroup?.id === userId) {
            setSelectedGroup(null);
            }
            /*
            // add left/removed from chat message here
            const username = chatUsernames[userId] || "Unknown";
            let mess = "";
            // console.log(username);
            if (userId === currentUserId) {
            mess = `${username} left the group.`;
            
            } else {
            mess = `${username} was removed from the group.`;
            }
            setUpdateMessage(mess);

            

            console.log("update message " ,  mess);
            handleSendSystemMessage(mess);
            */
        } else {
            console.error('Failed to delete the user.');
        }
        } catch (error) {
        console.error('Error deleting user:', error);
        }
    };
  
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
                            onClick={() => {
                                setSelectedGroup(group);
                                setCurrentGroupId(group.id);
                                setSelectedGroupUsers(group.users);
                              }}
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
                {selectedGroup && (
                <>
                <div className="ButtonContainer">
                    {hasStudyGroup && (
                    <button
                        className="UserListButton"
                        onClick={() => {
                        setIsUserPanelVisible(true);
                        }}
                    >
                        Members
                    </button>
                    )}
                    {hasStudyGroup ? (
                    <button
                        className="EditStudyGroupButton"
                        onClick={() => setIsPanelVisible(true)}
                    >
                        Edit Study Group
                    </button>
                    ) : (
                    <button
                        className="CreateStudyGroupButton"
                        onClick={() => setIsPanelVisible(true)}
                    >
                        Create Study Group
                    </button>
                    )}
                </div>
                {isUserPanelVisible && selectedGroupUsers && (
                    <div className="users-panel">
                      <GroupUserList
                        groupId={currentGroupId}
                        currentId={currentUserId}
                        users={selectedGroupUsers ?? []}
                        chatId={selectedGroup.chatID}
                        onClose={() => setIsUserPanelVisible(false)}
                        onRemoveUser={removeUser}
                        updateUsers={updateUsers}
                      />
                    </div>
                )}
                {isPanelVisible && (
                    <div className="study-group-panel">
                    <EditStudyGroup
                        chatID={selectedGroup.id}
                        onClose={() => setIsPanelVisible(false)}
                        updateChatName={updateChatName}
                    />
                    </div>
                )}
                </>
            )}
            </div>
            </div>
            
            <CopyrightFooter />
        </div>
      );
};

export default Groups;