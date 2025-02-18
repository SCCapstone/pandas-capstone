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

// Functional component to display a list of users in a group
const GroupUserList = ({ users, onClose }: { users: User[] | null; onClose: () => void }) => {
  return (
    <div className="user-list-panel"> {/* Container for the user list */}
      <h3>Group Members</h3> {/* Title */}
      <ul>
        {/* Checking if users exist and rendering the list */}
        {users && users.length > 0 ? (
          users.map((user) => (
            <li key={user.id}>{user.firstName} {user.lastName}</li> // Displaying each user's full name
          ))
        ) : (
          <p>No users found.</p> // Message displayed if no users are found
        )}
      </ul>
      <button onClick={onClose}>Close</button> {/* Button to close the user list panel */}
    </div>
  );
};
  export default GroupUserList;
  
