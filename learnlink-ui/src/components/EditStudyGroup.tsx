import './EditStudyGroup.css';
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
import ProfilePictureModal from './ProfilePictureModal';




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


const EditStudyGroup =(
    {
    chatID, 
    onClose,
    updateChatName,
    updatePFP,
    groupId,
    currentId,
    users,
    onRemoveUser,
    updateUsers,
    onGroupUpdated,
  }: {
    chatID: number;
    onClose: () => void ;
    updateChatName: (chatId: number, newName: string) => void;
    updatePFP:  (chatId: number, newPFP: string) => void;
    groupId: number | null;
    currentId: number | null;
    users: User[] | null;
    onRemoveUser: (userId: number, groupId: number | null) => void; // Update type here
    updateUsers: (userId: number) => void;
    onGroupUpdated: (newName: string, newPFP: string) => void;

  }) => {
  const [studyGroup, setStudyGroup] = useState<StudyGroup | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [ideal_match_factor, setIdealMatchFactor] = useState<{ value: string; label: string } | null>(null);
  const [enumOptions, setEnumOptions] = useState({ studyHabitTags: [] });
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
  const alertVisible = alerts.some(alert => alert.visible);
  const [pfpModalOpen, setPfpModalOpen] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [currentGroupId, setCurrentGroupId] =  useState<number | null>(null);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState<User[] | null>(null);

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
        console.log(data)
        setStudyGroup(data);
        setName(data.name); 
        setImagePreview(data.profilePic? data.profilePic : "https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_busts-in-silhouette.png")
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
  }, [chatID]);

  useEffect(() => {
    console.log('Updated imagePreview:', imagePreview);
  }, [imagePreview]);  // Only run this effect when imagePreview changes


  const handleEmojiSelect = (emoji: string, URL:string) => {
    console.log("PASSED URL", URL)
    setImagePreview(URL)  
    setPfpModalOpen(false); // Close modal after selection
  };

  // Handle form submission to save the changes
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // alert('You need to be logged in to save the study group.');
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          { id: Date.now(), alertText: 'You need to be logged in to save the study group.', alertSeverity: "error", visible: true },
        ]);
        return;
      }
      
      const updatedStudyGroup = { name, description, subject, chatID, ideal_match_factor, profile_pic: imagePreview };

      console.log(updatedStudyGroup)

      if (name==='' || name === null) {
        // alert('Please enter a study group name.');
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          { id: Date.now(), alertText: 'Study group name is required', alertSeverity: "error", visible: true },
        ]);
        return;
      }

      if ( ideal_match_factor === null) {
        // alert('Please enter an ideal match factor.');
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          { id: Date.now(), alertText: 'Ideal match factor is required', alertSeverity: "error", visible: true },
        ]);
        return;
      }

      const response = await axios.put(
        `${REACT_APP_API_URL}/api/study-groups/chat/${chatID}`,
        updatedStudyGroup,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Study group updated:', response.data);
      
      updateChatName(chatID, name);
      if(imagePreview){
      updateChatName(chatID, imagePreview);
      }

      onGroupUpdated(name, imagePreview);


      setAlerts((prevAlerts) => [
        ...prevAlerts,
        { id: Date.now(), alertText: 'Study group updated', alertSeverity: "success", visible: true },
      ]);
      
      // alert('Study group updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving study group:', error);
      // alert('Failed to save study group.');
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        { id: Date.now(), alertText: "Failed to save study group", alertSeverity: "error" as "error", visible: true },
      ]);
    }
  };

  const handleUpload = async () => {
    console.log('Uploading image...'); // Debug log
    setImageUrl(imagePreview)
    if (!imageUrl) return;
    console.log(imageUrl);
  
    const formData = new FormData();
    formData.append('profilePic', imageUrl);
    formData.append('chatID', chatID.toString());
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No token found in localStorage");
      return;
    }
  };
  

  // Handle form submission
    
    // Function to handle file selection
  
  
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      setPfpModalOpen(true)
    };
  

    



  if (!studyGroup) return <div>Loading...</div>; // Show loading message while fetching the study group data

  return ( 
    
    <div className="edit-study-group-panel">
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
      <h1>Edit Study Group</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        
          <div className="edit-study-group-profile-picture">
            {/* If an image is selected, display it; otherwise, show the button */}
            {imagePreview ? (
              <img
                className='upload-button'
                src={imagePreview}  // Display the preview returned by the backend
                alt="Selected Profile"
                onClick={() => setPfpModalOpen(true)} // Allow re-selecting an image
              />
            ) : (
              <div>
                
                <img
                  className='upload-button'
                  src={profilePic? profilePic : 'https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_busts-in-silhouette.png'}
                  alt="Profile"
                  width="100"
                  height={100}
                  onClick={() => setPfpModalOpen(true)}

                />
              </div>
            )}

            {/* Hidden file input */}
            <input
              id="emoji-pfp-upload"
              type="button"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          {/* <button onClick={handleUpload}>Upload</button> */}
          <ProfilePictureModal
            isOpen={pfpModalOpen}
            onRequestClose={() => setPfpModalOpen(false)}
            onSelect={handleEmojiSelect}
          />

        </div>
        <div>
          <div>
          <label>Study Group Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
          <label>Bio:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>Relevant Course:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div>
          <label>Ideal Match Factor:</label>
          <Select
            name="ideal_match_factor"
            options={enumOptions.studyHabitTags.map((tag) => ({
              value: tag,
              label: formatEnum(tag), // Formats the tag into a readable label
            }))}
            value={ideal_match_factor?.label ? { value: ideal_match_factor.value, label: ideal_match_factor.label } : null}
            onChange={(newValue) => {
              // Type assertion for SingleValue
              const selectedOption = newValue as { value: string; label: string } | null;
              setIdealMatchFactor(selectedOption);
            }}
            closeMenuOnSelect={true} // Close menu on select since it's single-select
            components={animatedComponents}
            className="basic-single-select"
            classNamePrefix="select"
            isMulti={false}
            styles={selectStyles}
          />
          </div>
          

        <button className='save-group-button' onClick={handleSave}>Save</button>
        <button className='cancel-edit-button' onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};

export default EditStudyGroup;
