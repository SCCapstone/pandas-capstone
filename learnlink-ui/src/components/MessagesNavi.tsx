import './JoinRequests.css';
import '../pages/messaging.css';
import './components.css';
import React from 'react';


// Represents a chat conversation, including messages, users, and timestamps
interface Chat {
  id: number;
  name: string;        // Chat name (could be a group name or user name)
  messages: Message[]; // List of messages in the chat
  users: User[];       // List of users in the chat
  createdAt: string;   // Timestamp of when the chat was created
  updatedAt: string;   // Timestamp of the last update in the chat
}

// Represents an individual message within a chat
interface Message {
  id: number;
  content: string;    // The text content of the message
  createdAt: string;  // Timestamp of when the message was sent
  userId: number;     // ID of the user who sent the message
  chatId: number;     // ID of the chat the message belongs to
  liked: boolean;     // Indicates whether the message has been liked
}

// Represents a user participating in a chat
interface User {
  id: number;
  username: string;   // User's unique username
  firstName: string;  // User's first name
  lastName: string;   // User's last name
}

// Props interface defining expected properties for the MessagesNavi component
interface MessagesNaviProps {
  chats: Chat[];                        // List of available chats
  selectedChat: Chat | null;            // Currently selected chat
  setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>; // Function to set the selected chat
  handleDeleteChat: (id: number) => void; // Function to delete a chat
  chatNames: { [key: number]: string };  // Mapping of chat IDs to display names
}

// MessagesNavi component handles displaying a list of chats and allows selecting or deleting them
const MessagesNavi: React.FC<MessagesNaviProps> = ({ chats, selectedChat, setSelectedChat, handleDeleteChat, chatNames }) => {
  return (
    <div className="messages-panel">
      {/* List of chats */}
      <ul className="ChatList">
        {chats
          .slice()
          .sort((a, b) => {
            // Sorting chats by most recent activity (updatedAt or createdAt)
            const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
            const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
            return dateB - dateA; // Sorting in descending order (newest first)
          })
          .map((chat) => (
            <li
              key={chat.id}
              className={`ChatListItem ${selectedChat?.id === chat.id ? 'active' : ''}`} // Highlight selected chat
            >
              {/* Clicking the chat name selects it */}
              <span onClick={() => setSelectedChat(chat)}>
                {chatNames[chat.id] || "Loading..."} {/* Display chat name or "Loading..." as a fallback */}
              </span>
              {/* Button to delete the chat */}
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
