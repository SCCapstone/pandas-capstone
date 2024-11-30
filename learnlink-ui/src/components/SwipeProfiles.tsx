import { useState, useEffect } from 'react';

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
    return <div>Loading profiles...</div>;
  }

  const currentProfile = profiles.users[currentProfileIndex] || profiles.studyGroups[currentProfileIndex];

  return (
    <div>
      <div className="profile-card">
        {currentProfile ? (
          <>
            {/*<img src={currentProfile.profilePic} alt={`${currentProfile.firstName} ${currentProfile.lastName}`} />*/}
            <h3>{currentProfile.firstName} {currentProfile.lastName}</h3>
            <p>{currentProfile.bio}</p>
            <p>{currentProfile.major}</p>
            {/* Render more profile details as needed */}
          </>
        ) : (
          <div>No more profiles to swipe on!</div>
        )}
      </div>

      <div className="swipe-buttons">
        <button onClick={() => handleSwipe('No', currentProfile.id, !!currentProfile.studyGroupId)}>
          No
        </button>
        <button onClick={() => handleSwipe('Yes', currentProfile.id, !!currentProfile.studyGroupId)}>
          Yes
        </button>
      </div>
    </div>
  );
};

export default SwipeProfiles;
