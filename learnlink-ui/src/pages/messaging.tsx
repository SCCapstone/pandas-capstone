import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './messaging.css';
import Navbar from '../components/Navbar';
import CopyrightFooter from '../components/CopyrightFooter';
import './LandingPage.css';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import EditStudyGroup from '../components/EditStudyGroup';
import MessagesNavi from "../components/MessagesNavi";
import JoinRequests from '../components/JoinRequests';


interface Chat {
  id: number;
  name: string;
  messages: Message[];
  users: User[]; 
  createdAt: string;
  updatedAt: string;
}

interface Message{
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  chatId: number;
  liked: boolean;
  
}
interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
}


const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';


const socket = io(REACT_APP_API_URL, {
  transports: ["websocket"], // Ensure WebSocket is explicitly used
  reconnectionAttempts: 3,  // Retry if connection fails
  timeout: 10000 // 10 seconds timeout
});


//TODO next sem -- updatedAt so when a chat is sent have it move to the top -- im not messing with the code that works rn tho
const Messaging: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]); // Store users
  const [searchTerm, setSearchTerm] = useState<string>(''); // Store search term
  const [showDropdown, setShowDropdown] = useState<boolean>(false); // Control dropdown visibility
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [customChatName, setCustomChatName] = useState<string>(''); // Track custom chat name
  const [showGroupNameInput, setShowGroupNameInput] = useState<boolean>(false);
  //const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatWindowRef = React.useRef<HTMLDivElement | null>(null);
  const [hasStudyGroup, setHasStudyGroup] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(false);  // To control panel visibility
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // Track selected user
  const [searchParams] = useSearchParams();
  const selectedUserId = searchParams.get('user'); // Get the matched user ID
  const [heartedMessages, setHeartedMessages] = useState<{ [key: number]: boolean }>({});
  const [messages, setMessages] = useState(selectedChat?.messages || []);
  const [studyGroupNames, setStudyGroupNames] = useState<{ [key: number]: string }>({});
  const [chatName, setChatName] = useState("");
  const [chatNames, setChatNames] = useState<{ [key: number]: string }>({});
  //for matching stuff
  const [showMessagesPanel, setShowMessagesPanel] = useState(false);
  const [showRequestsPanel, setShowRequestsPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'messages' | 'requests'>('messages');
  
  
  useEffect(() => {
    if (selectedUserId) {

      const matchedUser = users.find(user => user.id === Number(selectedUserId)); // Convert to number
      if (matchedUser) {
        setSelectedUser(matchedUser);
        console.log(matchedUser);
        setShowGroupNameInput(true);
      }
    }
  }, [selectedUserId, users]);

  useEffect(() => {
    if (selectedChat) {
      checkStudyGroup();
    }
  }, [selectedChat]);  

  useEffect(() => {

    handleMessagesSwitch();
    // Fetch users and chats from the API when the component mounts
    axios.get(`${REACT_APP_API_URL}/api/users`)
      .then((response) => setUsers(response.data))
      .catch((error) => console.error('Error fetching users:', error));

    //console.log("current user id:", currentUserId);
    // Make the API request to fetch chats for the user
  
    const token = localStorage.getItem('token');
    console.log(token);
    axios.get(`${REACT_APP_API_URL}/api/chats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        const chatsWithMessages = response.data.map((chat: Chat) => ({
          ...chat,
          messages: chat.messages || [], // Ensure messages is always an array
          users: chat.users || [] // Ensure users is always an array
        }));


        setChats(chatsWithMessages);


        // Ensure we store liked messages correctly
        const likedMessagesMap = response.data.reduce((acc: Record<number, boolean>, chat: Chat) => {
          chat.messages?.forEach((msg: Message) => {
            acc[msg.id] = msg.liked ?? false; // Default to false if missing
          });
          return acc;
        }, {});

        setHeartedMessages(likedMessagesMap); // Store liked states
      })
      .catch((error) => console.error('Error fetching chats:', error));
    

    if (token) {
      axios.get(`${REACT_APP_API_URL}/api/currentUser`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => setCurrentUserId(response.data.id))
        .catch((error) => console.error('Error fetching current user:', error));
    }
    
  }, [isPanelVisible]);

  
  
  //used for sending messages
  useEffect(() => {
    //console.log("helloooooooooo");
    
    socket.on('connect', () => {
      console.log('Connected to server');
    });
    
   

    
    socket.on('newMessage', (message) => {
      console.log('New message received!!!:', message);
      //console.log('Received message:', JSON.stringify(message, null, 2));

      
      
      setChats((prevChats) => {
        const updatedChats = prevChats.map((chat) =>
          chat.id === message.chatId
            ? { ...chat, messages: [...(chat.messages || []), message] }
            : chat
        );
        //console.log('Updated Chats:', updatedChats);
        return updatedChats;
      });
      
      
      //console.log('Incoming Message Chat ID:', message.chatId);
      //console.log('Existing Chat IDs:', chats.map((chat) => chat.id));


      //console.log('Selected Chat:', selectedChat);
     // console.log('Messages:', selectedChat?.messages);
     
      // Automatically scroll if the message belongs to the selected chat
      if (selectedChat?.id === message.chatId && chatWindowRef.current) {
        setTimeout(() => {
          chatWindowRef.current?.scrollTo({
            top: chatWindowRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }, 100);
      }
        
    });
    
  
   
    
    return () => {
      socket.off('connect');
      socket.off('newMessage');
    };
  }, [selectedChat]); // Runs when messages update
  
  //used for chat names
  useEffect(() => {
    const fetchChatNames = async () => {
      const newChatNames: { [key: number]: string } = { ...chatNames };
  
      for (const chat of chats) {
        if (!newChatNames[chat.id]) { // Only fetch if not already in state
          newChatNames[chat.id] = await getChatName(chat);
        }
      }
  
      setChatNames(newChatNames);
    };
  
    fetchChatNames();
  }, [chats]); // Runs only when `chats` change



  const handleMessagesSwitch = () => {
    setActiveTab('messages');
    setShowRequestsPanel(false);
    setShowMessagesPanel(true);
  };
  
  const handleRequestsSwitch = () => {
    setActiveTab('requests');
    setShowMessagesPanel(false);
    setShowRequestsPanel(true);
  };

  const handleSendMessage = async () => {
    const token = localStorage.getItem('token');
    if (currentMessage.trim() && selectedChat) {
      try {
        const messageData: Message = {
          id: Date.now(), // Use a unique ID generator
          content: currentMessage.trim(),
          createdAt: new Date().toISOString(),
          userId: currentUserId || 0, // Add a fallback for currentUserId
          chatId: selectedChat.id,
          liked: false,
        };
  
        
        socket.emit(
          'message',
          { chatId: selectedChat.id, content: currentMessage, userId: currentUserId, token },
          (response: { success: boolean; message?: string; error?: string }) => {
            //console.log('Received response:', response);
            if (response.success) {
              console.log('Message sent from client successfully:', response.message);
            } else {
              console.log('Message send from client failed:', response.error);
            }
          }
        );
        setCurrentMessage('');
        
        
  
        // Update the selectedChat to include the new message
      setSelectedChat((prevSelectedChat) =>
        prevSelectedChat
          ? { ...prevSelectedChat, messages: [...(prevSelectedChat.messages || []), messageData] }
          : null
      );
  
        setCurrentMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };
  



  const createNewChat = async (user: User, chatName: string) => {
    try {
    
      // Check if a chat already exists with this user
      const existingChat = chats.find(chat => 
        chat.users?.some(u => u.id === user.id) // Safe check for undefined `users`
      );
  
      if (existingChat) {
        alert('A chat with this user already exists!');
        return; // Prevent creating a duplicate chat
      }
  
      const payload = {
        recipientUserId: user.id,
        chatName, // Use the custom chat name
      };
  
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in again.');
        return;
      }

      console.log('Creating new chat with:', user, 'and name:', chatName);
      console.log('Payload:', payload);
      console.log('userid',user.id);
  
      const response = await axios.post(
        `${REACT_APP_API_URL}/api/chats/${user.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('New chat created:', response.data);
  
      const newChat: Chat = {
        ...response.data,
        name: `${chatName} with ${user.firstName} ${user.lastName}`, // Format the name
        // ensure that users is SET
        // users: [user], // Add the selected user to the chat
      };
      setChats((prevChats) => [...prevChats, newChat]);
      setSelectedChat(newChat);
  
      // adding to study groups too eventually separate
  
      const studyGroupPayload = {
        chatId: newChat.id, // Use the created chat ID
        name: chatName, // Same name as the chat
        subject: '',
        description: '',
        users: [user.id, currentUserId], // Include both users in the study group
      };
  
      // const studyGroupResponse = await axios.post(
      //   'http://localhost:2020/api/study-groups',
      //   studyGroupPayload,
      //   { headers: { Authorization: `Bearer ${token}` }}
      // );
  
      // console.log('Study group created:', studyGroupResponse.data);
  
    } catch (error) {
      console.error('Error creating new chat and study group:', error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`Error: ${error.response.status} - ${error.response.data.error}`);
      } else {
        alert('An unexpected error occurred.');
      }
    }
  };
  
  
  const getChatName = async (chat: Chat) => {

    try {
      const response = await axios.get(`${REACT_APP_API_URL}/api/study-groups/chat/${chat.id}`);
      if (response.data.name) {
        setStudyGroupNames((prev) => ({ ...prev, [chat.id]: response.data.name }));
        return response.data.name;
      }
    } catch (error) {
      console.error("Error fetching study group name:", error);
    }
    
    if (currentUserId) {
      const otherUser = chat.users?.find((user) => user.id !== currentUserId);
      
      if (otherUser) {
        
          return `${otherUser.firstName} ${otherUser.lastName}`;
        
      }
    }

  
    return " ";
  };
  
  


  const handleDeleteChat = async (chatId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to be logged in to delete a chat.');
        return;
      }

      await axios.delete(`${REACT_APP_API_URL}/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
      if (selectedChat?.id === chatId) {
        setSelectedChat(null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Server responded with:', error.response.data);
      }
    }
  };

  const handleCreateStudyGroup = async (chatId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to be logged in to create a study group.');
        return;
      }

      // const updatedChatsResponse= axios.get(`${REACT_APP_API_URL}/api/chats`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // const updatedChats = (await updatedChatsResponse).data;
  
      // const chat = chats.find((chat: any) => chat.id === chatId);
      // if (!chat) {
      //   alert('Chat not found.');
      //   return;
      // }

      if (!selectedChat) {
        alert('No chat selected.');
        return;
      }

      console.log("Chat object:", selectedChat);

      const chatResponse = await axios.get(`${REACT_APP_API_URL}/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("mew Chat object:", chatResponse.data);


      const studyGroupPayload = {
        name: chatResponse.data.name,
        subject: '',
        description: '',
        users: chatResponse.data.users.map((user: User) => user.id),
        chatID: selectedChat.id,
      };

      console.log('Creating study group with payload:', studyGroupPayload);

      const response = await axios.post(
        `${REACT_APP_API_URL}/api/study-groups`,
        studyGroupPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let newStudyGroupID = response.data.studyGroup.id

      console.log('new study group ID', newStudyGroupID);

      const updateChatPayload = {
        chatName: '',
        studyGroupId: newStudyGroupID, // Pass only the study group ID
      };
  
      const chatUpdateResponse = await axios.put(
        `${REACT_APP_API_URL}/api/chats/${chatId}`,
        updateChatPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log( 'fetching details for chat:', chatId);
      console.log('Chat updated with study group ID:', chatUpdateResponse.data);

      if (!error) {
        setHasStudyGroup(true);
      }

    } catch (error) {
      console.error('Error creating study group:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Server responded with:', error.response.data);
      }
    }
  };


  const checkStudyGroup = async () => {
    console.log('Checking study group for chat:', selectedChat);
    if(!selectedChat) {
      return setHasStudyGroup(false);
    }
    try {
      const response = await fetch(`${REACT_APP_API_URL}/api/study-groups/chat/${selectedChat.id}`); // Fetching chat details by chat ID
      const data = await response.json();
      console.log('Study group check result:', data);
  
      // Check if studyGroupID is returned (i.e., chat is linked to a study group)
      if (response.ok && data.studyGroupID) {
        setHasStudyGroup(true); // There is a study group linked
        console.log('setStudyGroupCheck:', hasStudyGroup);
      } else {
        setHasStudyGroup(false); // No study group linked to this chat
      }
    } catch (error) {
      console.error("Error checking study group:", error);
      setHasStudyGroup(false); // Assume no study group if there's an error
    }
  };

  // Handle double click to like a message
  const handleDoubleClick = async (messageId: number) => {

    const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in again.');
        return;
      }

    try {
      const response = await fetch(`${REACT_APP_API_URL}/api/messages/${messageId}/like`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' , Authorization: `Bearer ${token}`},
        body: JSON.stringify({ liked: !heartedMessages[messageId] }), // Toggle liked
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error('Failed to update like status');
      }
  
      setHeartedMessages((prev) => ({
        ...prev,
        [messageId]: !prev[messageId], // Toggle heart UI
      }));
    } catch (error) {
      console.error('Error updating like status:', error);
    }
  };
  



  const addNewChat = (newChat: any) => {
    setChats((prevChats) => [...prevChats, newChat]);
  };

  const updateChatName = (chatId: number, newName: string) => {
    setChatNames((prevChatNames) => ({
      ...prevChatNames,
      [chatId]: newName,
    }));
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

        {/** greyed out because its old but i dont want to delete yet */}
        {/*
        <div className="ChatOptions">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="NewChatButton"
          >
            + New Group
          </button>
          {showDropdown && (
            <div className="Dropdown">
              <input className = "SearchBox"
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
                      setSelectedUser(user); // Store the selected user
                      setShowDropdown(false); // Hide the dropdown
                      setShowGroupNameInput(true); // Show the group name input
                      setSearchTerm(''); // Clear search term
                    }}
                  >
                    {user.firstName} {user.lastName}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          
          {showGroupNameInput && selectedUser && (
            <div className="ChatNameInput">
              <p>Creating group with: {selectedUser.firstName} {selectedUser.lastName}</p>
              <input className = "GroupNameInput"
                type="text"
                placeholder="Enter a group name..."
                value={customChatName}
                onChange={(e) => setCustomChatName(e.target.value)}
              />
              <div className="ChatNameActions">
                <button
                  onClick={() => {
                    if (customChatName.trim()) {
                      createNewChat(selectedUser, customChatName.trim()); // Pass the chat name
                      setSelectedUser(null); // Clear selected user
                      setCustomChatName(''); // Clear custom chat name
                      setShowGroupNameInput(false); // Hide group name input
                    } else {
                      alert('Please enter a chat name!');
                    }
                  }}
                >
                  Create Group
                </button>
                <button
                  onClick={() => {
                    setShowGroupNameInput(false); // Hide group name input
                    setSelectedUser(null); // Clear selected user
                    setCustomChatName(''); // Clear custom chat name
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <ul className="ChatList">
          <li className="ChatListHeader">
            Groups
          </li>
            {chats
              .slice()
              .sort((a, b) => {
                const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
                const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
                return dateB - dateA; // Sort in descending order
              })
              .map((chat) => (
                <li
                  key={chat.id}
                  className={`ChatListItem ${selectedChat?.id === chat.id ? 'active' : ''}`}
                >
                  <span onClick={() => setSelectedChat(chat)}>{getChatName(chat)}</span>
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

          */}

        
        {/* Tabs for Messages and Requests */}
        {/* Tabs for Messages and Requests */}
        <div className="MessagesSidebar">
          <div className="TabsContainer">
            <button 
              className={`Tab ${activeTab === 'messages' ? 'active' : ''}`} 
              onClick={handleMessagesSwitch}
            >
              Messages
            </button>

            <button 
              className={`Tab ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={handleRequestsSwitch}
            >
              Requests
            </button>
          </div>

          {/* Conditionally show the messages panel */}
          {showMessagesPanel && (
            <MessagesNavi 
              chats={chats}
              selectedChat={selectedChat} 
              setSelectedChat={setSelectedChat} 
              handleDeleteChat={handleDeleteChat} 
              chatNames={chatNames} 

            />
          )}
          {showRequestsPanel && (
            <JoinRequests 
            currentUserId={currentUserId} 
            addNewChat={addNewChat} // Passing addNewChat as a prop
          />
          )}
      
        </div>


        <div className="ChatSection">
          {selectedChat ? (
            <>
              <div className='ChatHeader'>
                <h2 className="ChatTitle">{chatNames[selectedChat.id]}</h2>
                {hasStudyGroup ?
                  <button
                    className="EditStudyGroupButton"
                    onClick={() => {
                      ;
                      setIsPanelVisible(true);
                    }}
                  > Edit Study Group </button>
                  :
                  <button
                    className="CreateStudyGroupButton"
                    onClick={() => {
                      handleCreateStudyGroup(selectedChat.id);
                      setIsPanelVisible(true);
                    }}
                  > Create Study Group </button>}

              </div>
              {isPanelVisible && (
                <div className="study-group-panel">
                  <EditStudyGroup
                    // Pass necessary props to the EditStudyGroup component
                    chatID={selectedChat.id}
                    onClose={() => setIsPanelVisible(false)} // Close panel when done
                    updateChatName={updateChatName} 
                  />
                </div>
              )}
              <div className="ChatWindow">
                {selectedChat && Array.isArray(selectedChat.messages) ? (
                  selectedChat.messages.length > 0 ? (
                    selectedChat.messages.map((message, index) => (
                      <div key={index} className="MessageContainer">
                        <div
                          className={`MessageBubble ${
                            message.userId === currentUserId ? 'MyMessage' : 'OtherMessage'
                          }`}
                          onDoubleClick={() => handleDoubleClick(message.id)}
                        >
                          {typeof message === 'string'
                            ? message
                            : typeof message.content === 'string'
                            ? message.content
                            : JSON.stringify(message)}
                        </div>
                        {/* Show heart if message was double-clicked */}
                        {heartedMessages[message.id] && <div className="Heart">❤️</div>}
                      </div>
                    ))
                  ) : (
                    <div className="NoMessages">No messages to display.</div>
                  )
                ) : (
                  <div className="NoChatSelected"></div>
                )}
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
