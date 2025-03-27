import './JoinRequests.css';
import '../pages/messaging.css';
import './components.css';
import React, { useEffect, useState } from 'react';
import { FaXmark } from "react-icons/fa6";
import axios from 'axios';

// Represents a chat conversation, including messages, users, and timestamps
interface Chat {
  id: number;
  name: string;
  messages: Message[];
  users: User[];
  createdAt: string;
  updatedAt: string;
  lastOpened: { [userId: number]: string };
}

// Represents an individual message within a chat
interface Message {
  id: number;
  content: string;
  createdAt: string;
  userId: number | undefined;
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
  currentUserId: number;
  handleDeleteChat: (id: number) => void;
  chatNames: { [key: number]: string };
  loadingChatList: boolean;
}

const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

const ChatsNavi: React.FC<ChatsNaviProps> = ({
  chats,
  selectedChat,
  setSelectedChat,
  currentUserId,
  handleDeleteChat,
  chatNames,
  loadingChatList,
}) => {
  const [sortedChats, setSortedChats] = useState<Chat[]>([]);
  const [lastOpenedTimes, setLastOpenedTimes] = useState<{
    [chatId: number]: { [userId: number]: string };
  }>({});

  // Sort chats by most recent update when chats change
  useEffect(() => {
    const sorted = [...chats].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA; // Most recently updated chat at the top
    });

    setSortedChats(sorted);
  }, [chats]);

  
  useEffect(() => {
    const fetchLastOpened = async () => {
      if (!currentUserId) return;
      try {
        const response = await axios.get(`${REACT_APP_API_URL}/api/chats/lastOpened/${currentUserId}`);
        const formattedData = response.data.data.reduce(
          (acc: { [chatId: number]: { [userId: number]: string } }, entry: any) => {
            const { chatId, userId, timestamp } = entry;
            if (!acc[chatId]) acc[chatId] = {};
            acc[chatId][userId] = timestamp;
            return acc;
          },
          {}
        );
        setLastOpenedTimes(formattedData);
      } catch (error) {
        console.error('Error fetching lastOpened times:', error);
      }
    };
  
    fetchLastOpened();
  }, [currentUserId]); // Only fetch when currentUserId changes
  
  const handleChatClick = async (chat: Chat) => {
    setSelectedChat(chat);
    const currentUser = currentUserId;
    const lastOpenedTimestamp = new Date().toISOString();
  
    // Optimistically update UI
    setLastOpenedTimes((prev) => ({
      ...prev,
      [chat.id]: { ...prev[chat.id], [currentUser]: lastOpenedTimestamp },
    }));
  
    try {
      await axios.post(`${REACT_APP_API_URL}/api/chats/updateLastOpened`, {
        chatId: chat.id,
        userId: currentUser,
        lastOpened: lastOpenedTimestamp,
      });
    } catch (error) {
      console.error('Error updating lastOpened:', error);
    }
  };
  
  const shouldHighlightChat = (chat: Chat) => {
    const lastOpenedTimestamp = lastOpenedTimes[chat.id]?.[currentUserId];
    const chatUpdatedAt = new Date(chat.updatedAt).getTime();
    const lastOpenedAt = lastOpenedTimestamp ? new Date(lastOpenedTimestamp).getTime() : 0;
  
    if (selectedChat?.id === chat.id) return false;
    return chatUpdatedAt > lastOpenedAt;
  };
  
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
              onClick={() => handleChatClick(chat)}
            >
              <span>
                <span
                  className={`chat-name ${shouldHighlightChat(chat) ? 'highlighted' : ''}`}
                >
                  {chatNames[chat.id] || 'Loading...'}
                </span>
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
