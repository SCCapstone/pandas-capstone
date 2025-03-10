import './JoinRequests.css';
import '../pages/messaging.css';
import './components.css';
import React, { useEffect, useState } from 'react';
import { FaXmark } from "react-icons/fa6";

// Represents a chat conversation, including messages, users, and timestamps
interface Chat {
  id: number;
  name: string;        
  messages: Message[]; 
  users: User[];       
  createdAt: string;   
  updatedAt: string;   
}

// Represents an individual message within a chat
interface Message {
  id: number;
  content: string;    
  createdAt: string;  
  userId: number;     
  chatId: number;     
  liked: boolean;  
  system: boolean;   
}

// Represents a user participating in a chat
interface User {
  id: number;
  username: string;  
  firstName: string; 
  lastName: string;  
}

// Props interface defining expected properties for the ChatsNavi component
interface ChatsNaviProps {
  chats: Chat[];                       
  selectedChat: Chat | null;           
  setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>; 
  handleDeleteChat: (id: number) => void; 
  chatNames: { [key: number]: string };
  loadingChatList: boolean;
}

// ChatsNavi component handles displaying a list of chats and allows selecting or deleting them
const ChatsNavi: React.FC<ChatsNaviProps> = ({ chats, selectedChat, setSelectedChat, handleDeleteChat, chatNames,loadingChatList }) => {
  const [sortedChats, setSortedChats] = useState<Chat[]>([]);

  // Sort chats by most recent update when chats change
  useEffect(() => {
    const sorted = [...chats].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA; // Most recently updated chat at the top
    });
    setSortedChats(sorted);
  }, [chats]); // Runs every time `chats` changes

  return (
    <div className="messages-panel">
      {/* List of chats */}
      {loadingChatList ? (
        <div className="loading-container">
          Loading... <span className="loading-spinner"></span>
        </div>
      ) : (
        <ul className="ChatList">

          {sortedChats.map((chat) => (
            <li
              key={chat.id}
              className={`ChatListItem ${selectedChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => setSelectedChat(chat)}
            >
              {/* Clicking the chat name selects it */}
              <span>
                {chatNames[chat.id] || "Loading..."}
              </span>
              {/* Button to delete the chat */}
              <button className="DeleteButton" onClick={() => handleDeleteChat(chat.id)}>
                <FaXmark />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatsNavi;
