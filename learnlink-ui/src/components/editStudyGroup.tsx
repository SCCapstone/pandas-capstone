import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import CopyrightFooter from './CopyrightFooter';
import './EditStudyGroup.css';
import axios from 'axios';


interface StudyGroup {
  name: string;
  description: string;
  subject: string;
  chatID: number;
}

const EditStudyGroup = ({ studyGroup, onClose }: { studyGroup: StudyGroup; onClose: () => void }) => {
  const [name, setName] = useState(studyGroup.name || '');
  const [description, setDescription] = useState(studyGroup.description || '');
  const [subject, setSubject] = useState(studyGroup.subject || '');
  const [loading, setLoading] = useState(false); // Add loading state to disable save button during save operation
  const [error, setError] = useState<string | null>(null); // Error handling state
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';


  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to be logged in to create a study group.');
        return;
      }

      // Disable button during the API call
      setLoading(true);
      setError(null); // Reset previous errors

      const updatedStudyGroup = {
        name,
        description,
        subject,
      };

      // Replace `studyGroup.chatID` to identify the study group to update
      const response = await axios.put(
        `${REACT_APP_API_URL}/api/study-groups/chat/${studyGroup.chatID}`,
        updatedStudyGroup,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Study group updated successfully:', response.data);
      onClose(); // Close the panel upon successful update
    } catch (err) {
      setError('Failed to update the study group. Please try again.');
      console.error('Error updating study group:', err);
    } finally {
      setLoading(false); // Re-enable button after operation is finished
    }
  };

  return (
    <div className="edit-study-group-panel">
      <h2>Edit Study Group</h2>
      <form>
        <div>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label>Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
        <div>
          <button type="button" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'} {/* Show loading state */}
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStudyGroup;