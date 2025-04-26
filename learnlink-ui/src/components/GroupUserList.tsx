import './GroupUserList.css';
import '../pages/messaging.css';
import './GroupUserContainer.css'
import React, { useEffect, useState , useRef} from 'react';
import axios from 'axios';
import { on } from 'events';

// Defining the structure of a StudyGroup object
interface StudyGroup {
  name: string;
  chatID: number; 
  users: User[];   
}

// Defining the structure of a User object
interface User {
  id: number;     
  firstName: string; 
  lastName: string;  
  profilePic?: string;
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
  isPopup,
}: {
  groupId: number | null;
  currentId: number | null;
  users: User[] | null;
  chatId: number | null;
  onClose?: () => void;
  onRemoveUser: (userId: number, groupId: number | null) => void; // Update type here
  updateUsers: (userId: number) => void;
  isPopup: boolean; 
}) => {
  
  /**
   * The GroupUserList component displays a list of users in a study group. 
   * It allows the current user to remove others, leave the group, and optionally render as a popup panel. 
   * When in popup mode, clicking outside the panel closes it. 
   * It also makes use of React refs and event listeners to handle UI interactions.
   */

  const panelRef = useRef<HTMLDivElement>(null);


  // Close popup if user clicks outside the panel (only when in popup mode)
  useEffect(() => {
    if (!isPopup) return; 

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose?.(); // Close popup
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopup, onClose]);


  // Handles removing a user from the group (triggered by clicking 'X')
  const handleRemoveUser = (userId: number) => {
    console.log(groupId);
    if (groupId !== null) {
      onRemoveUser(userId, groupId); // Pass both userId and groupId
    } else {
      console.error('Group ID is not available');
    }
    updateUsers(userId);
  };


  // Handles current user leaving the group
  const handleLeaveGroup = () => {
    if (currentId !== null && groupId !== null) {
      onRemoveUser(currentId, groupId); // Remove self from group
      updateUsers(currentId); // Refresh UI
      onClose?.(); // Close the popup after the user leaves the group
    } else {
      console.error('User ID or Group ID is not available');
    }
  };


  return (
    <div ref={panelRef} className="user-list-panel">
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
          onClick={handleLeaveGroup}
          className="leave-group-button"
        >
          Leave Study Group
        </button>
      </ul>
      <ul> {isPopup && <button onClick={onClose} className="close-button">Close</button>} </ul>
      
    </div>
  );
};

export default GroupUserList;

