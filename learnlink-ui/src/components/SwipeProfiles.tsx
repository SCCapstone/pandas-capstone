import { useState, useEffect } from 'react';
import './SwipeProfiles.css';

const SwipeProfiles = ({ userId }: { userId: number }) => {
  const [profiles, setProfiles] = useState<any>({ users: [], studyGroups: [] });
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch(`http://localhost:2020/api/profiles/${userId}`);
        const data = await response.json();
        setProfiles(data);
      } catch (error) {
        console.error('Error fetching profiles:', error);
      }
    };

    fetchProfiles();
  }, [userId]);

  const handleBack = () => {
    if (currentProfileIndex > 0) {
      setCurrentProfileIndex(currentProfileIndex - 1); // Move to the previous profile
    }
  };

  const handleSwipe = async (direction: 'Yes' | 'No', targetId: number, isStudyGroup: boolean) => {
    try {
      await fetch('http://localhost:2020/api/swipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          targetId,
          direction,
          isStudyGroup,
        }),
      });

      setCurrentProfileIndex(currentProfileIndex + 1);  // Move to the next profile
    } catch (error) {
      console.error('Error swiping:', error);
    }
  };

  if (profiles.users.length === 0 && profiles.studyGroups.length === 0) {
    return <div className='swipe-info'><p>Loading profiles...</p></div>;
  }

  const currentProfile = profiles.users[currentProfileIndex] || profiles.studyGroups[currentProfileIndex];

  return (
    <div>
      <div className="profile-card">
        {currentProfile ? (
          <>
            <div className='swipe-main-container'>
              <div className='swipe-left-side'>
                <img src={currentProfile.profilePic} alt={`${currentProfile.firstName} ${currentProfile.lastName}`} className='profile-pic' />
                <div className='bio'>
                  <h3>Bio:</h3>
                  <p>{currentProfile.bio}</p>
                </div>

              </div>
              <div className='swipe-right-side'>
                <h1>{currentProfile.firstName} {currentProfile.lastName}</h1>
                <h3>@{currentProfile.username}</h3>
                <div className='profile-details-container'>
                  <div className='swipe-profile-details'>
                    <p><span className="bold-first-word">Age: </span>{currentProfile.age}</p>
                    <p><span className="bold-first-word">College: </span>{currentProfile.college}</p>
                    <p><span className="bold-first-word">Major: </span>{currentProfile.major}</p>
                    <p><span className="bold-first-word">Gender: </span>{currentProfile.gender}</p>
                  </div>
                  <div className='swipe-profile-details'>
                    <p><span className="bold-first-word">Grade: </span>{currentProfile.grade}</p>
                    <p><span className="bold-first-word">Relevant Coursework: </span>{currentProfile.relevant_courses}</p>
                    <p><span className="bold-first-word">Fav Study Method: </span>{currentProfile.study_method}</p>
                    <p><span className="bold-first-word">Study Tags: </span>{currentProfile.studyHabitTags}</p>
                  </div>
                </div>
              </div>

              {/* Render more profile details as needed */}
            </div>
            <div className="swipe-buttons-container">
              <button onClick={handleBack} disabled={currentProfileIndex === 0}    
              style={{ visibility: currentProfileIndex > 0 ? 'visible' : 'hidden' }}>
                Back
              </button>
              
              <div className="swipe-action-buttons">
                <button onClick={() => handleSwipe('Yes', currentProfile.id, !!currentProfile.studyGroupId)}>
                  Match
                </button>
                <button onClick={() => handleSwipe('No', currentProfile.id, !!currentProfile.studyGroupId)}>
                  Skip
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className='swipe-info'>
            <p>No more profiles to swipe on!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwipeProfiles;
