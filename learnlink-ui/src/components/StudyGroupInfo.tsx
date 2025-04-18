import './StudyGroupInfo.css';
import '../pages/messaging.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { on } from 'events';
import { selectStyles, formatEnum } from '../utils/format';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import GroupUserList from '../components/GroupUserList';
import { StylesConfig, ControlProps, CSSObjectWithLabel } from 'react-select';
import CustomAlert from './CustomAlert';
import GroupUserContainer from './GroupUserContainer';
import EditStudyGroup from './EditStudyGroup';
import { useNavigate, Link } from "react-router-dom";


const animatedComponents = makeAnimated();

interface StudyGroup {
  name: string;
  description: string;
  subject: string;
  chatID: number;
  ideal_match_factor: string;
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

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
}


const StudyGroupInfo =(
    {
    chatID, 
    updateChatName,
    updatePFP,
    groupId,
    currentId,
    users,
    onRemoveUser,
    updateUsers,
    isItEdit,
  }: {
    chatID: number;
    updateChatName: (chatId: number, newName: string) => void;
    updatePFP: (chatId: number, newPFP: string) => void;
    groupId: number | null;
    currentId: number | null;
    users: User[] | null;
    onRemoveUser: (userId: number, groupId: number | null) => void; // Update type here
    updateUsers: (userId: number) => void;
    isItEdit: boolean;
    
  }) => {
  const [studyGroup, setStudyGroup] = useState<StudyGroup | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [ideal_match_factor, setIdealMatchFactor] = useState<{ value: string; label: string } | null>(null);
  const [enumOptions, setEnumOptions] = useState({ studyHabitTags: [] });
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
  const alertVisible = alerts.some(alert => alert.visible);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [currentGroupId, setCurrentGroupId] =  useState<number | null>(null);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState<User[] | null>(null);
  const [isEdit, setIsEdit] = useState<Boolean>(isItEdit);
  const navigate = useNavigate();
  

  /**
   * The StudyGroupInfo component displays details about a specific study group including its name, 
   * subject, description, profile picture, and list of members. 
   * It also supports toggling to an edit mode using the EditStudyGroup component, displaying alerts, 
   * and providing navigation to the group’s chat and availability pages. 
   * It fetches group data from an API on mount and manages both view and edit modes, depending on props and state.
   */

  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

  /**
   * Fetches study group details and enum options (e.g. tags) from the server when the component 
   * mounts or when chatID or isEdit changes.
   */
  useEffect(() => {
    const fetchStudyGroup = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // alert('You need to be logged in to edit the study group.');
          setAlerts((prevAlerts) => [
            ...prevAlerts,
            { id: Date.now(), alertText: 'You need to be logged in to edit the study group.', alertSeverity: "error", visible: true },
          ]);
          return;
        }

        // Fetch available study habit tags
        const enumsResponse = await fetch(`${REACT_APP_API_URL}/api/enums`);
        const enumsData = await enumsResponse.json();
        setEnumOptions({
          studyHabitTags: enumsData.studyHabitTags,
        });

        // Fetch group data by chat ID
        const response = await axios.get(
          `${REACT_APP_API_URL}/api/study-groups/chat/${chatID}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Set the form fields with the data received
        const data = response.data;
        setStudyGroup(data);
        setName(data.name);
        setDescription(data.description);
        setSubject(data.subject);
        setIdealMatchFactor(data.ideal_match_factor ? { value: data.ideal_match_factor, label: formatEnum(data.ideal_match_factor) } : null);
        setProfilePic(data.profilePic);
      } catch (error) {
        console.error('Error fetching study group:', error);
        // alert('Failed to load study group details.');
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          { id: Date.now(), alertText: "Failed to load study group details. Please try again later.", alertSeverity: "error", visible: true },
        ]);
      }
    };

  // Fetch the study group details when the component is mounted
    fetchStudyGroup();
  }, [chatID, isEdit]);

 
  /**
   * Enables the edit mode by setting isEdit to true.
   */
  const handleEdit = () => {
    setIsEdit(true);
  };


  /**
   * Disables the edit mode by setting isEdit to false.
   */
  const handleClose = () => {
    setIsEdit(false);
  };
  

  if (!studyGroup) return <div>Loading...</div>; // Show loading message while fetching the study group data

  return (isEdit ? (
    <EditStudyGroup
      chatID={chatID}
      onClose={handleClose} 
      updateChatName={updateChatName}
      updatePFP={updatePFP}
      groupId={groupId}
      currentId={currentId}
      users={users}
      onRemoveUser={onRemoveUser}
      updateUsers={updateUsers}
      onGroupUpdated={(newName: string, newPFP: string) => {
        setName(newName); // update local state
        updateChatName(chatID, newName); // update parent (Groups page)
        updatePFP(chatID, newPFP)
        setIsEdit(false); // close edit mode
      }}
    />
  ) : (

    <div className="main-study-group-panel">
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

      <div className='Button-Header'> 
        <button className='Chat-Button'
            onClick={() => {
              console.log("chatID being passed:", chatID);
              navigate(`/messaging?selectedChatId=${chatID}`);
            }}
        >Chat</button>
        <Link to={`/studyGroup/${groupId}/schedule`}>
        <button className='Availability-Button' data-testid = 'avail-button'> Availability </button>
      </Link>
        <button className='Edit-Button' onClick={handleEdit}> Edit </button>

      </div>

      <h1> {name} </h1>

        
        <div className="study-group-profile-picture">
            <img
                className='profile-pic'
                src={profilePic || 'https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_busts-in-silhouette.png'}
                alt="Profile"
                width="100"
                height={100}
            />
        </div>
        {/* 
        <div className='group-title'>
           <span className="bold-first-word"> Study Group Name: </span> 
             {name}
        </div>
          */}
          
        <div className="group-description">
            <span className="bold-first-word">Bio: </span>
           {description}
        </div>


        <div className='group-subject'>
            <span className="bold-first-word">Course: </span>
            {subject}
        </div>

        <div className='group-ideal'>
        <span className="bold-first-word">Ideal Match Factor: </span>
          <span className="ideal-match-factor-display">
            {ideal_match_factor?.label ? ideal_match_factor.label : "N/A"}
          </span>
        </div>


          <div>
          <label className='members-label'>Members:</label>
              <div className="member-list">
                <GroupUserContainer
                  groupId={groupId}
                  currentId={currentId}
                  users={users}
                  chatId={chatID}
                  onRemoveUser={onRemoveUser}
                  updateUsers={updateUsers}
                  isPopup={false}
                />
              </div>
        </div> 

    </div>
  )
  );
};

export default StudyGroupInfo;

