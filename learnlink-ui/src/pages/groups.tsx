import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './groups.css';
import Navbar from '../components/Navbar';
import CopyrightFooter from '../components/CopyrightFooter';
import './LandingPage.css';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import EditStudyGroup from '../components/EditStudyGroup';
import StudyGroupInfo from '../components/StudyGroupInfo';
import ChatsNavi from "../components/ChatsNavi";
import JoinRequests from '../components/JoinRequests';
import GroupUserList from '../components/GroupUserList';
import JoinReqProfile from '../components/JoinReqProfile';
import CustomAlert from '../components/CustomAlert';
import { unescape } from 'querystring';
import { useNavigate } from "react-router-dom";
import { handleSendSystemMessage,updateChatTimestamp} from "../utils/messageUtils";


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

  interface Chat {
    id: number;
    name: string;
    messages: Message[];
    users: User[]; 
    createdAt: string;
    updatedAt: string;
    lastUpdatedById: number | null;
    lastOpened: { [userId: number]: string };
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
  
    const [chats, setChats] = useState<Chat[]>([]);
    const [isUserPanelVisible, setIsUserPanelVisible] = useState(false);
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const [selectedGroupUsers, setSelectedGroupUsers] = useState<User[] | null>(null);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const hasStudyGroup = Boolean(selectedGroup);
    const searchParams = new URLSearchParams(window.location.search);
    const selectedGroupId = searchParams.get("groupId");
    const tab = searchParams.get("tab");
    const navigate = useNavigate();


    useEffect(() => {
      const fetchGroups = async () => {
        const token = localStorage.getItem('token');

        console.log("groups selected group id: ",selectedGroupId);
        
        const getCurrentGroup = async () => {
          if (!selectedGroupId){
            return;
          }
          if (selectedGroupId) {
            try {
              const response = await axios.get(`${REACT_APP_API_URL}/api/study-groups/${selectedGroupId}`);
              console.log(response.data);
              setSelectedGroup(response.data.studyGroup); // Set the current user ID
              setCurrentGroupId(response.data.studyGroup.id);
              setSelectedGroupUsers(response.data.studyGroup.users);
              const isEdit = tab === "true";
              setIsEditMode(isEdit);
              
            } catch (error) {
              console.error('Error fetching selected group:', error);
            }
          }
        }

        await getCurrentGroup();
      
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
        console.log("currentUserId: ", currentUserId);
        const getGroups = async () => {
            if (token) {
                try {
                    const response = await axios.get(`${REACT_APP_API_URL}/api/study-groups`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      setGroups(response.data.sort((a: Group, b: Group) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
            
                } catch (error) {
                    console.error('Error fetching study groups:', error);
                }
                finally {
                    setLoadingGroups(false);
                 }
            }
        }
        await getGroups();
        console.log("current groups complete");

        // Clear search params
        navigate(window.location.pathname, { replace: true });
        };
        fetchGroups();
        console.log("fetch groups complete");
      }, []);

    


      useEffect(() => {
        console.log("Updated selected group users:", selectedGroupUsers);
      }, [selectedGroupUsers]);



    const updateUsers = (userId: number) => {
    setSelectedGroupUsers(prevUsers => (prevUsers || []).filter(user => user.id !== userId));
    };





    const updateChatName = (chatId: number, newName: string) => {
    setGroupNames((prevGroupNames) => ({
        ...prevGroupNames,
        [chatId]: newName,
    }));
    };


    const removeUser = async (userId: number, groupId: number | null) => {
      if (!groupId) {
          console.error('Group ID is missing.');
          return;
      }
      try {
          const response = await axios.delete(`${REACT_APP_API_URL}/api/study-groups/${groupId}/users/${userId}`);
          
          if (response.status === 200) {
              // Update selectedGroupUsers state
              setSelectedGroupUsers(prevUsers => (prevUsers || []).filter(user => user.id !== userId));
  
              // Update the groups state dynamically
              setGroups(prevGroups =>
                  prevGroups.map(group =>
                      group.id === groupId
                          ? { ...group, users: group.users.filter(user => user.id !== userId) }
                          : group
                  )
              );
  
              // If the removed user was the last user in the group, remove the group
              setGroups(prevGroups => prevGroups.filter(group => group.users.length > 0));
  
              // Update selectedGroup if needed
              if (selectedGroup?.id === groupId && selectedGroupUsers?.length === 1) {
                  setSelectedGroup(null);
              }
  
              // Send a system message when a user is removed
              const removedUser = selectedGroupUsers?.find(user => user.id === userId);
              if (removedUser) {
                  let mess = userId === currentUserId
                      ? `${removedUser.firstName} ${removedUser.lastName}  left the group.`
                      : `${removedUser.firstName} ${removedUser.lastName}  was removed from the group.`;
                  
                  handleSendSystemMessage(mess, selectedGroup?.chatID);
                  updateChatTimestamp(selectedGroup?.chatID);
              }
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
                
                {selectedGroupUsers && (
                    <div className="study-group-panel">
                    <StudyGroupInfo
                        chatID={selectedGroup.chatID}
                        updateChatName={updateChatName}
                        groupId={currentGroupId}
                        currentId={currentUserId}
                        users={selectedGroupUsers.filter(user => user.id !== currentUserId) ?? []}
                        onRemoveUser={removeUser}
                        updateUsers={updateUsers}
                        isItEdit ={isEditMode}
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
