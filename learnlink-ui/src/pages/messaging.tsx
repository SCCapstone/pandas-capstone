import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './messaging.css';
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

// Connect to the Socket.IO server
const socket = io('http://localhost:2020'); // Replace with your server URL

const Messaging: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]); // Store users
  const [searchTerm, setSearchTerm] = useState<string>(''); // Store search term
  const [showDropdown, setShowDropdown] = useState<boolean>(false); // Control dropdown visibility

  useEffect(() => {
    // Fetch users and chats from the API when the component mounts
    axios.get('http://localhost:2020/api/users')
      .then((response) => setUsers(response.data))
      .catch((error) => console.error('Error fetching users:', error));


    //TODO make this the endpoint for chats/userid
    axios.get(`http://localhost:2020/api/chats`)
      .then((response) => setChats(response.data))
      .catch((error) => console.error('Error fetching chats:', error));

    // Listen for real-time updates on new messages
    socket.on('message', (message) => {
      if (selectedChat) {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === selectedChat.id
              ? { ...chat, messages: [...chat.messages, message] }
              : chat
          )
        );
      }
    });

    return () => {
      socket.off('message');
    };
  }, [selectedChat]);

  const handleSendMessage = async () => {
    if (currentMessage.trim() && selectedChat) {
      try {
        // Emit the message via Socket.IO
        socket.emit('message', { chatId: selectedChat.id, content: currentMessage.trim() });

        // Update the chat's messages in state
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === selectedChat.id
              ? { ...chat, messages: [...chat.messages, currentMessage.trim()] }
              : chat
          )
        );
        setCurrentMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };
  const createNewChat = async (user: User) => {
    try {
      const payload = {
        recipientUserId: user.id, // Use the correct key
        chatName: `${user.firstName} ${user.lastName}`, // Optional, used as default if provided
      };
  
      // Check for duplicate chats
      const isDuplicateChat = chats.some((chat) => chat.name === payload.chatName);
      if (isDuplicateChat) {
        alert('A chat with this user already exists.');
        return;
      }
      
      const token = localStorage.getItem('token');

  
      if (!token) {
        console.error('Token is missing. User might not be authenticated.');
        alert('Please log in again.');
        return;
      }
      console.log(token);
      
      const response = await axios.post(`http://localhost:2020/api/chats/${user.id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token
        },
      });
      
      

      //console.log('Authorization Token:', localStorage.getItem('token'));
  
      const newChat = response.data;
  
      // Update state with the new chat
      setChats((prevChats) => [...prevChats, newChat]);
      setSelectedChat(newChat);
      setShowDropdown(false); // Hide dropdown
    } catch (error) {
      console.error('Error creating new chat:', error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`Error: ${error.response.status} - ${error.response.data.error}`);
      } else {
        alert('An unexpected error occurred.');
      }
    }
  };
  

  const handleDeleteChat = async (chatId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to be logged in to delete a chat.');
        return;
      }

      await axios.delete(`http://localhost:2020/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
      if (selectedChat?.id === chatId) {
        setSelectedChat(null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const filteredUsers = users.filter((user) =>
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
                
                {filteredUsers.map((user) => (
                  <li
                    key={user.id}
                    className="UserItem"
                    onClick={() => { 
                      createNewChat(user); 
                      setSearchTerm(''); // Clear search term after selecting
                    }}
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
              >
                <span onClick={() => setSelectedChat(chat)}>{chat.name}</span>
                <button
                  className="DeleteButton"
                  onClick={() => handleDeleteChat(chat.id)}
                >
                  X
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="ChatSection">
          {selectedChat ? (
            <>
              <h2 className="ChatHeader">{selectedChat.name}</h2>
              <div className="ChatWindow">
              {selectedChat?.messages?.map((message, index) => (
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
