


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
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(chats[0]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]); // Store users
  const [searchTerm, setSearchTerm] = useState<string>(''); // Store search term
  const [showDropdown, setShowDropdown] = useState<boolean>(false); // Control dropdown visibility
  const [messages, setMessages] = useState([]); // Initialize as an empty array


  useEffect(() => {
    // Fetch users when the component mounts
    axios.get('http://localhost:2020/api/users')  // Replace with your backend URL
      .then(response => {
        setUsers(response.data);  // Update state with the fetched users
      })
      .catch(error => {
        console.error('Error fetching users:', error);  // Handle error
      });
    axios.get('http://localhost:2020/api/chats')  // Replace with your backend URL
      .then(response => {
        setChats(response.data);  // Update state with the fetched users
      })
      .catch(error => {
        console.error('Error fetching chats:', error);  // Handle error
    });


  }, []); 

  
  //TODO add websockets/socket.io to this to provide for constant updates

  const handleSendMessage = async () => {
    if (currentMessage.trim() && selectedChat) {
      try {
        const response = await axios.post(
          `/api/chats/${selectedChat.id}/messages`,
          { content: currentMessage.trim() },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`, // Ensure the user is authenticated
            },
          }
        );
  
        // Append the new message to the selected chat
        const newMessage = response.data;
        const updatedChats = chats.map((chat) =>
          chat.id === selectedChat.id
            ? { ...chat, messages: [...chat.messages, newMessage.content] }
            : chat
        );
        setChats(updatedChats);
        setCurrentMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };
  
  const handleDeleteChat = async (chatId:number) => {
    try {
        // Ensure there's a token for authentication
        const token = localStorage.getItem('token'); // Replace with your auth storage mechanism if different
        if (!token) {
            alert('You need to be logged in to delete a chat.');
            return;
        }

        // Make DELETE request to the API
        const response = await axios.delete(`http://localhost:2020/api/chats/${chatId}`, {
            headers: {
                Authorization: `Bearer ${token}`, // Pass the token for authentication
            },
        });

        // Check if the response indicates success
        if (response.status === 200) {
            console.log('Chat deleted successfully:', response.data);
            alert('Chat deleted successfully.');
            // Optionally update the UI (e.g., remove the chat from the list)
        } else {
            console.warn('Unexpected response:', response);
            alert('Unexpected issue deleting the chat.');
        }
    } catch (error) {
        // Handle errors more robustly
        if (axios.isAxiosError(error)) {
            if (error.response) {
                const { status, data } = error.response;

                // Specific error cases
                if (status === 403) {
                    alert('You do not have permission to delete this chat.');
                } else if (status === 404) {
                    alert('Chat not found. It might have already been deleted.');
                } else if (status === 400) {
                    alert('Bad request. Please check the chat ID and try again.');
                } else {
                    alert(`Error: ${data.message || 'Something went wrong'}`);
                }
            } else {
                // Error does not have a response object
                console.error('Network or configuration error:', error.message);
                alert('Unable to connect to the server. Please check your network or server configuration.');
            }
        } else {
            // Handle non-Axios errors
            console.error('Unexpected error:', error);
            alert('An unexpected error occurred. Please try again.');
        }
    }
};



  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };


  const createNewChat = async (user: User) => {
    try {
      // Prepare the request payload
      const payload = {
        name: `${user.firstName} ${user.lastName}`,
        userId: user.id, // Assuming user object contains an id property
      };
  
      // Check for duplicates before making the API call
      const isDuplicateChat = chats.some(chat => chat.name === payload.name);
        if (isDuplicateChat) {
          alert('A chat with this user already exists.');
          return; // Exit the function early if the chat already exists
      }
      // Make API call to create the new chat
      const response = await axios.post('http://localhost:2020/api/chats', payload);
  
      // Extract the created chat from the response
      const newChat = response.data;
  
      // Update state with the new chat
      setChats((prevChats) => [...prevChats, newChat]);
      setSelectedChat(newChat);
      setShowDropdown(false); // Hide dropdown after selecting a user
    } catch (error) {
      console.error('Error creating new chat:', error);
      alert('Failed to create chat. Please try again.');
    }
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
          {Array.isArray(chats) &&
            chats.map((chat) => (
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




