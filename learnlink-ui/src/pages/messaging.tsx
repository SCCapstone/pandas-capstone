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
import GroupUserList from '../components/GroupUserList';



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


const Messaging: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]); // Store users
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showGroupNameInput, setShowGroupNameInput] = useState<boolean>(false);
  const chatWindowRef = React.useRef<HTMLDivElement | null>(null);
  const [hasStudyGroup, setHasStudyGroup] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(false);  // To control panel visibility
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // Track selected user
  const [searchParams] = useSearchParams();
  const selectedUserId = searchParams.get('user'); // Get the matched user ID
  const [heartedMessages, setHeartedMessages] = useState<{ [key: number]: boolean }>({});
  const [studyGroupNames, setStudyGroupNames] = useState<{ [key: number]: string }>({});
  const [chatNames, setChatNames] = useState<{ [key: number]: string }>({});
  //for matching stuff ie chats tab and requests tab
  const [showMessagesPanel, setShowMessagesPanel] = useState(false);
  const [showRequestsPanel, setShowRequestsPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'messages' | 'requests'>('messages');
  const [selectedChatUsers, setSelectedChatUsers] = useState<User[] | null>(null);
  // for user panel
  const [isUserPanelVisible, setIsUserPanelVisible] = useState(false);
  // for displaying names above messages sent
  const [usernames, setUsernames] = useState<{ [key: number]: string }>({});
  const [groupId, setGroupId] = useState<number | null>(null);

  useEffect(() => {
    handleMessagesSwitch();
    const token = localStorage.getItem('token');
      console.log(token);
      const syncStudyGroupChats = async () => {
        try {
          // Fetch the user's study groups or chats (assumed from user context or current user API)
          const response = await axios.get(`${REACT_APP_API_URL}/api/chats`, {
            headers: { Authorization: `Bearer ${token}` },
          });
    
          // Loop through each chat and sync study group chats first
          for (const chat of response.data) {
            if (chat.studyGroupId) {  // Ensure it's a study group chat
              await axios.post(`${REACT_APP_API_URL}/api/sync-study-group-chat`, {
                studyGroupId: chat.studyGroupId,
              });
            }
          }
        } catch (error) {
          console.error('Error syncing study group chats:', error);
      }};
  
      // Call the sync function first
      syncStudyGroupChats();
  

      // Proceed with fetching users and chats after sync
      axios.get(`${REACT_APP_API_URL}/api/users`)
        .then((userResponse) => setUsers(userResponse.data))
        .catch((error) => console.error('Error fetching users:', error));

      // Proceed with fetching chats after sync
      axios.get(`${REACT_APP_API_URL}/api/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((chatResponse) => {
          const chatsWithMessages = chatResponse.data.map((chat: Chat) => ({
            ...chat,
            messages: chat.messages || [], // Ensure messages is always an array
            users: chat.users || [], // Ensure users is always an array
          }));

          setChats(chatsWithMessages);

          // Ensure storing liked messages correctly
          const likedMessagesMap = chatResponse.data.reduce((acc: Record<number, boolean>, chat: Chat) => {
            chat.messages?.forEach((msg: Message) => {
              acc[msg.id] = msg.liked ?? false; // Default to false if missing
            });
            return acc;
          }, {});

          setHeartedMessages(likedMessagesMap); // Store liked states
        })
        .catch((error) => console.error('Error fetching chats:', error));

      // Fetch current user if token exists
      if (token) {
        axios.get(`${REACT_APP_API_URL}/api/currentUser`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((response) => setCurrentUserId(response.data.id))
          .catch((error) => console.error('Error fetching current user:', error));
      }
    
  
  }, [isPanelVisible]);  // Trigger when panel visibility changes
  

  useEffect(() => {
    if (selectedChat) {
      socket.emit('joinChat', selectedChat.id, currentUserId);
    }
  }, [selectedChat, currentUserId]);

  useEffect(() => {
    socket.on("chatUpdated", (updatedUsers) => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === selectedChat?.id ? { ...chat, users: updatedUsers } : chat
        )
      );
    });
  
    return () => {
      socket.off("chatUpdated");
    };
  }, [selectedChat]);
  

  // Used for editing study groups
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

  // Checks if a chat is a study group
  useEffect(() => {
    if (selectedChat) {
      checkStudyGroup();
    }
  }, [selectedChat]);  

  //Used for retrieving the user names of a chat and the users within
  useEffect(() => {
    if (selectedChat?.messages) {
      selectedChat.messages.forEach((message) => handleGetUsername(message.userId));
    }
  }, [selectedChat]);

  
  // Web socket functionality for sending and receiving messages
  useEffect(() => {

    socket.on('connect', () => {
      console.log('Connected to server');
    });
    
    socket.on('newMessage', (message) => {
      console.log('New message received:', message);
    
      setChats((prevChats) => {
        return prevChats.map((chat) =>
          chat.id === message.chatId
            ? { ...chat, messages: [...chat.messages, message]}
            : chat
        );
      });
    });
    
    return () => {
      socket.off('connect');
      socket.off('newMessage');
    };
  }, [selectedChat]); // Runs when messages update
  

  //used for fetching chat names upon mounting
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

  useEffect(() => {
    if (selectedChat?.messages?.length && chatWindowRef.current) {
      requestAnimationFrame(() => {
        chatWindowRef.current?.scrollTo({
          top: chatWindowRef.current.scrollHeight,
          behavior: 'smooth',
        });
      });
    }
  }, [selectedChat?.messages]); // Runs every time messages change
  

  // Switches from the Requests tab to the Chats tab
  const handleMessagesSwitch = () => {
    setActiveTab('messages');
    setShowRequestsPanel(false);
    setShowMessagesPanel(true);
  };
  
  // Switches from the Chats tab to the Requests Tab
  const handleRequestsSwitch = () => {
    setActiveTab('requests');
    setShowMessagesPanel(false);
    setShowRequestsPanel(true);
  };


  // sends messages between users
  const handleSendMessage = async () => {
    // Authorization
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
  
        // sends the message via a websocket to the other user
        socket.emit(
          'message',
          {
            chatId: selectedChat.id,
            content: currentMessage,
            userId: currentUserId,
            token,
          },
          (response: { success: boolean; message?: string; error?: string }) => {
            if (response.success) {
              console.log('Message sent successfully:', response.message);
            } else {
              console.log('Message send failed:', response.error);
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

        setChats((prevChats) => {
          const updatedChats = prevChats.map((chat) =>
            chat.id === selectedChat.id
              ? {
                  ...chat,
                  messages: [...(chat.messages || []), messageData],
                  updatedAt: new Date().toISOString(), // Convert Date to string here
                }
              : chat
          );
          // Sort chats by updatedAt (most recent first)
          return updatedChats.sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        });
        

  
        setCurrentMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };
    
  

  // Used to access the study group name or chat name for displaying properly on the UI
  const getChatName = async (chat: Chat) => {
    // getting the study group name
    try {
      const response = await axios.get(`${REACT_APP_API_URL}/api/study-groups/chat/${chat.id}`);
      if (response.data.name) {
        setStudyGroupNames((prev) => ({ ...prev, [chat.id]: response.data.name }));
        return response.data.name;
      }
    } catch (error) {
      console.error("Error fetching study group name:", error);
    }
    
    // not a study group option
    if (currentUserId) {
      const otherUser = chat.users?.find((user) => user.id !== currentUserId);
      if (otherUser) {
          return `${otherUser.firstName} ${otherUser.lastName}`;
      }
    }
    return " ";
  };
  
  


  // Deletes a chat when clicking on the X 
  const handleDeleteChat = async (chatId: number) => {
    try {
      //Authorization
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to be logged in to delete a chat.');
        return;
      }

      // deletes the chat from the database
      await axios.delete(`${REACT_APP_API_URL}/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // updates the displayed chats to delete the chat from the UI
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

  // Retrieves the users for the user list, such that users can view the users in a study group
  const handleGetUsers = async (chatId: number) => {
    try {
      //Authorization
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to be logged in to view users.');
        return;
      }
  
      //gets the study group linked with that chat
      const response = await axios.get(
        `${REACT_APP_API_URL}/api/study-groups/chat/${chatId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
  
      const data = response.data;
      //console.log ('data', data);
      const groupId = data.studyGroupID;
      setGroupId(data.studyGroupID);
      //console.log( 'id', groupId);

      // gets the users associated with that study group thats linked to the chat
      const res = await axios.get(
        `${REACT_APP_API_URL}/api/study-groups/${groupId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const dat = res.data;
      //console.log('Users in study group:', dat.studyGroup.users);
      
      //setSelectedChatUsers(dat.studyGroup.users); // Store user data for the selected chat
      setSelectedChatUsers(
        dat.studyGroup.users.filter((user: User) => user.id !== currentUserId)
      );
      

      setIsUserPanelVisible(true); // Open the panel to show users
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to load users.');
    }
  };
  

  // Creates new study groups
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

  // Checks if a chat has a linked study group
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

  // Used for retriving names for putting names above sent messages
  const handleGetUsername = async (userId: number) => {
    try {
      const response = await axios.get(`${REACT_APP_API_URL}/api/users/${userId}`);
      const username = response.data.firstName + " " + response.data.lastName;
      setUsernames((prev) => ({ ...prev, [userId]: username }));
      //console.log(username);
    } catch (error) {
      console.error("Error fetching username:", error);
      setUsernames((prev) => ({ ...prev, [userId]: "Unknown" }));
    }
  };


  // passed into joinrequests component, ensures the name is updated when a request is approved
  const addNewChat = (newChat: any) => {
    setChats((prevChats) => [...prevChats, newChat]); // Add new chat
    setChatNames((prevNames) => ({
      ...prevNames,
      [newChat.id]: newChat.name, // Ensure new chat name is added
    }));
  };

  // passed into editstudygroup component, ensures the name is updated when updated
  const updateChatName = (chatId: number, newName: string) => {
    setChatNames((prevChatNames) => ({
      ...prevChatNames,
      [chatId]: newName,
    }));
  };

  const updateUsers = (userId: number) => {
    setSelectedChatUsers(prevUsers => (prevUsers || []).filter(user => user.id !== userId));
  };
  
  
  //deletes a user from a study group
  const removeUser = async (userId: number, groupId: number | null) => {
    if (!groupId) {
      console.error('Group ID is missing.');
      return;
    }
    try {
      const response = await axios.delete(`${REACT_APP_API_URL}/api/study-groups/${groupId}/users/${userId}`);
      
      if (response.status === 200) {
        // Log the updated users state to ensure it reflects the change
        //setSelectedChatUsers(prevUsers => (prevUsers || []).filter(user => user.id !== userId));

        setSelectedChatUsers((prevUsers) => (prevUsers|| []).filter(user => user.id !== userId));
        if (selectedChat?.id === userId) {
          setSelectedChat(null);
        }
      } else {
        console.error('Failed to delete the user.');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };
  
  

  //sends the message 
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="Messaging">
      <div>
              <Navbar />

      </div>
      <div className="Chat">
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
          {/* Conditionally show the requests panel */}
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
                  {/* User List Button 
                   ensures that a chat is a study group first */}
                  {hasStudyGroup 
                    && <button 
                    className="UserListButton"
                    onClick={() => {
                      handleGetUsers(selectedChat.id);
                      setIsUserPanelVisible(true);
                    }}
                  >
                    Users
                  </button>}
                  {/* User List Panel */}
                  {isUserPanelVisible && selectedChatUsers && (
                    <div className="users-panel">
                      <GroupUserList
                        groupId={groupId}
                        users={selectedChatUsers ?? []}
                        onClose={() => setIsUserPanelVisible(false)}
                        onRemoveUser={removeUser}
                        updateUsers = {updateUsers}
                      />
                    </div>
                  )}

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

              <div className="ChatWindow" ref={chatWindowRef}>
                {selectedChat ? (
                  // If selectedChat exists
                  Array.isArray(selectedChat.messages) ? (
                    selectedChat.messages.length > 0 ? (
                      selectedChat.messages.map((message, index) => (
                        <div key={index} className="MessageContainer">
                          {/* Display usernames */}
                          {index === 0 || selectedChat.messages[index - 1].userId !== message.userId ? (
                            <div className={`username ${message.userId === currentUserId ? 'MyUsername' : ''}`}>
                              {usernames[message.userId] || "Loading..."}
                            </div>
                          ) : null}
                          {/* Display messages */}
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
                    <div className="NoChatSelected">Please select a chat</div> // Show message if no chat is selected
                  )
                ) : (
                  // If selectedChat is null or undefined
                  <div className="NoChatSelected">Please select a chat</div> // Show message if no chat is selected
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
      <div>
        <CopyrightFooter />
      </div>
    </div>
  );
};

export default Messaging;
