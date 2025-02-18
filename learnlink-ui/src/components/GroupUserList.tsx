import './GroupUserList.css';
import '../pages/messaging.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { on } from 'events';

interface StudyGroup {
  name: string;
  description: string;
  subject: string;
  chatID: number;
}

const GroupUserList = ({ chatID, onClose}: { chatID: number; onClose: () => void }) => {
  const [studyGroup, setStudyGroup] = useState<StudyGroup | null>(null);
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

    
        const data = response.data;
        setStudyGroup(data);
      } catch (error) {
        console.error('Error fetching study group:', error);
        alert('Failed to load study group details.');
      }
    };

    fetchStudyGroup();
  }, [chatID]);
 

  if (!studyGroup) return <div>Loading...</div>; // Show loading message while fetching the study group data

  return (
    <div className="user-list-panel">
      
      
      
    </div>
  );
};

export default GroupUserList;