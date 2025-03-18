import './GroupUserList.css';
import '../pages/messaging.css';
import React, { useEffect, useState , useRef} from 'react';
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
  currentId,
  users,
  chatId,
  onClose,
  onRemoveUser,
  updateUsers,
}: {
  groupId: number | null;
  currentId: number | null;
  users: User[] | null;
  chatId: number | null;
  onClose: () => void;
  onRemoveUser: (userId: number, groupId: number | null) => void; // Update type here
  updateUsers: (userId: number) => void;
}) => {
  
  const panelRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);


  const handleRemoveUser = (userId: number) => {
    if (groupId !== null) {
      onRemoveUser(userId, groupId); // Pass both userId and groupId
    } else {
      console.error('Group ID is not available');
    }
    updateUsers(userId);
  };

  const closeComponent = () => {
    onClose(); // Calls the parent's function to unmount
  };

  return (
    <div ref={panelRef} className="user-list-panel">
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
      <ul>
        <button
          onClick={() => {
            if (currentId !== null) {
              handleRemoveUser(currentId);
              closeComponent();
            } else {
              console.error('Current user ID is not available');
            }
          }}
          className="leave-button"
        >
          Leave Study Group
        </button>
      </ul>
      <button onClick={onClose} className="close-button">Close</button>
    </div>
  );
};

export default GroupUserList;
