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
import JoinReqProfile from '../components/PopupProfile';
import CustomAlert from '../components/CustomAlert';
import { unescape } from 'querystring';
import { useNavigate } from "react-router-dom";
import { handleSendSystemMessage,updateChatTimestamp} from "../utils/messageUtils";
import { group } from 'console';


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
    const [searchParams] = useSearchParams();
    const selectedGroupId = searchParams.get("groupId");
    const tab = searchParams.get("tab");
    const navigate = useNavigate();


    /********** USE EFFECTS **********/




    /*
      On initial render, fetch the current group, current user, and all study groups from the API. 
      Sets up various UI states based on the data.
    */

    useEffect(() => {
      const fetchGroups = async () => {
        const token = localStorage.getItem('token');

        console.log("groups selected group id: ",selectedGroupId);
        // Fetch currently selected group info
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
        // Fetch current logged-in user
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

        // Fetch all study groups
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
        navigate('/groups', { replace: true });
      };
      fetchGroups();
      console.log("fetch groups complete");
    }, []);


    /*
      Logs whether edit mode is enabled when isEditMode changes.
    */

    useEffect(()=> {
      const printEdit = async() => {
        console.log("PRINT EDIT",isEditMode)
      }
      printEdit();
    }, [isEditMode])

  
    /*
      Logs updated user list when selectedGroupUsers changes.
    */

    useEffect(() => {
      console.log("Updated selected group users:", selectedGroupUsers);
    }, [selectedGroupUsers]);



    /********** FUNCTIONS **********/

    /*
      Removes a user from selectedGroupUsers state.  
    */

    const updateUsers = (userId: number) => {
      setSelectedGroupUsers(prevUsers => (prevUsers || []).filter(user => user.id !== userId));
    };


    /*
      Updates the profile picture for a specific group (matched by chatID).
    */

    const updatePFP = (chatId: number, newPFP: string) => {
      setGroups(prev =>
        prev.map(group =>
          group.chatID === chatId ? { ...group, profile_pic: newPFP } : group
        )
      );
    };


    /*
      Updates the name of a group chat.
    */

    const updateChatName = (chatId: number, newName: string) => {
      setGroups(prev =>
        prev.map(group =>
          group.chatID === chatId ? { ...group, name: newName } : group
        )
      );
    };


    /**
     * Removes a user from a study group. 
     * Updates group state and UI accordingly. 
     * Also sends a system message if applicable.
     * @param userId 
     * @param groupId 
     * @returns 
     */
    
    const removeUser = async (userId: number, groupId: number | null) => {
      if (!groupId) {
        console.error('Group ID is missing.');
        return;
      }
      if (!userId) {
        console.error('User ID is missing.');
        return;
      }
      try {
        const response = await axios.delete(`${REACT_APP_API_URL}/api/study-groups/${groupId}/users/${userId}`);
    
        if (response.status === 200) {
          /// Remove from UI
          setSelectedGroupUsers(prevUsers => (prevUsers || []).filter(user => user.id !== userId));
    
          // If current user left
          if (userId === currentUserId) {
            setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
    
            // Optionally deselect the group if it’s open
            if (selectedGroup?.id === groupId) {
              setSelectedGroup(null);
            }
          }
    
          // Verify if group still exists
          const groupCheck = await axios.get(`${REACT_APP_API_URL}/api/study-groups/${groupId}`).catch(() => null);
          
          
          if (!(groupCheck?.status === 200)) {
            setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
    
            // Optionally deselect the group if it’s open
            if (selectedGroup?.id === groupId) {
              setSelectedGroup(null);
            }
          }

          // If group is still valid, send system message
          if (groupCheck?.status === 200) {
            const removedUser = selectedGroupUsers?.find(user => user.id === userId);
            if (removedUser) {
              let mess =
                userId === currentUserId
                  ? `${removedUser.firstName} ${removedUser.lastName} left the group.`
                  : `${removedUser.firstName} ${removedUser.lastName} was removed from the group.`;
    
              handleSendSystemMessage(mess, selectedGroup?.chatID);
              updateChatTimestamp(selectedGroup?.chatID);
            }
          }
        } else {
          console.error('Failed to delete the user.');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    };
    
    return (
        <div className="Groups" data-testid = "groups-component">
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
              <div className="TabsContainer">
              <button 
                className="GroupsTab" 
              >
                Groups
              </button>

            
            </div>
            {/* List of groups */}
              
                    {/* List of groups */}
                    {loadingGroups ? (
                        <div className="loading-container" data-testid ="loading-spinner" > 
                        Loading... <span className="loading-spinner"></span>
                        </div>
                    ) : (
                        <div className="GroupList">
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
                             <img src={group.profile_pic? group.profile_pic : "https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_busts-in-silhouette.png"} alt={`${group.name}`} className='groups-profile-pic' />

                            <span>{group.name}</span>
                            </li>
                        ))}
                        </div>
                    )}
              
            </div>
            <div className="GroupInfo">
              {/* Display message if no group is selected */}
              {!selectedGroup ? (
                <div className="NoGroupSelected">
                  {groups.length === 0
                    ? "No groups found. Go to the Match page to join one or chat with someone to create one."
                    : "Please select a group"}
                </div>
              ) : (
                selectedGroupUsers && (
                  <div className="study-group-panel" data-testid = "study-group-panel">
                    <StudyGroupInfo
                      chatID={selectedGroup.chatID}
                      updateChatName={updateChatName}
                      updatePFP={updatePFP}
                      groupId={currentGroupId}
                      currentId={currentUserId}
                      users={selectedGroupUsers.filter((user) => user.id !== currentUserId) ?? []}
                      onRemoveUser={removeUser}
                      updateUsers={updateUsers}
                      isItEdit={isEditMode}
                    />
                  </div>
                )
              )}
            </div>
          </div>
            
            <CopyrightFooter />
        </div>
      );
};

export default Groups;

