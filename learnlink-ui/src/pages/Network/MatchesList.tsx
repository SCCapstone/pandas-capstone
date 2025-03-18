// src/pages/Network/MatchesList.tsx
import React, { useState } from 'react';
import { User } from './types';

interface MatchesListProps {
  handleSelectUser: (userId: number) => void;
}

const MatchesList: React.FC<MatchesListProps> = ({ handleSelectUser }) => {
  const [matchesList, setMatchesList] = useState<User[]>([]);
  
  return (
    <div className="TabPanel">
      <h3>Your Matches</h3>
      <p>List of matched study partners...</p>
      <ul className="network-list">
        {matchesList.map((user) => (
          <li key={user.id} onClick={() => handleSelectUser(user.id)}>
            <img src={user.profilePic} alt={`${user.firstName} ${user.lastName}`} className="network-profile-pic" />
            <div className="network-bio">
              <h3>{user.username}</h3>
              <p>{user.firstName} {user.lastName}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MatchesList;
