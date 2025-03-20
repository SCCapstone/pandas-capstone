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
    groupId,
    currentId,
    users,
    onRemoveUser,
    updateUsers,
  }: {
    chatID: number;
    updateChatName: (chatId: number, newName: string) => void;
    groupId: number | null;
    currentId: number | null;
    users: User[] | null;
    onRemoveUser: (userId: number, groupId: number | null) => void; // Update type here
    updateUsers: (userId: number) => void;
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
  const [isEdit, setIsEdit] = useState<Boolean>(false);

  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';



  // Fetch the study group details when the component is mounted
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
        const enumsResponse = await fetch(`${REACT_APP_API_URL}/api/enums`);
        const enumsData = await enumsResponse.json();
        setEnumOptions({
          studyHabitTags: enumsData.studyHabitTags,
        });

        const response = await axios.get(
          `${REACT_APP_API_URL}/api/study-groups/chat/${chatID}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Set the form fields with the existing study group values
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

    fetchStudyGroup();
  }, [chatID, isEdit]);

 
  
  const handleEdit = () => {
    setIsEdit(true);
  };
  

  

  if (!studyGroup) return <div>Loading...</div>; // Show loading message while fetching the study group data

  return (isEdit ? (
    <EditStudyGroup
      chatID={chatID}
      onClose={() => setIsEdit(false)}
      updateChatName={updateChatName}
      groupId={groupId}
      currentId={currentId}
      users={users}
      onRemoveUser={onRemoveUser}
      updateUsers={updateUsers}
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
        <button className='Send-Button'> Send Meeting Request </button>
        <button className='Requests-Button'>Pending Meeting Requests</button>
        <button className='Calendar-Button'> Calendar </button>
        <button className='Availability-Button'> Availability </button>
        <button className='Edit-Button' onClick={handleEdit}> Edit </button>

      </div>

      <h1> {name} </h1>

        
        <div className="study-group-profile-picture">
            <img
                className='profile-pic'
                src={profilePic || 'https://learnlink-public.s3.us-east-2.amazonaws.com/AvatarPlaceholder.svg'}
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
                  groupId={currentGroupId}
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

