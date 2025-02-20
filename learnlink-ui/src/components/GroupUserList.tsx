import './GroupUserList.css';
import '../pages/messaging.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { on } from 'events';

// Defining the structure of a StudyGroup object
interface StudyGroup {
  name: string;   // Name of the study group
  chatID: number; // Unique identifier for the group's chat
  users: User[];    // List of users in the group
}

// Defining the structure of a User object
interface User {
  id: number;        // Unique user ID
  firstName: string; // User's first name
  lastName: string;  // User's last name
}
const GroupUserList = (
  {
  groupId,
  users,
  onClose,
  onRemoveUser,
}: {
  groupId: number | null;
  users: User[] | null;
  onClose: () => void;
  onRemoveUser: (userId: number, groupId: number | null) => void; // Update type here
}) => {
  
  const handleRemoveUser = (userId: number) => {
    if (groupId !== null) {
      onRemoveUser(userId, groupId); // Pass both userId and groupId
    } else {
      console.error('Group ID is not available');
    }
  };

  return (
    <div className="user-list-panel">
      <h3>Group Members</h3>
      <ul>
        {users && users.length > 0 ? (
          users.map((user) => (
            <li key={user.id}>
              {user.firstName} {user.lastName}
              <button onClick={() => handleRemoveUser(user.id)} className="remove-button">
                X
              </button>
            </li>
          ))
        ) : (
          <p>No users found.</p>
        )}
      </ul>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default GroupUserList;
