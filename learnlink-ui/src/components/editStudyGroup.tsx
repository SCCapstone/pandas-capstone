import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import CopyrightFooter from './CopyrightFooter';
import './EditStudyGroup.css';

interface StudyGroup {
  name: string;
  description: string;
  subject: string;
}

const EditStudyGroup = ({ studyGroup, onClose }: { studyGroup: StudyGroup; onClose: () => void }) => {
  const [name, setName] = useState(studyGroup.name || '');
  const [description, setDescription] = useState(studyGroup.description || '');
  const [subject, setSubject] = useState(studyGroup.subject || '');

  const handleSave = () => {
    // Your logic to update the study group goes here
    console.log('Study group updated:', { name, subject, description });
    onClose(); // Close the panel after saving
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
        <div>
          <button type="button" onClick={handleSave}>
            Save
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
