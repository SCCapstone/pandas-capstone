import './JoinRequests.css';
import '../pages/messaging.css';
import './components.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Chat {
  id: number;
  name: string;
  messages: Message[];
  users: User[]; 
  createdAt: string;
  updatedAt: string;
}

interface Message{
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  chatId: number;
  liked: boolean;
  
}
interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
}
interface MessagesNaviProps {
    chats: Chat[];
    selectedChat: Chat | null;
    setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>;
    handleDeleteChat: (id: number) => void;
    chatNames: { [key: number]: string };

  }
  

const MessagesNavi: React.FC<MessagesNaviProps> = ({ chats, selectedChat, setSelectedChat, handleDeleteChat , chatNames}) => {

  
  return (
    <div className="messages-panel">
      <ul className="ChatList">
        {chats
          .slice()
          .sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
            const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
            return dateB - dateA; // Sort in descending order
          })
          .map((chat) => (
            <li
              key={chat.id}
              className={`ChatListItem ${selectedChat?.id === chat.id ? 'active' : ''}`}
            >
              <span onClick={() => setSelectedChat(chat)}>
                {chatNames[chat.id] || "Loading..."}
              </span>
              <button className="DeleteButton" onClick={() => handleDeleteChat(chat.id)}>
                X
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default MessagesNavi;

