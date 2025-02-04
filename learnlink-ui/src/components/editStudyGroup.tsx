import './EditStudyGroup.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface StudyGroup {
  name: string;
  description: string;
  subject: string;
  chatID: number;
}

const EditStudyGroup = ({ chatID, onClose }: { chatID: number; onClose: () => void }) => {
  const [studyGroup, setStudyGroup] = useState<StudyGroup | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
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

      const updatedStudyGroup = { name, description, subject, chatID };

      const response = await axios.put(
        `${REACT_APP_API_URL}/api/study-groups/chat/${chatID}`,
        updatedStudyGroup,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Study group updated:', response.data);
      // alert('Study group updated successfully!');
      onClose(); // Close the panel or component after saving
    } catch (error) {
      console.error('Error saving study group:', error);
      alert('Failed to save study group.');
    }
  };

  if (!studyGroup) return <div>Loading...</div>; // Show loading message while fetching the study group data

  return (
    <div className="edit-study-group-panel">
      <h2>Edit Study Group</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label>Description:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <button type="button" onClick={handleSave}>Save</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};

export default EditStudyGroup;