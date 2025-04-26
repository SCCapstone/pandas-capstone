import './CreateStudyGroup.css';
import '../pages/messaging.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { on } from 'events';
import { selectStyles, formatEnum } from '../utils/format';
import { updateChatTimestamp } from '../utils/messageUtils';
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

const CreateStudyGroup =(
    {
    chatID, 
    onClose,
    updateChatName,
    handleCreateStudyGroup,
    setCurrentGroupId,
  }: {
    chatID: number;
    onClose: () => void ;
    updateChatName: (chatId: number, newName: string) => void;
    handleCreateStudyGroup: ((chatId: number) => Promise<number | void>);
    setCurrentGroupId: React.Dispatch<React.SetStateAction<number | null>>; 
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
  const alertVisible = alerts.some(alert => alert.visible);

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState<User[] | null>(null);
  const [pfpModalOpen, setPfpModalOpen] = useState(false);
  

  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

  /*
    Fetches study group data based on the current chat, 
    including enum values for form options and the study group’s current configuration.
  */
  const fetchStudyGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Show an alert if the user isn't logged in
        // alert('You need to be logged in to edit the study group.');
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          { id: Date.now(), alertText: 'You need to be logged in to create the study group.', alertSeverity: "error", visible: true },
        ]);
        return;
      }

      // Fetch enum options for dropdowns like study habits
      const enumsResponse = await fetch(`${REACT_APP_API_URL}/api/enums`);
      const enumsData = await enumsResponse.json();
      setEnumOptions({
        studyHabitTags: enumsData.studyHabitTags,
      });

      // Fetch the study group data for this chat
      const response = await axios.get(
        `${REACT_APP_API_URL}/api/study-groups/chat/${chatID}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Chat id::::: ", chatID);

      // Update state with the retrieved study group details
      const data = response.data;
      console.log("DATAtA:::", data);
      setCurrentGroupId(data.studyGroupID);
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


  // Triggered when a user selects an emoji-based profile picture. 
  // Updates the preview and selected image URL and closes the modal.
  const handleEmojiSelect = (emoji: string, URL:string) => {
    console.log("PASSED URL", URL);
    // Update image preview and actual image URL
    setImagePreview(URL);
    setImageUrl(URL);
    // Close the modal
    setPfpModalOpen(false); 
  };


  // Triggers the fetchStudyGroup function when chatID changes (i.e., when a new chat is selected).
  useEffect(() => {
    fetchStudyGroup();
  }, [chatID]);

  // Handles the form submission to save a study group's data, including validations and backend updates.
  const handleSave = async () => {
    try {
      // First, create the study group if it doesn't exist
      const newStudyGroupID = await handleCreateStudyGroup(chatID);
      console.log("NEW", newStudyGroupID);
      await fetchStudyGroup();
    
      // Refresh the form with updated study group data
      const token = localStorage.getItem('token');
      if (!token) {
        // alert('You need to be logged in to save the study group.');
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          { id: Date.now(), alertText: 'You need to be logged in to save the study group.', alertSeverity: "error", visible: true },
        ]);
        return;
      }

      // Prepare updated study group object
      const updatedStudyGroup = { name, description, subject, chatID, ideal_match_factor, profile_pic: imageUrl };

      // Input validation
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

      // Send update to the server
      const response = await axios.put(
        `${REACT_APP_API_URL}/api/study-groups/chat/${chatID}`,
        updatedStudyGroup,
        { headers: { Authorization: `Bearer ${token}` } }
      );


      console.log('Study group updated:', response.data);
      // Update chat metadata (like name and timestamp)
      updateChatTimestamp(chatID);
      updateChatName(chatID, name);

      // Show success alert
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        { id: Date.now(), alertText: 'Study group updated', alertSeverity: "success", visible: true },
      ]);
      
      // alert('Study group updated successfully!');
      // Close the modal/form
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
 

  // Used to show the modal for choosing or uploading an image.
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPfpModalOpen(true); // Open modal for image upload/selection
  };


  if (!studyGroup) return <div>Loading...</div>; // Show loading message while fetching the study group data

  return ( 
    
    <div className="create-study-group-panel">
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
      <h1>Create Study Group</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        
          <div className="create-study-group-profile-picture">
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
                  src={profilePic || 'https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_busts-in-silhouette.png'}
                  alt="Profile"
                  width="100"
                  height={100}
                  onClick={() => setPfpModalOpen(true)}

                />
              </div>
            )}

            {/* Hidden file input */}
            <input
              id="image-upload"
              data-testid="image-upload-input"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
            <ProfilePictureModal
            isOpen={pfpModalOpen}
            onRequestClose={() => setPfpModalOpen(false)}
            onSelect={handleEmojiSelect}
          />

          </div>
        <div>
          <div>
          <label htmlFor="study-group-name">Study Group Name:</label>
          <input
            id="study-group-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
          <label htmlFor="bio">Bio:</label>
          <input
            id="bio"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="course">Relevant Course:</label>
          <input
            id="course"
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

        <div className='create-study-group-buttons'>
          <button className='save-create-button' onClick={handleSave}>Save</button>
          <button className='cancel-create-button' onClick={onClose}>Cancel</button>
        </div>

      </form>
    </div>
  );
};

export default CreateStudyGroup;

