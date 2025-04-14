import React, { useState, useEffect, useRef} from 'react';
import io from 'socket.io-client';
import '../pages/messaging.css';
import './GroupUserContainer.css'
import Navbar from '../components/Navbar';
import CopyrightFooter from '../components/CopyrightFooter';
import GroupUserList from '../components/GroupUserList';
import { group } from 'console';



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

const GroupUserContainer = ({
  groupId,
  currentId,
  users,
  chatId,
  onRemoveUser,
  updateUsers,
  onClose,
  isPopup,
}: {
    groupId: number | null;
    currentId: number | null;
    users: User[] | null;
    chatId: number | null;
    onRemoveUser: (userId: number, groupId: number | null) => void; // Update type here
    updateUsers: (userId: number) => void;
    onClose?: () => void;
    isPopup: boolean; 
    }) => {

    /**
     * The GroupUserContainer component is a wrapper component that conditionally renders a list of users in a study group,
     * either as a popup or as an inline section depending on the isPopup prop.
     * It leverages a child component called GroupUserList to actually display the users. 
     * It is also designed to support updating and removing users from the group.
     */
  return (
    <div>

      {/* Popup Mode */}
      {isPopup ? (
       <div className='Popup-members'>
        <GroupUserList
            groupId={groupId}
            currentId={currentId}
            users={users}
            chatId={chatId}
            onClose={onClose}
            onRemoveUser={onRemoveUser}
            updateUsers={updateUsers}
            isPopup={true}
        />
     </div>
      ) : (
        <div className="Inline-members">
          <GroupUserList
            groupId={groupId}
            currentId={currentId}
            users={users}
            chatId={chatId}
            onRemoveUser={onRemoveUser}
            updateUsers={updateUsers}
            isPopup={false} // No popup behavior
          />
        </div>
      )}
    </div>
  );
};

export default GroupUserContainer;
