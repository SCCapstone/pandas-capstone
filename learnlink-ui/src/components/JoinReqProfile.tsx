import './JoinRequests.css';
import '../pages/messaging.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface JoinReqProfileProps {
  id: number;
  name: string;
  onClose: () => void;
}

const JoinReqProfile: React.FC<JoinReqProfileProps> = ({ id, name, onClose }) => {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${REACT_APP_API_URL}/api/users/profile/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setUser(response.data);
      } catch (err) {
        setError('Failed to fetch user data.');
      }
    };
    fetchUser();
  }, [id]);

  if (error) {
    return <div className="profile-panel"><p>{error}</p></div>;
  }

  if (!user) {
    return <div className="profile-panel"><p>Loading profile...</p></div>;
  }

  return (
    <div className="profile-panel">
      <div className="profile-header">
        <h1>{name}'s Profile</h1>
        <button className="close-button" onClick={onClose}>X</button>
      </div>
      <div className="profile-content">
        <img src={user.profilePic} alt={`${user.first_name} ${user.last_name}`} className="profile-pic" />
        <div className="profile-details">
          <p><strong>Username:</strong> @{user.username}</p>
          <p><strong>Age:</strong> {user.age}</p>
          <p><strong>College:</strong> {user.college}</p>
          <p><strong>Major:</strong> {user.major}</p>
          <p><strong>Gender:</strong> {user.gender}</p>
          <p><strong>Grade:</strong> {user.grade}</p>
          <p><strong>Relevant Coursework:</strong> {user.relevant_courses}</p>
          <p><strong>Favorite Study Method:</strong> {user.study_method}</p>
          <p><strong>Study Tags:</strong> {user.studyHabitTags.length > 0 ? user.studyHabitTags.join(', ') : 'None'}</p>
          <div className="bio">
            <h3>Bio:</h3>
            <p>{user.bio}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinReqProfile;
