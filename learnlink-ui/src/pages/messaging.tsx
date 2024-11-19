


import React, { useState } from 'react';
import './messaging.css'
import Navbar from '../components/Navbar';
import CopyrightFooter from '../components/CopyrightFooter';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';

interface Chat {
  id: number;
  name: string;
  messages: string[];
}

const Messaging: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([
    { id: 1, name: 'Alice', messages: ['Hi there!'] },
    { id: 2, name: 'Bob', messages: ['Hello!'] },
  ]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(chats[0]);
  const [currentMessage, setCurrentMessage] = useState<string>('');

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

  const createNewChat = () => {
    const newChat = {
      id: chats.length + 1,
      name: `New Chat ${chats.length + 1}`,
      messages: [],
    };
    setChats([...chats, newChat]);
    setSelectedChat(newChat);
  };

  return (
    <div className="Messaging">
      <Navbar />

      
      <div className = "Chat">

      <div className = "ChatOptions">
      <button onClick={createNewChat} className="NewChatButton">
            + New Chat
          </button>
          <ul className="ChatList">
            {chats.map((chat) => (
              <li
                key={chat.id}
                className={`ChatListItem ${
                  selectedChat?.id === chat.id ? 'active' : ''
                }`}
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
      <CopyrightFooter />
    </div>
  );
};

export default Messaging;



