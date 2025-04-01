import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './messaging.css';
import Navbar from '../components/Navbar';
import CopyrightFooter from '../components/CopyrightFooter';
import './LandingPage.css';
import '../components/ChatsNavi.css'
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import ChatsNavi from "../components/ChatsNavi";
import CustomAlert from '../components/CustomAlert';
import { unescape } from 'querystring';
import GroupUserContainer from '../components/GroupUserContainer';
import { useNavigate } from "react-router-dom";
import CreateStudyGroup from '../components/CreateStudyGroup';
import PlusButtonProps from '../components/PlusButtonProps';
import { handleSendSystemMessage, handleSendButtonMessage, openCalendarEvent } from "../utils/messageUtils";
import { NullValueFields } from 'aws-sdk/clients/glue';
import CalendarEventPopup from '../components/CalendarEventPopup'

interface Chat {
  id: number;
  name: string;
  messages: Message[];
  users: User[]; 
  createdAt: string;
  updatedAt: string;
  lastUpdatedById: number | null;
  lastOpened: { [userId: number]: string };
}

interface Message{
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

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  unReadMessages?: boolean; 
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
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [msgUsernames, setMsgUsernames] = useState<{ [key: number]: string }>({});
  const [chatUsernames, setChatUsernames] = useState<{ [key: number]: string }>({});
  const [groupId, setGroupId] = useState<number | null>(null);
  
  const [unseenMessages, setUnseenMessages] = useState<{ [chatId: number]: boolean }>({});


  const [updateMessage, setUpdateMessage] = useState<string>('');
  const [visibleMessage, setVisibleMessage] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<{ id: number; name: string } | null>(null);
  const [loadingChatList, setLoadingChatList] = useState(true);
  const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  const navigate = useNavigate();

  const selectedChatId = searchParams.get("selectedChatId");
  


  const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
  const alertVisible = alerts.some(alert => alert.visible);
  useEffect(() => {
    const fetchData = async () => {
      setLoadingChatList(true);

      handleChatsSwitch();
      const token = localStorage.getItem('token');
      console.log(token);
      const getCurrentUser = async () => {
        if (token) {
          try {
            const response = await axios.get(`${REACT_APP_API_URL}/api/currentUser`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setCurrentUserId(response.data.id); // Set the current user ID
          } catch (error) {
            console.error('Error fetching current user:', error);
          }
        }
      }
      await getCurrentUser();
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
        }
      };

      // Call the sync function first
      await syncStudyGroupChats();

      const syncUserChats = async () => {

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
      };

      await syncUserChats();

      setLoadingChatList(false);

    }
    fetchData();

  }, [isPanelVisible]);  // reloads when selected or tab changes, allows for updates to users


  useEffect(() => {
    const fetchChats = async () => {
      console.log("selected chat id: ", selectedChatId);
      const token = localStorage.getItem('token');

    
      
      const getCurrentChat = async () => {
        if (!selectedChatId){
          return;
        }
        if (selectedChatId) {
          try {
            const response = await axios.get(`${REACT_APP_API_URL}/api/chats/${selectedChatId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            console.log(response.data);
            setSelectedChat(response.data)
            
            
          } catch (error) {
            console.error('Error fetching selected chat:', error);
          }
        }
      }
      await getCurrentChat();
      console.log("current chats complete");
      // Clear search params
      navigate(window.location.pathname, { replace: true });
      };
      fetchChats();
      console.log("fetch chats complete");
  }, []);


  useEffect(() => {
    const fetchData = async () => {



      const token = localStorage.getItem('token');
      console.log(token);

      const getCurrentUser = async () => {
        if (token) {
          try {
            const response = await axios.get(`${REACT_APP_API_URL}/api/currentUser`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setCurrentUserId(response.data.id); // Set the current user ID
          } catch (error) {
            console.error('Error fetching current user:', error);
          }
        }
      }
      await getCurrentUser();
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
        }
      };

      // Call the sync function first
      await syncStudyGroupChats();

      const syncUserChats = async () => {

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
      };



      await syncUserChats();

      setLoadingChatList(false);

    }
    fetchData();

  }, [activeTab, selectedChat]);  // reloads when selected or tab changes, allows for updates to users



  useEffect(() => {
    if (selectedChat) {
      socket.emit('joinChat', selectedChat.id, currentUserId);
    }
  }, [selectedChat, currentUserId]);

  useEffect(() => {
    socket.on("chatUpdated", (updatedUsers) => {
        setChats((prevChats) =>
            prevChats.map((chat) =>
                chat.id === selectedChat?.id
                    ? { ...chat, users: updatedUsers, messages: [...chat.messages] } // Preserve messages
                    : chat
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


// Used for retrieving the usernames of users in a chat
useEffect(() => {
  if (selectedChat?.users) {
    selectedChat.users.forEach((user) => {
      if (user.id !== undefined) { 
        handleGetChatUsername(user.id); // Only call handleGetChatUsername for non-system users
      }
        
      
    });
  }
}, [selectedChat, activeTab]);


  //Used for retrieving the user names of a chat and the users within
  useEffect(() => {
    if (selectedChat?.messages) {
      selectedChat.messages.forEach((message) => {
        if (message.system !== true && message.userId !== undefined) { // Check if the userId is not -1 (system message)
          handleGetMessageUsername(message.userId);
        }
      });
    }
  }, [selectedChat, activeTab]);
  
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
      console.log("changing chats!!");

    });
    
    return () => {
      socket.off('connect');
      socket.off('newMessage');
    };
  }, [selectedChat]); // Runs when messages update
  


  useEffect(() => {
    const fetchChatNames = async () => {
      const newChatNames: { [key: number]: string } = { ...chatNames };
      
      // Use Promise.all to fetch all chat names concurrently
      const fetchPromises = chats.map(async (chat) => {
        if (!newChatNames[chat.id]) { // Only fetch if not already in state
          try {
            const chatName = await getChatName(chat);
            if (chatName) {
              newChatNames[chat.id] = chatName;
            } else {
              console.warn(`No name for chat with ID: ${chat.id}`);
            }
          } catch (error) {
            console.error(`Error fetching name for chat with ID: ${chat.id}`, error);
          }
        }
      });
  
      // Wait for all chat names to be fetched
      await Promise.all(fetchPromises);
      console.log('Chat names:', newChatNames);
  
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
  const handleChatsSwitch = () => {
    setActiveTab('messages');
    setShowRequestsPanel(false);
    setShowMessagesPanel(true);
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
          system: false,
          isButton: false
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
                  lastUpdatedById: currentUserId,
                }
              : chat
          );
          // Sort chats by updatedAt (most recent first)
          return updatedChats.sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        });
        

  
        setCurrentMessage('');

    // Notifications for messaging - Done
    console.log('Sending notification request to backend...');

    let senderName = "Unknown Sender";
    if (selectedChat.users && currentUserId) {
      const sender = selectedChat.users.find((user) => user.id === currentUserId);
      if (sender) {
        senderName = `${sender.firstName} ${sender.lastName}`;
      }
    }

    console.log('Sender name for notification:', senderName);

    // Get all recipients (exclude the sender)
    const recipients = selectedChat.users.filter((user) => user.id !== currentUserId);

    if (recipients.length > 0) {
      
      const isGroupChat = selectedChat.users.length > 2;
      const chatName = await getChatName(selectedChat);

      // Create the notification message
      let notificationMessage = `New message from ${senderName}`;
      if (isGroupChat) {
        notificationMessage += ` in ${chatName}`;
      }

      const chatID = selectedChat.id;
      console.log("CHATTT: ", chatID);
      console.log('Notification message:', notificationMessage);

      // Send notification to each recipient
      await Promise.all(
        recipients.map(async (recipient) => {
          console.log(`Sending notification to ${recipient.firstName} ${recipient.lastName}`);

          const response = await fetch(`${process.env.REACT_APP_API_URL}/notifications/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId: recipient.id,
              message: notificationMessage,
              type: "Message",
              chatID: chatID,
            }),
          });
        })
      );
    }

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
      console.log('Other user:', otherUser);
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
        // alert('You need to be logged in to delete a chat.');
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          { id: Date.now(), alertText: 'You need to be logged in to delete a chat.', alertSeverity: 'error', visible: true },
        ]);
        return;
      }

      // deletes the chat from the database
      await axios.delete(`${REACT_APP_API_URL}/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      updateChats(chatId);
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
        // alert('You need to be logged in to view users.');
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          { id: Date.now(), alertText: 'You need to be logged in to view users.', alertSeverity: 'error', visible: true },
        ]);
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
      // alert('Failed to load users.');
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        { id: Date.now(), alertText: 'Failed to load users', alertSeverity: 'error', visible: true },
      ]);
      
    }
  };
  

  // Creates new study groups
  const handleCreateStudyGroup = async (chatId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // alert('You need to be logged in to create a study group.');
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          { id: Date.now(), alertText: 'You need to be logged in to create a study group.', alertSeverity: 'error', visible: true },
        ]);
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
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          { id: Date.now(), alertText: 'No chat selected', alertSeverity: 'error', visible: true },
        ]);
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
      setCurrentGroupId(data.studyGroupID);

  
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
        // alert('Please log in again.');
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          { id: Date.now(), alertText: 'Please log in again', alertSeverity: 'error', visible: true },
        ]);
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

 // Used for retrieving names for putting names above sent messages
const handleGetMessageUsername = async (userId: number) => {
  // Check if the userId is the SYSTEM_USER_ID and skip if true
  if (userId === undefined) return;

  try {
    const response = await axios.get(`${REACT_APP_API_URL}/api/users/${userId}`);
    const username = response.data.firstName + " " + response.data.lastName;
    setMsgUsernames((prev) => ({ ...prev, [userId]: username }));
    //console.log(username);
  } catch (error) {
    console.error("Error fetching username:", error);
  }
};

// Used for retrieving names for putting names above sent messages
const handleGetChatUsername = async (userId: number) => {
  // Check if the userId is the SYSTEM_USER_ID and skip if true
  if (userId === undefined) return;
  console.log("fetching username for user" , userId);

  try {
    const response = await axios.get(`${REACT_APP_API_URL}/api/users/${userId}`);
    const username = response.data.firstName + " " + response.data.lastName;
    setChatUsernames((prev) => ({ ...prev, [userId]: username }));
    //console.log(username);
  } catch (error) {
    console.error("Error fetching username:", error);
  }
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
  
  const updateChats = (chatId: number) => {
    // updates the displayed chats to delete the chat from the UI
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
    if (selectedChat?.id === chatId) {
      setSelectedChat(null);
    }
  }



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

        // add left/removed from chat message here
        const username = chatUsernames[userId] || "Unknown";
        let mess = "";
        // console.log(username);
        if (userId === currentUserId) {
          mess = `${username} left the group.`;
          
        } else {
          mess = `${username} was removed from the group.`;
        }
        setUpdateMessage(mess);

        

        console.log("update message " ,  mess);
        if (selectedChat){
          handleSendSystemMessage(mess, selectedChat.id, setSelectedChat, setChats, setUpdateMessage);
          updateChats(selectedChat.id);
        }
        

        
      } else {
        console.error('Failed to delete the user.');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };
  
  

  const openProfilePopup = (profile: { id: number; name: string }) => {
    setSelectedProfile(profile);
  };

  const closeProfilePopup = () => {
    setSelectedProfile(null);
  };

  //sends the message 
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handlePlusSelect = () => {
    return
  }

  const handleButtonClick = (action: string | undefined, studyGroupId: number | undefined | null) => {
    if (action == undefined) {
      console.log("no button action")
      return
    }
      const [actionType, eventURL] = action.split(',');
      console.log("Action Type:", actionType);
      console.log("Event URL:", eventURL);

    switch (actionType) {
      case "weekly-scheduler":
        if (studyGroupId) {
          openWeeklyScheduler(studyGroupId);
        } else {
          console.error("Study group ID is missing for weekly scheduler action.");
        }
        break;
  
      case "calendar-event":
          openCalendarEvent(eventURL);

        break;
  
      default:
        console.warn(`Unhandled button action: ${action}`);
    }
  };

  const handleButtonMessage = (buttonData: { action: string; studyGroupId?: number | undefined; label: string }) => {
    console.log('inHandlebuttonmessage')
    if (!selectedChat?.id) return; // Ensure a chat is selected
    console.log('inHandlebuttonmessage twooo')

    handleSendButtonMessage(buttonData, selectedChat.id, currentUserId, setSelectedChat, setChats, setUpdateMessage); // Now we call it here ✅
};
  
  // Function to open the Weekly Scheduler for a study group
  const openWeeklyScheduler = (studyGroupId: number) => {
    console.log(`Opening Weekly Scheduler for study group ID: ${studyGroupId}`);
    // <Link to={`/studyGroup/${groupId}/schedule`}>
    //         <button className='Availability-Button'> Availability </button>
    //       </Link>
    // Add logic to open the weekly scheduler modal/page
    navigate(`/studyGroup/${studyGroupId}/schedule`);
  };

  const openGoogleCalendar = (studyGroupId: number) => {
    const title = encodeURIComponent("Study Group Meeting");
    const details = encodeURIComponent("Join the study session for our course!");
    const location = encodeURIComponent("Online / Library");
    
    const startTime = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const endTime = new Date(new Date().getTime() + 60 * 60 * 1000)
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0] + "Z";
  
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startTime}/${endTime}`;
    
    window.open(url, "_blank");
  };
  


  return (
    <div className="Messaging">
      <div>
              <Navbar />

      </div>
      
      <div className="Chat">
        {/* Display the alert if it's visible */}
      {alertVisible && (
        <div className='alert-container'>
          {alerts.map(alert => (
            <CustomAlert
              key={alert.id}
              text={alert.alertText || ''}
              severity={alert.alertSeverity || 'info' as "error" | "warning" | "info" | "success"}
              onClose={() => setAlerts(prevAlerts => prevAlerts.filter(a => a.id !== alert.id))}
            />
          ))}
        </div>
      )}
        {/* Tabs for Messages and Requests */}

        <div className="ChatsSidebar">
          <div className="TabsContainer">
            <button 
              className={`ChatTab ${activeTab === 'messages' ? 'active' : ''}`} 
            >
              Chats
            </button>

           
          </div>

          {/* Conditionally show the messages panel */}
          {showMessagesPanel && currentUserId && (
            <ChatsNavi 
              chats={chats}
              selectedChat={selectedChat} 
              setSelectedChat={setSelectedChat} 
              currentUserId = {currentUserId}
              handleDeleteChat={handleDeleteChat} 
              chatNames={chatNames} 
              loadingChatList={loadingChatList}
            />
          )}

          <div className='newChat'>
            <button  className='newChatButton' onClick={() => navigate(`/network?active='matches'`)}>
              + New Chat
            </button>
          </div>

      
        </div>


        <div className="ChatSection">
          {selectedChat ? (
            <>
              <div className='ChatHeader'>
                <h2 className="ChatTitle">{chatNames[selectedChat.id]}</h2>

                {/* Button Container for grouping buttons together */}
                  <div className="ButtonContainer">
                    {/* User List Button */}
                  {hasStudyGroup && (
                    <button
                      className="UserListButton"
                      onClick={() => {
                        handleGetUsers(selectedChat.id);
                        setIsUserPanelVisible(true);
                      }}
                    >
                      Members
                    </button>
                  )}

                  {/* Edit/Create Study Group Button */}

                  {hasStudyGroup ? (
                    <button
                      className="EditStudyGroupButton"
                      onClick={() => {
                        navigate(`/groups?groupId=${currentGroupId}&tab=true`);
                      }}
                    >
                      Edit Study Group
                    </button>
                  ) : (
                    <button
                      className="CreateStudyGroupButton"
                      onClick={() => {
                        handleCreateStudyGroup(selectedChat.id);
                        setIsPanelVisible(true);
                      }}
                    >
                      Create Study Group
                    </button>
                  )}
                </div>
                {/* User List Panel */}
                {isUserPanelVisible && selectedChatUsers && (
                  <div className="Popup-members-users-panel">
                    <GroupUserContainer
                      groupId={groupId}
                      currentId={currentUserId}
                      users={selectedChatUsers ?? []}
                      chatId={selectedChat.id}
                      onRemoveUser={removeUser}
                      updateUsers={updateUsers}
                      onClose={() => setIsUserPanelVisible(false)}
                      isPopup={true}
                    />
                  </div>
                )}

                {/* Study Group Panel */}
                {isPanelVisible && (
                  <div className="c-study-group-panel">
                    <CreateStudyGroup
                      chatID={selectedChat.id}
                      onClose={() => setIsPanelVisible(false)}
                      updateChatName={updateChatName}
                    />
                  </div>
                )}

              </div>


              <div className="ChatWindow" ref={chatWindowRef}>
                {selectedChat ? (
                  // If selectedChat exists
                  Array.isArray(selectedChat.messages) ? (
                    selectedChat.messages.length > 0 ? (
                      selectedChat.messages.map((message, index) => (
                        <div key={index} className="MessageContainer">
                          {/* Display usernames */}
                          {!message.system && (index === 0 || selectedChat.messages[index - 1].userId !== message.userId) && (
                            <div className={`username ${message.userId === currentUserId ? 'MyUsername' : ''}`}>
                              {message.userId !== undefined && msgUsernames[message.userId] ? msgUsernames[message.userId] : "Loading..."}
                            </div>
                          )}

                          {/* Display messages */}
                          <div
                            className={`MessageBubble ${message.system ? 'SystemMessage' : (message.userId === currentUserId ? 'MyMessage' : 'OtherMessage')}`}
                            onDoubleClick={() => handleDoubleClick(message.id)}
                          >
                            {/* Check if the message is a button message */}
                            {message.isButton && message.buttonData ? (
                              <button
                              className={`PlusButton ${message.buttonData?.action === 'weekly-scheduler' ? 'weekly-scheduler-class' : ''}`}
                              onClick={() => handleButtonClick(message.buttonData?.action, message.buttonData?.studyGroupId)}
                            >
                              <div>
                                {message.buttonData?.label.split("\n").map((line, index) => {
                               // Ignore empty lines (but still render them with no colon)
    if (!line.trim()) {
      return (
        <div key={index}>
          <br />
        </div>
      );
    }

    // Split the line only at the first colon
    const [label, ...valueParts] = line.split(":");
    const value = valueParts.join(":").trim(); // Join back if there are additional colons

    return (
      <div key={index}>
        <span style={{ fontWeight: "bold" }}>{label}: </span> 
        <span style={{ fontWeight: "normal" }}>{value}</span>
        <br />
      </div>
    );
})}
                              </div>
                            </button>
                            ) : (
                              <span>
                                {typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}
                              </span>
                            )}

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
                <PlusButtonProps
                  onSelect={handlePlusSelect}
                  studyGroupId={currentGroupId}
                  selectedChatId={selectedChat.id}
                  onSendButtonMessage={handleButtonMessage} // 👈 Pass function to handle button messages


                />
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
         {/* Render the popup at the Messaging level */}
         
      </div>
      <div>
        <CopyrightFooter />
      </div>
    </div>
  );
};

export default Messaging;