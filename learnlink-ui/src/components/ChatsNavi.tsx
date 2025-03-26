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
    fetchLastOpened();
  }, [currentUserId]);

  const fetchLastOpened = async () => {
    try {
      if (currentUserId) {
        const response = await axios.get(
          `${REACT_APP_API_URL}/api/chats/lastOpened/${currentUserId}`
        );
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
      }
    } catch (error) {
      console.error('Error fetching lastOpened times:', error);
    }
  };

  

  const handleChatClick = async (chat: Chat) => {
    setSelectedChat(chat);
    const currentUser = currentUserId;
    const lastOpenedTimestamp = new Date().toISOString();

    // Optimistically update UI
    setLastOpenedTimes((prev) => ({
      ...prev,
      [chat.id]: {
        ...prev[chat.id],
        [currentUser]: lastOpenedTimestamp,
      },
    }));

    // Update the time every 5 seconds while chat is selected
    const intervalId = setInterval(async () => {
      try {
        const timestamp = new Date().toISOString(); // Update timestamp every interval
        await axios.post(`${REACT_APP_API_URL}/api/chats/updateLastOpened`, {
          chatId: chat.id,
          userId: currentUser,
          lastOpened: timestamp,
        });
      } catch (error) {
        console.error('Error updating lastOpened:', error);
      }
    }, 1000); // 1000 ms = 1 seconds

    // Clean up interval when the chat is deselected or component unmounts
    return () => clearInterval(intervalId);
  };
  

  // Determine if the chat name should be highlighted based on the comparison of lastOpened and updatedAt times
  const shouldHighlightChat = (chat: Chat) => {
    fetchLastOpened();
    handleChatClick(chat);
    const lastOpenedTimestamp = lastOpenedTimes[chat.id]?.[currentUserId];
    const chatUpdatedAt = new Date(chat.updatedAt).getTime();
    const lastOpenedAt = lastOpenedTimestamp ? new Date(lastOpenedTimestamp).getTime() : 0;

    // Prevent highlighting if the current user is already in the chat and their own update triggered the updatedAt time
    // Don't highlight the chat if it's the selected chat already
    if (selectedChat?.id === chat.id) {

      return false;
      
    }

    
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
