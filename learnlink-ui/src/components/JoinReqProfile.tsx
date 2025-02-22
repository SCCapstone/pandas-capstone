import './JoinReqProfile.css'
import '../pages/messaging.css';
import { formatEnum } from '../utils/format';
import './components.css';
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
    return <div className="popup-profile-panel"><p>{error}</p></div>;
  }

  if (!user) {
    return <div className="popup-profile-panel"><p>Loading profile...</p></div>;
  }

  return (
    <div className="popup-profile-panel">
      <div className="popup-profile-header">
        <h1>{name}'s Profile</h1>
        <button className="popup-close-button" onClick={onClose}>X</button>
      </div>
      <div className='popup-content'>
        <div className='popup-left-side'>
            <img src={user.profilePic} alt={`${user.first_name} ${user.last_name}`} className='popup-profile-pic' />
            <div className='popup-bio'>
                <h3>Bio:</h3>
                <p>{user.bio}</p>
            </div>

        </div>
        <div className='popup-right-side'>
            <h1>{user.first_name} {user.last_name}</h1>
            <h3>@{user.username}</h3>
            <div className='popup-profile-details-container'>
                <div className='popup-profile-details'>
                    <p><span className="bold-first-word">Age: </span>{user.age}</p>
                    <p><span className="bold-first-word">College: </span>{user.college}</p>
                    <p><span className="bold-first-word">Major: </span>{user.major}</p>
                    <p><span className="bold-first-word">Gender: </span>{user.gender}</p>
                </div>
                <div className='popup-profile-details'>
                    <p><span className="bold-first-word">Grade: </span>{user.grade}</p>
                    <p><span className="bold-first-word">Relevant Coursework: </span>{user.relevant_courses}</p>
                    <p><span className="bold-first-word">Fav Study Method: </span>{user.study_method}</p>
                    <p><span className="bold-first-word">Study Tags: </span>
                        {user.studyHabitTags.length > 0 ? (
                            user.studyHabitTags.map((tag: string, index: number) => (
                                <span key={index} className="popup-tag">
                                    {formatEnum(tag)}
                                </span>
                            ))
                        ) : (
                            "No study tags specified."
                        )}
                    </p>
                </div>
            </div>
            </div>
        </div>
      </div>
  );
};

export default JoinReqProfile;
