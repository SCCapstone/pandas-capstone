import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './SwipeProfiles.css';
import { formatEnum } from '../utils/format';
import { ReactComponent as GroupLogo } from './GroupLogo.svg'
import InviteMessagePanel from '../components/InviteMessagePanel';
import { set } from 'react-hook-form';
import axios from 'axios';
import PopupProfile from './PopupProfile';
import "../pages/publicProfile.css"

const SwipeProfiles = ({ userId }: { userId: number }) => {
  const [profiles, setProfiles] = useState<any>({ users: [], studyGroups: [] });
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [selectedMember, setSelectedMember] = useState<{ id: number } | null>(null);
  const genericUserPfp = "https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_bust-in-silhouette.png";
  const genericStudyGroupPfp = "https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_busts-in-silhouette.png";

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch(`${REACT_APP_API_URL}/api/profiles/${userId}`);
        const data = await response.json();
        
        // Combine users and study groups into a single array
        // const combinedProfiles = [...data.users, ...data.studyGroups];

        // // Shuffle the combined profiles randomly
        // const shuffledProfiles = combinedProfiles.sort(() => Math.random() - 0.5);

          // const interLeavedProfiles: any[] = [];
          // const maxLength = Math.max(data.users.length, data.studyGroups.length);
      
          // for (let i = 0; i < maxLength; i++) {
        //     if (i < data.users.length) interLeavedProfiles.push(data.users[i]);  // Add a user
        //     if (i < data.studyGroups.length) interLeavedProfiles.push(data.studyGroups[i]);  // Add a study group
        // }


        setProfiles(data.profiles);
        setLoadingProfiles(false)
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

  const handlePendingRequests = () => {
    navigate(`/network?tab=sentRequests`);
  };

  const handleSwipe = async (direction: 'Yes' | 'No', targetId: number, isStudyGroup: boolean, message: string | undefined) => {
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
          message: message
        }),
      });

      setShowInvitePanel(false);

      setCurrentProfileIndex(currentProfileIndex + 1);  // Move to the next profile
    } catch (error) {
      console.error('Error swiping:', error);
    }
  };
  console.log(profiles ? profiles.length : null)

  // if (profiles.length === 0) {
  //   return <div className='swipe-info'><p>Loading profiles...</p></div>;
  // }

  const currentProfile = profiles[currentProfileIndex];
  console.log(currentProfile)

  const handleSendMessage = async (message: string) => {

    handleSwipe("Yes", currentProfile.id, !!currentProfile.studyGroupId, message);


    // NOTIFICATION for requests

    // Fetch current user if token exists
    const token = localStorage.getItem('token');
    let requesterName = "unknown";

    if (token) {
      try {
        const response = await axios.get(`${REACT_APP_API_URL}/api/currentUser`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUserId(response.data.id);
        requesterName = `${response.data.firstName} ${response.data.lastName}`;
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    }

    const isStudyGroup = Array.isArray(currentProfile.users) && currentProfile.users.length > 0;

    try {
      let notificationRecipients: number[] = [];
      let notificationMessage = `You have a new pending request from ${requesterName}`;

      if (isStudyGroup) {
        // Notify all members of the study group
        notificationRecipients = currentProfile.users.map((user: any) => user.id);
        notificationMessage = `You have a new pending request from ${requesterName} in ${currentProfile.name} group`;

      } else {
        // Notify the individual user
        notificationRecipients = [currentProfile.id];
      }

      await Promise.all(
        notificationRecipients.map(async (recipientId) => {
          await fetch(`${REACT_APP_API_URL}/notifications/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: recipientId,
              message: notificationMessage,
              type: "Match",
            }),
          });
        })
      );

      console.log("Notification(s) sent successfully!");
    } catch (error) {
      console.error("Error sending notification:", error);
    }

  };

  if (loadingProfiles) return <div className="loading-container" data-testid="loading">Loading... <span className="loading-spinner"></span> </div>;
  if (!profiles || !currentProfile) return <p className="no-requests">No more profiles to swipe on.</p>

  if (profiles?.length === 0) return <p className="no-requests">No more profiles to swipe on.</p>

  return (
    <div className="whole-swipe-component">
      <div className='match-header-buttons'>
        <div></div>
        {/* <button className='location'>Location (put in later)</button> */}
        <button className='pendingRequests' onClick={handlePendingRequests}>Pending Requests</button>
      </div>
      {currentProfile ? (
        <div className="whole-component">
          {currentProfile.chatID ? (
            <div className="group-container">
              <div className='swipe-profile-card'>

                <div className="profile-header">
                  <div className="profile-avatar">
                    <img src={currentProfile.profilePic} alt={`${currentProfile.name}`} />

                  </div>
                  <div className="profile-info">
                    <h2>{`${currentProfile.name}`}</h2>
                    <p className="username">Study Group</p>
                  </div>
                </div>
                {currentProfile.description ? (
                  <><div className="bio-section">
                    <div className="bio-header">
                      <span className="bio-icon">📚</span>
                      <span>About {currentProfile.name}</span>
                    </div>
                    <p className="bio-text">
                      {currentProfile.description}
                    </p>
                  </div>
                  </>
                ) : null}

                {currentProfile.subject ? (
                  <><div className="bio-section">
                    <div className="bio-header">
                      <span className="bio-icon">📓</span>
                      <span>Subject</span>
                    </div>
                    <p className="bio-text">
                      {currentProfile.subject}
                    </p>
                  </div>
                  </>
                ) : null}



                <div className="public-group-info">
                  <h3>Members</h3>

                  <div className="public-member-cards">
                    {currentProfile.users && currentProfile.users.length > 0 ? (
                      currentProfile.users.map((member: any, index: number) => (
                        <div key={index} className="public-member-card" onClick={() => setSelectedMember({ id: member.id })}>
                          <div className="public-member-card-top">
                            <h1>{member.name}</h1>
                            <div className="public-member-card-top-left" >
                              <img
                                src={member.profilePic || genericUserPfp}
                                alt={`${member.firstName} ${member.lastName}`}
                                className="public-member-pic"
                              />
                            </div>
                            <div className="public-member-card-top-right">
                              <h1>{member.firstName} {member.lastName} </h1>
                              <h2>@{member.username}</h2>
                            </div>
                          </div>
                          <>
                            {/* <p><span className="bold-first-word">Study Tags: <br></br></span></p> */}
                            <p>
                              {member.studyHabitTags.length > 0 ? (
                                member.studyHabitTags.map((tag: string, index: number) => (
                                  <span key={index} className={`member tag ${tag}`}>
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
<div className="swipe-buttons-container">
                <button
                  onClick={handleBack}
                  disabled={currentProfileIndex === 0}
                  style={{ visibility: currentProfileIndex > 0 ? "visible" : "hidden" }}
                >
                  Back
                </button>

                <div className="swipe-action-buttons">
                  {/* <button onClick={() => { handleSwipe("Yes", currentProfile.id, !!currentProfile.studyGroupId); handleInvite() }}> */}
                  <button onClick={() => handleInvite()}>
                    Match
                  </button>

                  <button onClick={() => handleSwipe("No", currentProfile.id, !!currentProfile.studyGroupId, undefined)}>
                    Skip
                  </button>
                </div>
              </div>
              </div>
              
            </div>

          ) : (
            <div className="swipe-main-container">
              {currentProfile ? (
                <>
                  <div className="profile-card">
                    <div className="profile-header">
                    <div className="profile-avatar">
                      <img src={currentProfile.profilePic} alt={`${currentProfile.first_name} ${currentProfile.last_name}`} />

                    </div>
                    <div className="profile-info">
                      <h2>{`${currentProfile?.firstName} ${currentProfile?.lastName}`}</h2>
                      <p className="username">@{currentProfile?.username}</p>
                    </div>
                    </div>
                    {currentProfile.bio ? (
                      <>
                        <div className="bio-section">
                          <div className="bio-header">
                            <span className="bio-icon">📚</span>
                            <span>About Me</span>
                          </div>
                          <p className="bio-text">
                            {currentProfile.bio}
                          </p>
                        </div>
                      </>
                    ) : null}



                    <div className="profile-details">
                      <div className="detail-item">
                        <span className="detail-label">Age</span>
                        <span className="detail-value">{currentProfile.age?.length > 0 ? currentProfile.age : "N/A"}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Grade</span>
                        <span className="detail-value">{formatEnum(currentProfile.grade)?.length ? formatEnum(currentProfile?.grade) : "N/A"}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">College</span>
                        <span className="detail-value">{currentProfile.college?.length > 0 ? currentProfile.college : "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Major</span>
                      <span className="detail-value">{currentProfile.major?.length > 0 ? currentProfile.major : "N/A"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Gender</span>
                      <span className="detail-value">{formatEnum(currentProfile.gender)?.length > 0 ? formatEnum(currentProfile.gender) : "N/A"}</span>
                    </div>
                    {/* <div className="detail-item">
                          <span className="detail-label">Relevant Coursework</span>
                          <span className="detail-value">{currentProfile.relevant_courses[0] && currentProfile.relevant_courses.length > 0 ? currentProfile.relevant_courses : "N/A"}</span>
                        </div> */}
                        <div className="detail-item">
                          <span className="detail-label">Fav Study Method</span>
                          <span className="detail-value">{currentProfile.study_method?.length > 0 ? currentProfile.study_method : "N/A"}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Relevant Coursework</span>
                          <div className="profile-tags">
                            {currentProfile.relevant_courses?.length > 0 ? (
                              currentProfile.relevant_courses.map((course: string, index: number) => (
                                <span key={index} className="tag course-tag">
                                  {course}
                                </span>
                              ))
                            ) : (
                              <span className="detail-value">N/A</span>
                            )}
                          </div>
                        </div>
                        <div className='tags-detail'>
                          <span className="detail-label">Study Tags</span>
                          <div className="profile-tags">
                            {currentProfile.studyHabitTags?.length > 0 ? (
                              currentProfile.studyHabitTags.map((tag: string, index: number) => (
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
                      <div className='tags-buttons'>
                        {/* <div className='tags-detail'>
                          <span className="detail-label">Study Tags</span>
                          <div className="profile-tags">
                            {currentProfile.studyHabitTags?.length > 0 ? (
                              currentProfile.studyHabitTags.map((tag: string, index: number) => (
                                <span key={index} className={`tag ${tag}`}>
                                  {formatEnum(tag)}
                                </span>
                              ))
                            ) : (
                              <span className="detail-value">No study tags specified</span>
                            )}

                          </div>
                        </div> */}


                        <div className="public-action-buttons" >


                        </div>



                      </div>
                      <div className="swipe-buttons-container">
                        <button
                          onClick={handleBack}
                          disabled={currentProfileIndex === 0}
                          style={{ visibility: currentProfileIndex > 0 ? "visible" : "hidden" }}
                        >
                          Back
                        </button>

                        <div className="swipe-action-buttons">
                          {/* <button onClick={() => { handleSwipe("Yes", currentProfile.id, !!currentProfile.studyGroupId); handleInvite() }}> */}
                          <button onClick={() => handleInvite()}>
                            Match
                          </button>

                          <button onClick={() => handleSwipe("No", currentProfile.id, !!currentProfile.studyGroupId, undefined)}>
                            Skip
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* <h1>{currentProfile.name}</h1>
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
                  <h1>{currentProfile.firstName.trim()} {currentProfile.lastName.trim()}</h1>
                  <h3>@{currentProfile.username}</h3>
                  <div className="profile-details-container">
                    <div className="swipe-profile-details">
                      <p><span className="bold-first-word">Age: </span>{currentProfile.age}</p>
                      <p><span className="bold-first-word">College: </span>{currentProfile.college}</p>
                      <p><span className="bold-first-word">Major: </span>{currentProfile.major}</p>
                      <p><span className="bold-first-word">Gender: </span>{formatEnum(currentProfile.gender)}</p>
                    </div>
                    <div className="swipe-profile-details">
                      <p><span className="bold-first-word">Grade: </span>{formatEnum(currentProfile.grade)}</p>
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
                </div>*/}
              </>
              ) : (
                <p> ejejje</p>
              )}
            </div>
          )}

          {/* <div className="swipe-buttons-container">
            <button
              onClick={handleBack}
              disabled={currentProfileIndex === 0}
              style={{ visibility: currentProfileIndex > 0 ? "visible" : "hidden" }}
            >
              Back
            </button>

            <div className="swipe-action-buttons">
              <button onClick={() => handleInvite()}>
                Match
              </button>

              <button onClick={() => handleSwipe("No", currentProfile.id, !!currentProfile.studyGroupId, undefined)}>
                Skip
              </button>
            </div>
          </div> */}
        </div>
      ) : (
        <div className="swipe-info">
          <p>No more profiles to swipe on!</p>
        </div>
      )}
      <InviteMessagePanel
        open={showInvitePanel}
        onClose={() => setShowInvitePanel(false)}
        onConfirm={handleSendMessage}
        targetName={
          currentProfile?.name ||
          (currentProfile?.firstName && currentProfile?.lastName
            ? `${currentProfile.firstName} ${currentProfile.lastName}`
            : 'Unknown'
          )
        }
      />
      {selectedMember && (
        <PopupProfile
          id={selectedMember.id}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
};

export default SwipeProfiles;