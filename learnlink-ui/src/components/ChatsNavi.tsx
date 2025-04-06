import './JoinRequests.css';
import '../pages/messaging.css';
import './components.css';
import ConfirmPopup from './ConfirmPopup';
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
  lastUpdatedById: number|null;
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
  isButton: boolean;
  buttonData?: Button;
}
interface Button {
  id: number;
  label: string;
  action: string;
  studyGroupId?: number | null;
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
  chatPfps: { [key: number]: string };
  loadingChatList: boolean;
  removeUser: (userId: number, groupId: number | null) => Promise<void>;
  updateChats: (chatId: number) => void;
}

const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

const ChatsNavi: React.FC<ChatsNaviProps> = ({
  chats,
  selectedChat,
  setSelectedChat,
  currentUserId,
  handleDeleteChat,
  chatNames,
  chatPfps,
  loadingChatList,
  removeUser,
  updateChats,
}) => {
  const [sortedChats, setSortedChats] = useState<Chat[]>([]);
  const [lastOpenedTimes, setLastOpenedTimes] = useState<{
    [chatId: number]: { [userId: number]: string };
  }>({});
  const [hasStudyGroup, setHasStudyGroup] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => () => {});
  const [confirmMessage, setConfirmMessage] = useState('');


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
    if (selectedChat) {
      handleChatClick(selectedChat);
    }
  }, []);

  
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
  
  const checkStudyGroup = async (chatId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${REACT_APP_API_URL}/api/study-groups/chat/${chatId}`);
      const data = await response.json();
  
      return response.ok && !!data.studyGroupID;
    } catch (error) {
      console.error("Error checking study group:", error);
      return false;
    }
  };

  const getStudyGroupIdFromChatId = async (chatId: number): Promise<number | null> => {
    try {
      const response = await axios.get(`${REACT_APP_API_URL}/api/study-groups/chat/${chatId}`);
      if (response.data && response.data.studyGroupID) {
        return response.data.studyGroupID;
      }
      return null;
    } catch (error) {
      console.error("Error fetching study group ID from chat ID:", error);
      return null;
    }
  };
  
  

  const handleChatClick = async (chat: Chat) => {
    setSelectedChat(chat);
    const currentUser = currentUserId;
    const lastOpenedTimestamp = new Date().toISOString();
  
    // Optimistically update UI before the request
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
    if (chat.lastUpdatedById === currentUserId) return false; // Ignore updates made by the current user
  
    const lastOpenedTimestamp = lastOpenedTimes[chat.id]?.[currentUserId];
    const chatUpdatedAt = new Date(chat.updatedAt || chat.createdAt).getTime();
    const lastOpenedAt = lastOpenedTimestamp ? new Date(lastOpenedTimestamp).getTime() : 0;
  
    // Don't highlight the chat if the user was just in it
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
              <div className='chat-list-name-pfp'>
                <img src={chatPfps[chat.id]} height ={'40px'}></img>

              <span>
                
                <span
                  className={`chat-name ${shouldHighlightChat(chat) ? 'highlighted' : ''}`}
                >
                  {chatNames[chat.id] || 'Loading...'}
                </span>
              </span>
              </div>
              
              {/* Button to delete the chat */}
              <button
                className="DeleteButton"
                onClick={async(e) => {
                  e.stopPropagation();

                  const isStudyGroup = await checkStudyGroup(chat.id);
                  const groupId = await getStudyGroupIdFromChatId(chat.id);

                  if (isStudyGroup) {
                    setConfirmMessage('Are you sure you want to leave this study group?');
                    setConfirmAction(() => () => {
                      removeUser(currentUserId, groupId);
                      setShowConfirmPopup(false);
                      updateChats(chat.id);
                    });
                  } else {
                    setConfirmMessage('Are you sure you want to delete this chat?');
                    setConfirmAction(() => () => {
                      handleDeleteChat(chat.id);
                      setShowConfirmPopup(false);
                    });
                  }

                  setShowConfirmPopup(true);
                }}
              >
                <FaXmark />
              </button>

            </li>
          ))}
        </ul>
      )}
      {showConfirmPopup && (
        <ConfirmPopup
          message={confirmMessage}
          onConfirm={() => confirmAction()}
          onCancel={() => setShowConfirmPopup(false)}
        />
      )}
    </div>
  );
};

export default ChatsNavi;
