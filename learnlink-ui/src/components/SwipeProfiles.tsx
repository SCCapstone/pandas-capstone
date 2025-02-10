import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './SwipeProfiles.css';
import { formatEnum } from '../utils/format';
import { ReactComponent as GroupLogo } from './GroupLogo.svg'
import InviteMessagePanel from '../components/InviteMessagePanel';
import { set } from 'react-hook-form';


const SwipeProfiles = ({ userId }: { userId: number }) => {
  const [profiles, setProfiles] = useState<any>({ users: [], studyGroups: [] });
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch(`${REACT_APP_API_URL}/api/profiles/${userId}`);
        const data = await response.json();
        
        // Combine users and study groups into a single array
        const combinedProfiles = [...data.users, ...data.studyGroups];

        // Shuffle the combined profiles randomly
        const shuffledProfiles = combinedProfiles.sort(() => Math.random() - 0.5);

        setProfiles(shuffledProfiles);
      } catch (error) {
        console.error('Error fetching profiles:', error);
      }
    };

    fetchProfiles();
  }, [userId]);

  const handleMessaging = () => {
    navigate(`/messaging?user=${currentProfile.id}`);
    
  };

  const handleInvite = () => {
    // navigate(`/messaging?user=${currentProfile.id}`);
    setShowInvitePanel(true);
    
  };

  const handleBack = () => {
    if (currentProfileIndex > 0) {
      setCurrentProfileIndex(currentProfileIndex - 1); // Move to the previous profile
    }
  };

  const handleSwipe = async (direction: 'Yes' | 'No', targetId: number, isStudyGroup: boolean) => {
    try {
      const currentProfile = profiles[currentProfileIndex];

      await fetch(`${REACT_APP_API_URL}/api/swipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          targetId: currentProfile.id,
          direction,
          isStudyGroup: !!currentProfile.chatID, // Check if it's a study group
        }),
      });

      setCurrentProfileIndex(currentProfileIndex + 1);  // Move to the next profile
    } catch (error) {
      console.error('Error swiping:', error);
    }
  };
  console.log(profiles.length)

  if (profiles.length === 0) {
    return <div className='swipe-info'><p>Loading profiles...</p></div>;
  }

  const currentProfile = profiles[currentProfileIndex];
  console.log(currentProfile)


  return (
    <div className="whole-swipe-component">
      {currentProfile ? (
        <div className="profile-card">
          {currentProfile.chatID ? (
            <div className="group-container">

            <h1 className='group-title'>Group: {currentProfile.name}</h1>

            <div className="group-info">
              

              <div className="group-right">
                <GroupLogo/>
                <div className="group-description">
                <span className="bold-first-word">Bio: </span>
                <br></br>{currentProfile.description}
                </div>
                <div className='group-subject'>
                  <span className="bold-first-word">Course: </span>{currentProfile.subject}
                  </div>

                </div>
                <div className="group-left">
                  {/* <h1>Members:</h1> */}
                  <div className="member-cards">
                    {currentProfile.users && currentProfile.users.length > 0 ? (
                      currentProfile.users.map((member: any, index: number) => (
                        <div key={index} className="member-card">
                          <div className="member-card-top">
                            <h1>{member.name}</h1>
                            <div className="member-card-top-left" >
                              <img
                                src={member.profilePic || 'https://learnlink-public.s3.us-east-2.amazonaws.com/AvatarPlaceholder.svg'}
                                alt={`${member.firstName} ${member.lastName}`}
                                className="member-pic"
                              />
                            </div>
                            <div className="member-card-top-right">
                            <h1>{member.firstName} {member.lastName}</h1>
                            <h2>@{member.username}</h2>
                            </div>
                          </div>
                          <>
                              <p><span className="bold-first-word">Bio:</span></p>
                              <p>{member.bio}</p>

                              {/* <div className="swipe-profile-details">
                              <p><span className="bold-first-word">Age: </span>{member.age}</p>
                              <p><span className="bold-first-word">College: </span>{member.college}</p>
                              <p><span className="bold-first-word">Major: </span>{member.major}</p>
                              <p><span className="bold-first-word">Gender: </span>{member.gender}</p>
                              </div> */}
                                {/* 
                              <p><span className="bold-first-word">Grade: </span>{member.grade}</p>
                              <p><span className="bold-first-word">Relevant Coursework: </span>{member.relevant_courses}</p>
                              <p><span className="bold-first-word">Fav Study Method: </span>{member.study_method}</p>
                              */}
                                <p><span className="bold-first-word">Study Tags: <br></br></span>
                                  {member.studyHabitTags.length > 0 ? (
                                    member.studyHabitTags.map((tag: string, index: number) => (
                                      <span key={index} className="member-tag">
                                        {formatEnum(tag)}
                                      </span>
                                    ))
                                  ) : (
                                    "No study tags specified."
                                  )}
                                </p>
                          </>
                        </div>
                      ))
                    ) : (
                      <p>No members yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

          ) : (
            <div className="swipe-main-container">

              <>
                <h1>{currentProfile.name}</h1>
                <div className="swipe-left-side">
                  <img
                    src={currentProfile.profilePic}
                    alt={`${currentProfile.firstName} ${currentProfile.lastName}` || currentProfile.name}
                    className="profile-pic"
                  />
                  <div className="bio">
                    <h3>Bio:</h3>
                    <p>{currentProfile.bio}</p>
                  </div>
                </div>
                <div className="swipe-right-side">
                  <h1>{currentProfile.firstName} {currentProfile.lastName}</h1>
                  <h3>@{currentProfile.username}</h3>
                  <div className="profile-details-container">
                    <div className="swipe-profile-details">
                      <p><span className="bold-first-word">Age: </span>{currentProfile.age}</p>
                      <p><span className="bold-first-word">College: </span>{currentProfile.college}</p>
                      <p><span className="bold-first-word">Major: </span>{currentProfile.major}</p>
                      <p><span className="bold-first-word">Gender: </span>{currentProfile.gender}</p>
                    </div>
                    <div className="swipe-profile-details">
                      <p><span className="bold-first-word">Grade: </span>{currentProfile.grade}</p>
                      <p><span className="bold-first-word">Relevant Coursework: </span>{currentProfile.relevant_courses}</p>
                      <p><span className="bold-first-word">Fav Study Method: </span>{currentProfile.study_method}</p>
                      <p><span className="bold-first-word">Study Tags: </span>
                        {currentProfile.studyHabitTags.length > 0 ? (
                          currentProfile.studyHabitTags.map((tag: string, index: number) => (
                            <span key={index} className="tag">
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
              </>
            </div>
          )}

          <div className="swipe-buttons-container">
            <button
              onClick={handleBack}
              disabled={currentProfileIndex === 0}
              style={{ visibility: currentProfileIndex > 0 ? "visible" : "hidden" }}
            >
              Back
            </button>

            <div className="swipe-action-buttons">
              <button onClick={() => { handleSwipe("Yes", currentProfile.id, !!currentProfile.studyGroupId); handleInvite() }}>
                Match
              </button>

              <button onClick={() => handleSwipe("No", currentProfile.id, !!currentProfile.studyGroupId)}>
                Skip
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="swipe-info">
          <p>No more profiles to swipe on!</p>
        </div>
      )}
      {showInvitePanel && (
        <InviteMessagePanel
          onClose={() => setShowInvitePanel(false)}
          currentUserId={userId}
          targetUserId={currentProfile.id}
        />
      )}
    </div>
  );
};

export default SwipeProfiles;