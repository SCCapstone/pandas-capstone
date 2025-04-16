import './PopupProfile.css'
import '../pages/messaging.css';
import { formatEnum } from '../utils/format';
import './components.css';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

interface PopupProfileProps {
  id: number;
  onClose: () => void;
}

const PopupProfile: React.FC<PopupProfileProps> = ({ id, onClose }) => {

  const panelRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

  /**
   *  is a React functional component designed to display a detailed user profile in a modal-style popup. 
   */


  /**
   * This hook runs when the component mounts or when the id prop changes. 
   * It defines and invokes an asynchronous function fetchUser, 
   * which makes a GET request to the API to retrieve the profile data of the user with the given id. 
   * The request includes an authorization token from local storage. 
   * If successful, the user data is stored in state; if not, an error message is set.
   */
  useEffect(() => {
    
    const fetchUser = async () => {
      try {
        // Send GET request to fetch profile data for the given user ID
        const response = await axios.get(`${REACT_APP_API_URL}/api/users/profile/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Include auth token from local storage
          },
        });
        setUser(response.data); // Update user state with fetched data
      } catch (err) {
        setError('Failed to fetch user data.');
      }
    };
    fetchUser(); // Invoke the data fetching function
  }, [id]); // Dependency: re-run when `id` changes


  /**
   * This hook sets up an event listener to detect clicks outside the popup panel. 
   * If a click occurs outside the referenced DOM node (panelRef), the onClose function is triggered to close the popup. 
   * The event listener is removed when the component unmounts or when onClose changes, to avoid memory leaks.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If click occurred outside the panelRef element, close the popup
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside); // Add click listener on mount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside); // Clean up on unmount
    };
  }, [onClose]); // Dependency: re-setup if `onClose` changes

  /**
   * If there’s an error in fetching the data, it displays an error message.
   */
  if (error) {
    return <div className="popup-profile-panel"><p>{error}</p></div>;
  }

  /**
   * If the user data hasn't loaded yet, it displays a loading message.
   */
  if (!user) {
    return <div className="popup-profile-panel"><p>Loading profile...</p></div>;
  }

  return (

    <div ref={panelRef} className="popup-profile-panel">
                                    <div className="profile-header">
                                        <div className="profile-avatar">
                                            <img src={user.profilePic} alt={`${user.first_name} ${user.last_name}`} />

                                        </div>
                                        <div className="profile-info">
                                            <h2>{`${user.first_name} ${user.last_name}`}</h2>
                                            <p className="username">@{user.username}</p>
                                        </div>
                                        <button className="popup-close-button" onClick={onClose}>X</button>

                                    </div>
                                    {user.bio ? (
                                        <><div className="bio-section">
                                            <div className="bio-header">
                                                <span className="bio-icon">📚</span>
                                                <span>About Me</span>
                                            </div>
                                            <p className="bio-text">
                                                {user.bio}
                                            </p>
                                        </div>
                                        </>
                                    ) : null}



                                    <div className="profile-details">
                                        <div className="detail-item">
                                            <span className="detail-label">Age</span>
                                            <span className="detail-value">{user.age ? user.age : "N/A"}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Grade</span>
                                            <span className="detail-value">{formatEnum(user.grade)?.length ? formatEnum(user.grade) : "N/A"}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">College</span>
                                            <span className="detail-value">{user.college?.length > 0 ? user.college : "N/A"}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Major</span>
                                            <span className="detail-value">{user.major?.length >0 ? user.major : "N/A"}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Gender</span>
                                            <span className="detail-value">{formatEnum(user.gender)?.length > 0 ? formatEnum(user.gender) : "N/A"}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Relevant Coursework</span>
                                            <span className="detail-value">{user.relevant_courses?.length > 0 ? user.relevant_courses : "N/A"}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Fav Study Method</span>
                                            <span className="detail-value">{user.study_method?.length > 0 ? user.study_method : "N/A"}</span>
                                        </div>
                                    </div>
                                    <div className='tags-buttons-popup'>
                                        <div className='tags-detail'>
                                            <span className="detail-label">Study Tags</span>
                                            <div className="profile-tags">
                                                {user.studyHabitTags?.length > 0 ? (
                                                    user.studyHabitTags.map((tag: string, index: number) => (
                                                        <span key={index} className={`tag ${tag}`}>
                                                            {formatEnum(tag)}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="detail-value">No study tags specified</span>
                                                )}

                                            </div>
                                        </div>

                                        
                                    </div>
      {/* <div className="popup-profile-header">
        <h1>{user.first_name} {user.last_name}'s Profile</h1>
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
              <p><span className="bold-first-word">Gender: </span>{formatEnum(user.gender)}</p>
            </div>
            <div className='popup-profile-details'>
              <p><span className="bold-first-word">Grade: </span>{formatEnum(user.grade)}</p>
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
      </div>*/}
    </div>
  );
};

export default PopupProfile;
