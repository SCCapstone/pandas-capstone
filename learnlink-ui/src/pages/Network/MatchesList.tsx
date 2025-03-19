// src/pages/Network/MatchesList.tsx
import React, { useState, useEffect } from 'react';
import { Match, User } from './types';
import axios from 'axios';
import CustomAlert from '../../components/CustomAlert';
import { getLoggedInUserId } from '../../utils/auth';


interface MatchesListProps {
  handleSelectUser: (userId: number) => void;
}
const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';


const MatchesList: React.FC<MatchesListProps> = ({ handleSelectUser }) => {
  const [matchesList, setMatchesList] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
const currentUserId = getLoggedInUserId();

  useEffect(() => {

    const fetchMatches = async () => {
        try {
            const token = localStorage.getItem('token');  // Example, change as per your implementation

            const response = await axios.get(`${REACT_APP_API_URL}/api/profiles`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const filteredMatches = response.data.matches.filter(
                (match: { isStudyGroupMatch: boolean }) => match.isStudyGroupMatch !== true
              );

              console.log(filteredMatches)

            
        // Filter out duplicates by checking unique pairs (user1Id, user2Id)
        const seenMatches = new Set();
        const uniqueMatches = filteredMatches.filter((match: { user1Id: number, user2Id: number }) => {
          const userPair = [match.user1Id, match.user2Id].sort().join('-'); // Sort to make order irrelevant
          
          if (seenMatches.has(userPair)) {
            return false; // Duplicate match, skip it
          }
          
          seenMatches.add(userPair);
          return true;
        });

            setMatchesList(uniqueMatches);

        } catch (err) {
        setError('Failed to fetch matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) return <div>Loading matches...</div>;

  
  return (
    <div className="TabPanel">
        { error ? (
            <CustomAlert
            text={"Unable to retrieve matches. Please try again later."}
            severity={"error"}
            onClose={() => setError(null)}
        />
        ) : null
    }
      {/* <h3>Your Matches</h3>
      <p>List of matched study partners...</p> */}
      <ul className="network-list">
      {matchesList.map((match) => {

            // Determine the opponent based on the current user's ID
            const friend = match.user1Id === currentUserId ? match.user2 : match.user1;
            // console.log("user1",match.user1Id)
            // console.log("me", currentUserId)

            // Check if the friend is different from the current user
            if (friend.id === currentUserId) {
              return null; // Skip the match if it's the current user matching with themselves
          }
          return (
              <ul key={match.id} onClick={() => handleSelectUser(friend.id)}>
                  <div className='network-list-container'>
                      <div className='network-list-info'>
                          <img
                              src={friend.profilePic || 'https://learnlink-public.s3.us-east-2.amazonaws.com/AvatarPlaceholder.svg'}
                              alt={`${friend.firstName} ${friend.lastName}`}
                              className='network-profile-pic'
                          />
                          <div className='network-bio'>
                              <h3>{friend.username}</h3>
                              <p>{friend.firstName} {friend.lastName}</p>
                          </div>
                      </div>
                      <div className='network-list-status'>
                              <button className='network-withdraw-button' onClick={(event: React.MouseEvent<HTMLButtonElement>) => { event.stopPropagation();  }}>Remove</button>
                      </div>

                  </div>
              </ul>
          );
      })}
                {/* {matchesList.map((user) => (
          <li key={user.id} onClick={() => handleSelectUser(user.id)}>
            <img src={user.profilePic} alt={`${user.firstName} ${user.lastName}`} className="network-profile-pic" />
            <div className="network-bio">
              <h3>{user.username}</h3>
              <p>{user.firstName} {user.lastName}</p>
            </div>
          </li>
        ))} */}
            </ul>
        </div>
    );
};

export default MatchesList;
