


import React, { useState, useEffect } from 'react';
import './messaging.css'
import Navbar from '../components/Navbar';
import CopyrightFooter from '../components/CopyrightFooter';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 

interface Chat {
  id: number;
  name: string;
  messages: string[];
}

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
}

const Messaging: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([
    { id: 1, name: 'Alice', messages: ['Hi there!'] },
    { id: 2, name: 'Bob', messages: ['Hello!'] },
  ]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(chats[0]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]); // Store users
  const [searchTerm, setSearchTerm] = useState<string>(''); // Store search term
  const [showDropdown, setShowDropdown] = useState<boolean>(false); // Control dropdown visibility


  useEffect(() => {
    // Fetch users when the component mounts
    axios.get('http://localhost:2020/api/users')  // Replace with your backend URL
      .then(response => {
        setUsers(response.data);  // Update state with the fetched users
      })
      .catch(error => {
        console.error('Error fetching users:', error);  // Handle error
      });
  }, []); 

  const handleSendMessage = () => {
    if (currentMessage.trim() && selectedChat) {
      const updatedChats = chats.map((chat) =>
        chat.id === selectedChat.id
          ? { ...chat, messages: [...chat.messages, currentMessage.trim()] }
          : chat
      );
      setChats(updatedChats);
      setCurrentMessage('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const createNewChat = (user: User) => {
    const newChat = {
      id: chats.length + 1,
      name: `${user.firstName} ${user.lastName}`,
      messages: [],
    };
    setChats([...chats, newChat]);
    setSelectedChat(newChat);
    setShowDropdown(false);  // Hide dropdown after selecting a user
  };

  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="Messaging">
      <Navbar />
      <div className="Chat">
        <div className="ChatOptions">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="NewChatButton"
          >
            + New Chat
          </button>
          {showDropdown && (
            <div className="Dropdown">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <ul className="UserList">
                {filteredUsers.map(user => (
                  <li
                    key={user.id}
                    className="UserItem"
                    onClick={() => createNewChat(user)}
                  >
                    {user.firstName} {user.lastName}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <ul className="ChatList">
            {chats.map((chat) => (
              <li
                key={chat.id}
                className={`ChatListItem ${selectedChat?.id === chat.id ? 'active' : ''}`}
                onClick={() => setSelectedChat(chat)}
              >
                {chat.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="ChatSection">
          {selectedChat ? (
            <>
              <h2 className="ChatHeader">{selectedChat.name}</h2>
              <div className="ChatWindow">
                {selectedChat.messages.map((message, index) => (
                  <div key={index} className="MessageBubble">
                    {message}
                  </div>
                ))}
              </div>
              <div className="ChatInput">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button onClick={handleSendMessage}>Send</button>
              </div>
            </>
          ) : (
            <div className="NoChatSelected">Select a chat to start messaging</div>
          )}
        </div>
      </div>
      <footer>
        <CopyrightFooter />
      </footer>
    </div>
  );
};

export default Messaging;




