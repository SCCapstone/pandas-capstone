import './EditStudyGroup.css';
import '../pages/messaging.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { on } from 'events';
import { selectStyles, formatEnum } from '../utils/format';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { StylesConfig, ControlProps, CSSObjectWithLabel } from 'react-select';




const animatedComponents = makeAnimated();

interface StudyGroup {
  name: string;
  description: string;
  subject: string;
  chatID: number;
  ideal_match_factor: string;
}

const EditStudyGroup = ({ chatID, onClose, updateChatName}: { chatID: number; onClose: () => void ; updateChatName: (chatId: number, newName: string) => void}) => {
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

  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';


  // Fetch the study group details when the component is mounted
  useEffect(() => {
    const fetchStudyGroup = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('You need to be logged in to edit the study group.');
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
        alert('Failed to load study group details.');
      }
    };

    fetchStudyGroup();
  }, [chatID]);

  // Handle form submission to save the changes
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to be logged in to save the study group.');
        return;
      }

      const updatedStudyGroup = { name, description, subject, chatID, ideal_match_factor };

      if (name==='' || name === null) {
        alert('Please enter a study group name.');
        return;
      }

      if ( ideal_match_factor === null) {
        alert('Please enter an ideal match factor.');
        return;
      }

      const response = await axios.put(
        `${REACT_APP_API_URL}/api/study-groups/chat/${chatID}`,
        updatedStudyGroup,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      handleUpload();



      console.log('Study group updated:', response.data);

      updateChatName(chatID, name);
      // alert('Study group updated successfully!');
      onClose(); // Close the panel or component after saving
    } catch (error) {
      console.error('Error saving study group:', error);
      alert('Failed to save study group.');
    }
  };

  const handleUpload = async () => {
    console.log('Uploading image...'); // Debug log
    if (!image) return;

    const formData = new FormData();
    formData.append('profilePic', image);
    formData.append('chatID', chatID.toString());
    const token = localStorage.getItem('token');
    if (token) {
      const res = await fetch(`${REACT_APP_API_URL}/api/study-group/upload-pfp`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) setImageUrl(data.profilePic);
      if (!res.ok) {
        console.error("Upload error:", data.error || "Unknown error");
        alert(`Error: ${data.error || "Failed to upload image"}`);
        return;
      }
    }
  };

  // Handle form submission
    
    // Function to handle file selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null;
      if (file) {
        setImage(file); // Store the selected file
      }
    };
  
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const formData = new FormData();
      
      const file = e.target.files ? e.target.files[0] : null;
      if (!file) return;  // If no file is selected, exit
        setImage(file);  // Store the selected file for later use
  
      formData.append("profilePic", file);  // Append the file to FormData with the field name 'profilePic'
      try {
        // Send the image to the backend
        const response = await fetch(`${REACT_APP_API_URL}/api/upload-preview`, {
          method: "POST",
          body: formData,  // Send the FormData
        });
    
        if (response.ok) {
          const data = await response.json();
          if (data.preview) {
            setImagePreview(data.preview);  // Set the preview image
          }
        } else {
          console.error("Failed to upload image:", response.statusText);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    };
  

  if (!studyGroup) return <div>Loading...</div>; // Show loading message while fetching the study group data

  return (
    <div className="edit-study-group-panel">
      <h1>Edit Study Group</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        
          <div className="edit-study-group-profile-picture">
            {/* If an image is selected, display it; otherwise, show the button */}
            {imagePreview ? (
              <img
                className='upload-button'
                src={imagePreview}  // Display the preview returned by the backend
                alt="Selected Profile"
                onClick={() => document.getElementById("image-upload")?.click()} // Allow re-selecting an image
              />
            ) : (
              <div>
                
                <img
                  className='upload-button'
                  src={profilePic || 'https://learnlink-public.s3.us-east-2.amazonaws.com/AvatarPlaceholder.svg'}
                  alt="Profile"
                  width="100"
                  height={100}
                  onClick={() => document.getElementById("image-upload")?.click()}

                />
              </div>
            )}

            {/* Hidden file input */}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
            {/* <button onClick={handleUpload}>Upload</button> */}

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
        <button type="button" onClick={handleSave}>Save</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};

export default EditStudyGroup;