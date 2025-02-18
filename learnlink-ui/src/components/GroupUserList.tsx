import './GroupUserList.css';
import '../pages/messaging.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { on } from 'events';

interface StudyGroup {
  name: string;
  chatID: number;
  users: User;
}

interface User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  }
  


const GroupUserList = ({ users, onClose }: { users: User[] | null; onClose: () => void }) => {
    return (
      <div className="user-list-panel">
        <h3>Group Members</h3>
        <ul>
          {users && users.length > 0 ? (
            users.map((user) => <li key={user.id}>{user.firstName} {user.lastName}</li>)
          ) : (
            <p>No users found.</p>
          )}
        </ul>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
  export default GroupUserList;
  
