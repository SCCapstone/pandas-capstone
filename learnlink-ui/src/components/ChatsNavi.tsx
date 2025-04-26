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
  const [lastOpenedTimes, setLastOpenedTimes] = useState<{[chatId: number]: { [userId: number]: string };}>({});
  const [hasStudyGroup, setHasStudyGroup] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => () => {});
  const [confirmMessage, setConfirmMessage] = useState('');
  

  /********** USE EFFECTS **********/

  // Sort chats by most recent update when chats change
  // Sorts the list of chats in descending order based on updatedAt or createdAt whenever the chats array changes.
  useEffect(() => {
    // Create a shallow copy of chats and sort them by the most recent timestamp
    const sorted = [...chats].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA; // Most recently updated chat at the top
    });
    // Update the state with the sorted list
    setSortedChats(sorted);
  }, [chats]);

  // Automatically handles the selected chat (if any) when the component first mounts.
  useEffect(() => {
    // If there is a selected chat on initial render, trigger its click handler
    if (selectedChat) {
      handleChatClick(selectedChat);
    }
  }, []);

  // Fetches the last time each chat was opened by the current user and stores it in state.
  useEffect(() => {
    const fetchLastOpened = async () => {
      if (!currentUserId) return;
      try {
        const response = await axios.get(`${REACT_APP_API_URL}/api/chats/lastOpened/${currentUserId}`);
        // Format the API response into a nested object: { [chatId]: { [userId]: timestamp } }
        const formattedData = response.data.data.reduce(
          (acc: { [chatId: number]: { [userId: number]: string } }, entry: any) => {
            const { chatId, userId, timestamp } = entry;
            if (!acc[chatId]) acc[chatId] = {};
            acc[chatId][userId] = timestamp;
            return acc;
          },
          {}
        );
        // Save to state
        setLastOpenedTimes(formattedData);
      } catch (error) {
        console.error('Error fetching lastOpened times:', error);
      }
    };

    // Trigger the fetch when the current user ID changes
    fetchLastOpened();
  }, [currentUserId]); // Only fetch when currentUserId changes
  


  /********* FUNCTIONS *********/




  // Checks whether a given chat is associated with a study group by calling the API.
  const checkStudyGroup = async (chatId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${REACT_APP_API_URL}/api/study-groups/chat/${chatId}`);
      const data = await response.json();
      // Return true if the response is OK and contains a valid study group ID
      return response.ok && !!data.studyGroupID;
    } catch (error) {
      console.error("Error checking study group:", error);
      return false;
    }
  };

  // Fetches the study group ID associated with a specific chat, if one exists.
  const getStudyGroupIdFromChatId = async (chatId: number): Promise<number | null> => {
    try {
      const response = await axios.get(`${REACT_APP_API_URL}/api/study-groups/chat/${chatId}`);
      // Return the ID if present, otherwise return null
      if (response.data && response.data.studyGroupID) {
        return response.data.studyGroupID;
      }
      return null;
    } catch (error) {
      console.error("Error fetching study group ID from chat ID:", error);
      return null;
    }
  };
  
  
  // Handles selecting a chat and updates the lastOpened time for the current user both locally and in the backend.
  const handleChatClick = async (chat: Chat) => {
    // Set the selected chat in state
    setSelectedChat(chat);
    const currentUser = currentUserId;
    const lastOpenedTimestamp = new Date().toISOString();
    
    // Optimistically update local state with the current timestamp
    setLastOpenedTimes((prev) => ({
      ...prev,
      [chat.id]: { ...prev[chat.id], [currentUser]: lastOpenedTimestamp },
    }));
  
    // Send the timestamp to the backend
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


  // Determines whether a chat should be visually highlighted (e.g., to indicate new activity since it was last opened).
  const shouldHighlightChat = (chat: Chat) => {
    // Don't highlight if the last update was made by the current user
    if (chat.lastUpdatedById === currentUserId) return false;
  
    // Retrieve timestamps
    const lastOpenedTimestamp = lastOpenedTimes[chat.id]?.[currentUserId];
    const chatUpdatedAt = new Date(chat.updatedAt || chat.createdAt).getTime();
    const lastOpenedAt = lastOpenedTimestamp ? new Date(lastOpenedTimestamp).getTime() : 0;
  
    // Don't highlight the chat if it is currently open
    if (selectedChat?.id === chat.id) return false;
  
    // Highlight if the chat was updated after the user last opened it
    return chatUpdatedAt > lastOpenedAt;
  };
  
  
  return (
    <div className="messages-panel">
      {/* List of chats */}
      {loadingChatList ? (
        <div className="loading-container">
          Loading... <span className="loading-spinner" data-testid="loading-spinner"></span>
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
                data-testid={`delete-chat-${chat.id}`}
                onClick={async(e) => {
                  e.stopPropagation();

                  const isStudyGroup = await checkStudyGroup(chat.id);
                  const groupId = await getStudyGroupIdFromChatId(chat.id);
                  console.log("IS GROUP::", isStudyGroup);

                  if (isStudyGroup) {
                    setConfirmMessage('Are you sure you want to leave this study group?');
                    setConfirmAction(() => () => {
                      removeUser(currentUserId, groupId);
                      setShowConfirmPopup(false);
                      updateChats(chat.id);
                    });
                  } else if (!isStudyGroup) {
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
          datatestid="confirm-popup"
        />
      )}
    </div>
  );
};
export const checkStudyGroup = async (chatId: number): Promise<boolean> => {
  try {
    const response = await fetch(`${REACT_APP_API_URL}/api/study-groups/chat/${chatId}`);
    const data = await response.json();
    return response.ok && !!data.studyGroupID;
  } catch (error) {
    console.error("Error checking study group:", error);
    return false;
  }
};

export default ChatsNavi;

