import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './messaging.css';
import Navbar from '../components/Navbar';
import CopyrightFooter from '../components/CopyrightFooter';
import './LandingPage.css';
import '../components/ChatsNavi.css'
import '../components/NewChatList.css'
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import ChatsNavi from "../components/ChatsNavi";
import CustomAlert from '../components/CustomAlert';
import NewChatList from "../components/NewChatList";
import { unescape } from 'querystring';
import GroupUserContainer from '../components/GroupUserContainer';
import { useNavigate, useLocation } from "react-router-dom";
import CreateStudyGroup from '../components/CreateStudyGroup';
import PlusButtonProps from '../components/PlusButtonProps';
import { handleSendSystemMessage, handleSendButtonMessage, openCalendarEvent, updateChatTimestamp } from "../utils/messageUtils";
import { NullValueFields } from 'aws-sdk/clients/glue';
import CalendarEventPopup from '../components/CalendarEventPopup';


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
  profilePic?: string;
}


const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

const socket = io(REACT_APP_API_URL, {
  transports: ["websocket"],
  reconnectionAttempts: 3,
  timeout: 10000
});


const Messaging: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [selectedChatId, setSelectedChatId] =  useState<number | null>(null);
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
  const [studyGroupPfps, setStudyGroupPfps] = useState<{ [key: number]: string }>({});
  const [chatNames, setChatNames] = useState<{ [key: number]: string }>({});
  const [chatPfps, setChatPfps] = useState<{ [key: number]: string }>({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  //for matching stuff ie chats tab and requests tab
  const [showMessagesPanel, setShowMessagesPanel] = useState(false);
  const [showRequestsPanel, setShowRequestsPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'messages' | 'requests'>('messages');
  const [selectedChatUsers, setSelectedChatUsers] = useState<User[] | null>(null);
  // for user panel
  const [isUserPanelVisible, setIsUserPanelVisible] = useState(false);
  // for displaying names above messages sent
  const [msgUsernames, setMsgUsernames] = useState<{ [key: number]: string }>({});
  const [msgPfps, setMsgPfps] = useState<{ [key: number]: string }>({});
  const [chatUsernames, setChatUsernames] = useState<{ [key: number]: string }>({});
  const [groupId, setGroupId] = useState<number | null>(null);
  const [lastOpenedTimes, setLastOpenedTimes] = useState<{[chatId: number]: { [userId: number]: string };}>({});
  const [updateMessage, setUpdateMessage] = useState<string>('');
  const [selectedProfile, setSelectedProfile] = useState<{ id: number; name: string } | null>(null);
  const [loadingChatList, setLoadingChatList] = useState(true);
  const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const genericUserPfp = "https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_bust-in-silhouette.png";
  const genericStudyGroupPfp = "https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_busts-in-silhouette.png";
  const navigate = useNavigate();
  const currentLocation = useLocation();
  const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
  const alertVisible = alerts.some(alert => alert.visible);




  /******* USE EFFECTS ******/


  // Used for navigating between pages
  useEffect(() => {
    // Extract query parameters from the current URL
    const queryParams = new URLSearchParams(currentLocation.search);
    const scId = queryParams.get("selectedChatId");
    //console.log("scIDDDD::::", scId);
  
    // Function to fetch chat details by ID from the backend
    const fetchChatById = async (chatId: number) => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${REACT_APP_API_URL}/api/chats/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Process button messages if they exist
        const chatData = response.data;
        
        // Save chat data and ID to state
        setSelectedChat(chatData);
        setSelectedChatId(chatId);
        

        // Clear the URL query params (so reloads don't re-fetch unnecessarily)
        navigate(window.location.pathname, { replace: true });
      } catch (error) {
        console.error('Error fetching selected chat:', error);
      }
    };

    // Wrapper to parse the chat ID and fetch data
    const loadData = async () => {
      if (scId) {
        const parsedId = parseInt(scId, 10);
        if (!isNaN(parsedId)) {
          await fetchChatById(parsedId); // Only fetch if the ID is a valid number

        }
      }
    };
  
    // Start the loading process when the component mounts or the URL search changes
    loadData();
  }, [currentLocation.search]); // Re-run this effect if the URL query changes
  



  /*
  This effect handles the initial loading of data when the chat panel becomes visible. 
    It:
          Sets up the UI state (e.g., sets active tab to "messages")
          Retrieves the current user ID
          Syncs any study group chat data
          Loads users and chat messages from the server
          Tracks which messages the user has liked (hearted)
  */
  useEffect(() => {
    const fetchData = async () => {
      setLoadingChatList(true); // Start loading state

      // Prep UI state
      setActiveTab('messages');
      setShowMessagesPanel(true);

      const token = localStorage.getItem('token');
    
      // --- Step 1: Fetch Current User ---
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

      // --- Step 2: Sync Study Group Chats ---
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


      // --- Step 3: Fetch Users and Chats ---
      const syncUserChats = async () => {

        // Proceed with fetching users
        axios.get(`${REACT_APP_API_URL}/api/users`)
          .then((userResponse) => setUsers(userResponse.data))
          .catch((error) => console.error('Error fetching users:', error));

        // Proceed with fetching chats
          axios.get(`${REACT_APP_API_URL}/api/chats`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((chatResponse) => {
               // Ensure message and user arrays are defined
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

      setLoadingChatList(false); // End loading state

    }
    fetchData();  // Invoke the async function

  }, [isPanelVisible]);  // Re-run when panel is toggled (e.g., user opens chat UI)



 /*
  This effect is similar to the first one but specifically handles changes in selected chat state.
    It ensures that:
        The current user is up to date
        Study group chats are synced
        The latest chat and user data is fetched (to reflect any new interactions or updates)
*/
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
     
      // --- Step 1: Get Current User ---
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

      // --- Step 2: Sync Study Group Chats ---
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

      // --- Step 3: Fetch Users and Chats ---
      const syncUserChats = async () => {

        // Proceed with fetching users
        axios.get(`${REACT_APP_API_URL}/api/users`)
          .then((userResponse) => setUsers(userResponse.data))
          .catch((error) => console.error('Error fetching users:', error));

        // Proceed with fetching chats
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
    fetchData(); // Invoke the function

  }, [activeTab, selectedChat, selectedChatId]);  // reloads when selected chat or tab changes, allows for updates to users


  // Used for editing study groups
  // When a user is selected for editing a study group, 
  // this hook finds their corresponding user object and 
  // sets up the UI for editing (e.g., showing a group name input field).

  useEffect(() => {
    if (selectedUserId) {
      // Convert selectedUserId to a number and find the corresponding user object
      const matchedUser = users.find(user => user.id === Number(selectedUserId)); // Convert to number
      if (matchedUser) {
        setSelectedUser(matchedUser);  // Update selected user in state
        console.log(matchedUser);      // Log user details (likely for debugging)
        setShowGroupNameInput(true);   // Show input for renaming the group
      }
    }
  }, [selectedUserId, users]);


  // Triggers a check when the selected chat changes to determine if it's a study group, 
  // affecting how the chat is displayed or what features are enabled.

  useEffect(() => {
    if (selectedChat) {
      checkStudyGroup(); // Triggers a function to determine if the chat qualifies as a study group
    }
  }, [selectedChat]);  


  // Used for retrieving the usernames of users in a chat
  // Fetches the display names for all users in a selected chat whenever the chat or active tab changes. 
  // This helps keep the chat UI personalized and informative.

  useEffect(() => {
    if (selectedChat?.users) {
      selectedChat.users.forEach((user) => {
        if (user.id !== undefined) { 
          handleGetChatUsername(user.id); // Retrieve display name for each user (excluding system)
        }
          
        
      });
    }
  }, [selectedChat, activeTab]);


  // Used for retrieving the user names of a chat and the users within
  // Fetches usernames for users who have sent messages in the current chat.
  // Complements the previous hook by ensuring user attribution is accurate even if not all users are in the users list.

  useEffect(() => {
    if (selectedChat?.messages) {
      selectedChat.messages.forEach((message) => {
        if (message.system !== true && message.userId !== undefined)
        { 
          handleGetMessageUsername(message.userId); // Fetch sender username (skip system messages)
        }
      });
    }
  }, [selectedChat, activeTab]);


  // When the list of chats changes, this hook retrieves chat display names and profile pictures and stores them in state. 
  // Optimized with Promise.all for concurrent fetching.

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

    const fetchChatPfps = async() => {
      const newChatPfps: { [key: number]: string } = { ...chatPfps };
      
      // Use Promise.all to fetch all chat pfps concurrently
      const fetchPromises = chats.map(async (chat) => {
        if (!newChatPfps[chat.id]) { // Only fetch if not already in state
          try {
            const chatPfp = await getChatPfp(chat);
            if (chatPfp) {
              newChatPfps[chat.id] = chatPfp;
            } else {
              console.warn(`No pfp for chat with ID: ${chat.id}`);
            }
          } catch (error) {
            console.error(`Error fetching pfp for chat with ID: ${chat.id}`, error);
          }
        }
      });
  
      // Wait for all chat pfps to be fetched
      await Promise.all(fetchPromises);
      console.log('Chat pfps:', newChatPfps);
  
      setChatPfps(newChatPfps);
    };
  
    fetchChatNames();
    fetchChatPfps();
  }, [chats]); // Runs only when `chats` change
  

  // Ensures the chat window scrolls smoothly to the latest message whenever new messages arrive, 
  // keeping the user focused on the most recent conversation.

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






/***** SOCKET USE EFFECTS ******/

/*
  These useEffect hooks manage the lifecycle and behavior of chats using WebSocket (via socket)
    They: 
      Establishing and tearing down socket connections
      Handling user presence in chat rooms
      Managing chat joins/leaves when switching conversations
      Listening to real-time chat updates and messages
    This modular separation ensures clean logic and proper resource management 
      like cleanup of listeners and disconnecting sockets when needed.
*/

// Establishes a socket connection when the component mounts if the user is authenticated, 
// and ensures the socket disconnects when the component unmounts.

  useEffect(() => {
    const token = localStorage.getItem('token');
    // Connect to the socket server if a token exists
    if (token) {
      socket.connect();
    }
    // Disconnect from socket on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);


  // Notifies the server that the current user has joined their personal room 
  // Runs whenever socket or currentUserId changes.

  useEffect(() => {
    if (socket && currentUserId) {
      console.log("[Socket] Emitting joinUserRoom for", currentUserId);
      socket.emit('joinUserRoom', currentUserId);
    }
  }, [socket, currentUserId]);


  // Handles room transitions when the user switches between chats. 
  // Ensures the user leaves the previous chat before joining a new one, 
  // and cleans up on unmount.

  useEffect(() => {
    if (selectedChat && currentUserId) {
      // Leave the previous chat room if applicable
      if (selectedChatId) {
        socket.emit('leaveChat', selectedChatId, currentUserId);
      }
      
      // Join the newly selected chat room
      socket.emit('joinChat', selectedChat.id, currentUserId);
      setSelectedChatId(selectedChat.id);
    }
    // On component unmount or dependency change, leave the chat
    return () => {
      if (selectedChatId && currentUserId) {
        socket.emit('leaveChat', selectedChatId, currentUserId);
      }
    };
  }, [selectedChat, currentUserId]);


  // Listens for changes to the active chat’s participant list and updates the local state accordingly. 
  // This keeps the user list in sync with the server.

  useEffect(() => {
    const handleChatUpdated = (updatedUsers:any) => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
            chat.id === selectedChat?.id
                ? { ...chat, users: updatedUsers, messages: [...chat.messages] } // Preserve messages
                : chat
        )
    );
    };

    // Listen for updates from the server about user list changes in a chat
    socket.on("chatUpdated", handleChatUpdated);

    // Remove listener on unmount
    return () => {
        socket.off("chatUpdated", handleChatUpdated);
    };
  }, [selectedChat]);


  // Handles incoming messages from the server and updates the appropriate chat. 
  // Messages from the current user or system are ignored. 
  // Ensures both the chat list and the active chat window stay updated.

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      console.log('[Client] Received newMessage from server:', message);

      // Ignore own messages or system messages -- prevents duplicates
      if (message.userId === currentUserId || message.system === true) {
        return;
      }

      // Update chats list with new message and re-sort by updated time
      setChats(prevChats => {
        return prevChats.map(chat =>
          chat.id === message.chatId
            ? { 
                ...chat, 
                messages: [...chat.messages, message],
                updatedAt: new Date().toISOString(),
                lastUpdatedById: message.userId || null
              }
            : chat
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });

      // Also update the currently viewed chat if it's the same one
      if (selectedChat?.id === message.chatId) {
        console.log("[Client] selectedChat.id:", selectedChat?.id, "message.chatId:", message.chatId);

        setSelectedChat(prev =>
          prev ? { ...prev, messages: [...prev.messages, message] } : null
        );
      }
    };

    // Attach listener for new messages
    socket.on('newMessage', handleNewMessage);
    console.log("[Client] handleNewMessage event listener attached");

    // Detach on cleanup
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [selectedChat, currentUserId]); 



  
  



  /********* FUNCTIONS *********/



  // Function to open the new chat popup
  const openPopup = () => {
    setIsPopupOpen(true);
  };

  // Function to close the new chat popup
  const closePopup = () => {
    setIsPopupOpen(false);
  };
 

  /*
    This function handles sending a new message from the user to a selected chat. 
      It:
        Creates the message data object.

        Emits the message via WebSocket to the backend server.

        Optimistically updates the local chat and message state to reflect the new message.

        Triggers push notifications for all other users in the chat (except the sender), 
        with different messaging depending on whether it's a group chat or private conversation.
  */

  const handleSendMessage = async () => {
    // Get token for authenticated requests
    const token = localStorage.getItem('token');

    // Proceed only if message isn't empty and a chat is selected
    if (currentMessage.trim() && selectedChat) {
      try {
        // Construct message object for local state
        const messageData: Message = {
          id: Date.now(), // Use a unique ID generator
          content: currentMessage.trim(),
          createdAt: new Date().toISOString(),
          userId: currentUserId || 0, // Fallback in case currentUserId is undefined
          chatId: selectedChat.id,
          liked: false,
          system: false,
          isButton: false
        };
        console.log("[Client] Emitting newMessage to server...!!!");
        
        // Send the message to server via WebSocket
        socket.emit(
          'message',
          {
            chatId: selectedChat.id,
            content: currentMessage,
            userId: currentUserId,
            token,
          },
          (response: { success: boolean; message?: string; updatedChat?: any; error?: string }) => {
            if (response.success) {
              console.log('[Client] Message send success. Full message:', response.message);
              console.log('[Client] Updated chat from server:', response.updatedChat);
            } else {
              console.error('[Client] Message send failed:', response.error);
            }
          }
        );

        // Clear input field
        setCurrentMessage('');
        
        
        // Update the selectedChat to include the new message
        setSelectedChat((prevSelectedChat) =>
          prevSelectedChat
            ? { ...prevSelectedChat, messages: [...(prevSelectedChat.messages || []), messageData] }
            : null
        );

        // Update the chats list with new message and re-sort by updatedAt
        setChats((prevChats) => {
          const updatedChats = prevChats.map((chat) =>
            chat.id === selectedChat.id
              ? {
                  ...chat,
                  messages: [...(chat.messages || []), messageData],
                  updatedAt: new Date().toISOString(), // Set new update time
                  lastUpdatedById: currentUserId,
                }
              : chat
          );
          // Sort chats by updatedAt (most recent first)
          return updatedChats.sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        });
        

        // Clear the message field again (redundant but safe)
        setCurrentMessage('');


    // ================== Notification Handling ==================
    console.log('Sending notification request to backend...');

    // Derive sender name from chat user list
    let senderName = "Unknown Sender";
    if (selectedChat.users && currentUserId) {
      const sender = selectedChat.users.find((user) => user.id === currentUserId);
      if (sender) {
        senderName = `${sender.firstName} ${sender.lastName}`;
      }
    }

    console.log('Sender name for notification:', senderName);

    // Filter recipients to exclude the sender
    const recipients = selectedChat.users.filter((user) => user.id !== currentUserId);

    if (recipients.length > 0) {
      
      const isGroupChat = selectedChat.users.length > 2;
      // Retrieve chat name for group notification
      const chatName = await getChatName(selectedChat);

      // Create the notification message
      let notificationMessage = `New message from ${senderName}`;
      if (isGroupChat) {
        notificationMessage += ` in ${chatName}`;
      }

      const chatID = selectedChat.id;
      
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
  // This function determines the display name for a chat. If the chat is a study group, it fetches the group name from the backend. 
  // Otherwise, for one-on-one chats, it constructs the name using the other user's first and last name.
  // - If the chat is part of a study group, it fetches the group name from the backend.
  // - If it's a private (non-group) chat, it returns the full name of the other user.
  // - Caches study group names in state to avoid redundant network requests.

  const getChatName = async (chat: Chat) => {
    try {
      // Attempt to get the study group name from the backend using the chat ID
      const response = await axios.get(`${REACT_APP_API_URL}/api/study-groups/chat/${chat.id}`);
      // If a name is returned, store it in state for future reference and return it
      if (response.data.name) {
        setStudyGroupNames((prev) => ({ ...prev, [chat.id]: response.data.name }));
        return response.data.name;
      }
    } catch (error) {
      console.error("Error fetching study group name:", error);
    }
    
    // If no group name was found, return the name of the other user in a 1-on-1 chat
    if (currentUserId) {
      const otherUser = chat.users?.find((user) => user.id !== currentUserId);
      console.log('Other user:', otherUser);
      if (otherUser) {
          return `${otherUser.firstName} ${otherUser.lastName}`;
      }
    }
    // Default to empty string if name cannot be resolved
    return " ";
  };


  /*
    This function determines the profile picture (PFP) to display for a chat. 
    It checks if the chat is part of a study group and returns the study group's profile picture if available. 
    For private chats, it returns the other user's profile picture or a generic fallback.
    - For study groups, it returns the group's profile picture if available.
    - For private chats, it returns the profile picture of the other user.
    - Falls back to generic images if no custom pictures are found.
  */
    // Used to access the study group name or chat name for displaying properly on the UI
  const getChatPfp = async (chat: Chat) => {
    try {
      // Attempt to get study group profile picture info using the chat ID
      const response = await axios.get(`${REACT_APP_API_URL}/api/study-groups/chat/${chat.id}`);
      console.log("PFP TEST", response)
      // setStudyGroupPfps((prev) => ({
      //   ...prev,
      //   [chat.id]: response.data.profilePic ? response.data.profilePic : genericStudyGroupPfp
      // }));

      // If the chat is linked to a study group, return its custom profile picture or the generic one
      if (response.data.studyGroupID !== null) {
        return response.data.profilePic ? response.data.profilePic : genericStudyGroupPfp;
      }


    } catch (error) {
      console.error("Error fetching study group name:", error);
    }

    // If not a study group, return the other user's profile picture for private chats
    if (currentUserId) {
      const otherUser = chat.users?.find((user) => user.id !== currentUserId);
      console.log('Other user PFPPFP:', otherUser);
      if (otherUser) {
        console.log(otherUser.profilePic)
        return `${otherUser.profilePic ?  otherUser.profilePic : genericUserPfp}`;
      }
    }
    // Default to empty string if no image can be determined
    return " ";
  };
  
  
  // Deletes a chat based on its chat ID.
  // - Verifies if the user is authenticated via token.
  // - Sends a DELETE request to the backend to remove the chat.
  // - Calls a local function to update the UI state after deletion.

  const handleDeleteChat = async (chatId: number) => {
    try {
      // Retrieve the token from local storage
      const token = localStorage.getItem('token');
      // If no token is found, show an alert and exit the function
      if (!token) {
        // alert('You need to be logged in to delete a chat.');
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          { id: Date.now(), alertText: 'You need to be logged in to delete a chat.', alertSeverity: 'error', visible: true },
        ]);
        return;
      }

      // Send a DELETE request to the backend API to delete the chat
      await axios.delete(`${REACT_APP_API_URL}/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update the local chat state after successful deletion
      updateChats(chatId);
    } catch (error) {
      console.error('Error deleting chat:', error);
      // Log server response if available
      if (axios.isAxiosError(error) && error.response) {
        console.error('Server responded with:', error.response.data);
      }
    }
  };


  // Retrieves the users for the user panel based on the chat ID.
  // - Verifies user authentication via token.
  // - Fetches the study group associated with the given chat.
  // - Then fetches and filters the list of users in the study group.
  // - Updates the UI to display these users (excluding the current user)

  const handleGetUsers = async (chatId: number) => {
    try {
      // Get the authentication token from local storage
      const token = localStorage.getItem('token');
      // If token is missing, display an error alert and exit
      if (!token) {
        // alert('You need to be logged in to view users.');
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          { id: Date.now(), alertText: 'You need to be logged in to view users.', alertSeverity: 'error', visible: true },
        ]);
        return;
      }
  
      // Step 1: Get the study group ID associated with the provided chat ID
      const response = await axios.get(
        `${REACT_APP_API_URL}/api/study-groups/chat/${chatId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
  
      const data = response.data;
      const groupId = data.studyGroupID;
      setGroupId(data.studyGroupID);
     

      // Step 2: Get the users associated with the retrieved study group ID
      const res = await axios.get(
        `${REACT_APP_API_URL}/api/study-groups/${groupId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const dat = res.data;
     
      // Filter out the current user from the list of users
      setSelectedChatUsers(
        dat.studyGroup.users.filter((user: User) => user.id !== currentUserId)
      );
      
      // Open the user panel to show the list of group members
      setIsUserPanelVisible(true);
    } catch (error) {
      console.error('Error fetching users:', error);
      // alert('Failed to load users.');
      // Display a failure alert if anything goes wrong
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        { id: Date.now(), alertText: 'Failed to load users', alertSeverity: 'error', visible: true },
      ]);
      
    }
  };
  


  /*
    Is responsible for creating a new study group based on the currently selected chat and linking it to that chat.
  */

  const handleCreateStudyGroup = async (chatId: number) : Promise<number | void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Show error alert if user is not logged in
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          { id: Date.now(), alertText: 'You need to be logged in to create a study group.', alertSeverity: 'error', visible: true },
        ]);
        return;
      }

      if (!selectedChat) {
        // Show error alert if no chat is selected
        alert('No chat selected.');
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          { id: Date.now(), alertText: 'No chat selected', alertSeverity: 'error', visible: true },
        ]);
        return;
      }

      console.log("Chat object:", selectedChat);

      // Fetch up-to-date chat details from the server
      const chatResponse = await axios.get(`${REACT_APP_API_URL}/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("mew Chat object:", chatResponse.data);

      // Prepare the payload for creating a study group
      const studyGroupPayload = {
        name: chatResponse.data.name,
        subject: '',
        description: '',
        users: chatResponse.data.users.map((user: User) => user.id),
        chatID: selectedChat.id,
      };

      console.log('Creating study group with payload:', studyGroupPayload);

      // Send request to create the new study group
      const response = await axios.post(
        `${REACT_APP_API_URL}/api/study-groups`,
        studyGroupPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Retrieve the new study group ID from the response
      let newStudyGroupID = response.data.studyGroup.id

      console.log('new study group ID', newStudyGroupID);

      // Update the existing chat to associate it with the new study group
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

      // Update state to reflect that a study group has been created
      if (!error) {
        setHasStudyGroup(true);
      }

      // Return the ID of the newly created study group
      return newStudyGroupID;

    } catch (error) {
      // Handle and log any errors during the process
      console.error('Error creating study group:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Server responded with:', error.response.data);
      }
    }
  };


  // Checks if a chat has a linked study group
  /*
  This function checks whether the currently selected chat is already linked to a study group. 
  It makes a GET request to the API using the chat's ID, and then updates relevant state variables to reflect
  whether the chat has an associated study group.
  */

  const checkStudyGroup = async () => {
    console.log('Checking study group for chat:', selectedChat);
    // If no chat is selected, assume no study group
    if(!selectedChat) {
      return setHasStudyGroup(false);
    }
    try {
      // Call backend API to check if a study group exists for the selected chat
      const response = await fetch(`${REACT_APP_API_URL}/api/study-groups/chat/${selectedChat.id}`); // Fetching chat details by chat ID
      const data = await response.json();
      console.log('Study group check result:', data);
      setCurrentGroupId(data.studyGroupID);

  
      // If response is successful and study group ID exists, set state accordingly
      if (response.ok && data.studyGroupID) {
        setHasStudyGroup(true); // There is a study group linked
        console.log('setStudyGroupCheck:', hasStudyGroup);
      } else {
        setHasStudyGroup(false); // No study group linked to this chat
      }
    } catch (error) {
      // In case of error, assume no group and log
      console.error("Error checking study group:", error);
      setHasStudyGroup(false); // Assume no study group if there's an error
    }
  };


  // Handle double click to like a message
  /*
    This function handles a double-click event on a message to toggle its "liked" state (i.e., heart/unheart). 
    It first checks if the user is logged in, then sends a PATCH request to update the like status. 
    On success, it updates local state to reflect the new like status visually.
  */

  const handleDoubleClick = async (messageId: number) => {
    // Show alert if user is not logged in
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
      // Send PATCH request to toggle like status of the message
      const response = await fetch(`${REACT_APP_API_URL}/api/messages/${messageId}/like`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' , Authorization: `Bearer ${token}`},
        body: JSON.stringify({ liked: !heartedMessages[messageId] }), // Toggle liked
      });
  
      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error('Failed to update like status');
      }
  
      // Update UI state to reflect like change
      setHeartedMessages((prev) => ({
        ...prev,
        [messageId]: !prev[messageId], // Toggle heart UI
      }));
    } catch (error) {
      console.error('Error updating like status:', error);
    }
    
  };


  // Used for retrieving names for putting names above sent messages
  /*
    This function retrieves a user's full name and profile picture using their user ID. 
    It's used to display the sender's name and picture above messages in the chat. 
    The result is stored in msgUsernames and msgPfps state maps for fast access.
  */

  const handleGetMessageUsername = async (userId: number) => {
    // Ignore if userId is undefined (e.g., system messages or missing data)
    if (userId === undefined) return;

    try {
      // Call the backend to fetch user info
      const response = await axios.get(`${REACT_APP_API_URL}/api/users/${userId}`);
      // Combine first and last name
      const username = response.data.firstName + " " + response.data.lastName;
      // Use profilePic if available, otherwise fall back to generic one
      const pfp = response.data.profilePic || genericUserPfp;
      // Update state maps for message sender display
      setMsgUsernames((prev) => ({ ...prev, [userId]: username }));
      setMsgPfps((prev) => ({ ...prev, [userId]: pfp }));
      //console.log(username);
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  };


  /*
    This function retrieves a user's full name based on their ID—but it is specifically used in the chat UI context 
    (e.g., for participants shown in the chat header or list). The username is stored in chatUsernames state.
  */

  const handleGetChatUsername = async (userId: number) => {
    // Ignore if userId is undefined
    if (userId === undefined) return;
    console.log("fetching username for user" , userId);

    try {
      // Request user info from backend
      const response = await axios.get(`${REACT_APP_API_URL}/api/users/${userId}`);
      // Combine first and last name into full username
      const username = response.data.firstName + " " + response.data.lastName;
      // Update chat usernames map in state
      setChatUsernames((prev) => ({ ...prev, [userId]: username }));
      //console.log(username);
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  };


  /*
    This function updates the display name of a chat. 
    It's used to reflect name changes in the UI after a user edits a study group or chat.
  */

  const updateChatName = (chatId: number, newName: string) => {
    // Update the name for the specific chat ID in the chatNames state map
    setChatNames((prevChatNames) => ({
      ...prevChatNames,
      [chatId]: newName,
    }));
  };


  /*
    Removes a user from the list of selected users in the current chat.
    This is useful when modifying a study group or managing participants.
  */

  const updateUsers = (userId: number) => {
    // Removes a user from the selectedChatUsers list by filtering them out
    setSelectedChatUsers(prevUsers => (prevUsers || []).filter(user => user.id !== userId));
  };
  

  /*
    Removes a chat from the list of chats in the UI. 
    If the currently selected chat is being removed, it clears the selection.
  */

  const updateChats = (chatId: number) => {
    // updates the displayed chats to delete the chat from the UI
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
    // If the deleted chat was selected, clear the selected chat
    if (selectedChat?.id === chatId) {
      setSelectedChat(null);
    }
  }


  //deletes a user from a study group
  /*
    This function removes a user from a study group both on the server and in the UI. 
    It handles updating the list of chat participants, sends a system message indicating the user left or was removed, 
    and performs cleanup if the group is deleted as a result.
  */

  const removeUser = async (userId: number, groupId: number | null) => {
    if (!groupId) {
      console.error('Group ID is missing.');
      return;
    }
  
    try {
      // Attempt to fetch the associated chat ID for the study group (if available)
      const chatIdResponse = await axios.get(`${REACT_APP_API_URL}/api/study-groups/${groupId}/chat`).catch(() => null);
      const chatId = chatIdResponse?.data?.chatId;
      // Make a DELETE request to remove the user from the study group
      const response = await axios.delete(`${REACT_APP_API_URL}/api/study-groups/${groupId}/users/${userId}`);
  
      if (response.status === 200) {
        // Remove user from chat UI
        if(selectedChat?.id === chatId){
          setSelectedChatUsers((prevUsers) => (prevUsers || []).filter(user => user.id !== userId));
        }
    
        

        // Create an appropriate system message
        const username = chatUsernames[userId] || "Unknown";
        const mess = userId === currentUserId
          ? `${username} left the group.`
          : `${username} was removed from the group.`;
  
        // Check if the group still exists after the user is removed
        const groupCheck = await axios.get(`${REACT_APP_API_URL}/api/study-groups/${groupId}`).catch(() => null);
        console.log("GROUP CHECKKKKK", groupCheck);
  
        if (groupCheck?.status === 200) {
          // Group still exists — update the message and optionally send a system notification
          const chatIdResponse = await axios.get(`${REACT_APP_API_URL}/api/study-groups/${groupId}/chat`).catch(() => null);
          const chatId = chatIdResponse?.data?.chatId;
  
          setUpdateMessage(mess);
  
          if (chatId) {
            if(chatId === selectedChat?.id){
              handleSendSystemMessage(mess, chatId, setSelectedChat, setChats, setUpdateMessage);
            }
            else{
              handleSendSystemMessage(mess, chatId);
            }
          
            // Only update UI if selected chat matches the group being modified
            if (selectedChat?.id === chatId && userId === currentUserId) {
              setSelectedChat(null);
            }
          }
        } else {
          // Group no longer exists — clear chat and UI
          setSelectedChat(null);
          if (chatId) {
            setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
          }        
          setIsUserPanelVisible(false);
        }
      } else {
        console.error('Failed to delete the user.');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };
  

  /*
    Triggers message sending when the user presses the Enter key inside the input field.
  */

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage(); // Call the message sending function
    }
  };


  // Placeholder for "+" button logic (e.g., open menu, attachment panel, etc.)
  const handlePlusSelect = () => {
    return
  }


  /*
    Handles actions triggered by dynamic buttons inside chat messages (e.g., open calendar, scheduler).
    The button's action prop encodes an action type and optional URL, separated by a comma.
  */

  const handleButtonClick = (action: string | undefined, studyGroupId: number | undefined | null) => {
    if (action == undefined) {
      console.log("no button action")
      return
    }
    // Split the action string into an action type and an optional event URL
      const [actionType, eventURL] = action.split(',');
      console.log("Action Type:", actionType);
      console.log("Event URL:", eventURL);

    switch (actionType) {
      case "weekly-scheduler":
        // Open the weekly scheduler modal if a study group is linked
        if (studyGroupId) {
          openWeeklyScheduler(studyGroupId);
        } else {
          console.error("Study group ID is missing for weekly scheduler action.");
        }
        break;
  
      case "calendar-event":
        // Open a calendar event modal or redirect
        openCalendarEvent(eventURL);

        break;
  
      default:
        console.warn(`Unhandled button action: ${action}`);
    }
  };


  /*
    Sends a special button-type message to the current chat using helper handleSendButtonMessage.
    Ensures a chat is selected before dispatching the message.
  */

  const handleButtonMessage = (buttonData: { action: string; studyGroupId?: number | undefined; label: string }) => {
    console.log('inHandlebuttonmessage')
    if (!selectedChat?.id) return; // Ensure a chat is selected
    console.log('inHandlebuttonmessage twooo')

    // Delegate to external function that creates and dispatches the button message
    handleSendButtonMessage(buttonData, selectedChat.id, currentUserId, setSelectedChat, setChats, setUpdateMessage); // Now we call it here ✅
};


  
  // Function to open the Weekly Scheduler for a study group
  /*
    Navigates to the Weekly Scheduler page for a specific study group using React Router’s navigate function.
  */

  const openWeeklyScheduler = (studyGroupId: number) => {
    console.log(`Opening Weekly Scheduler for study group ID: ${studyGroupId}`);
    // <Link to={`/studyGroup/${groupId}/schedule`}>
    //         <button className='Availability-Button'> Availability </button>
    //       </Link>
    // Add logic to open the weekly scheduler modal/page

    // Redirect the user to the scheduler route for the given study group
    navigate(`/studyGroup/${studyGroupId}/schedule`);
  };


  /*
    Constructs a Google Calendar event creation URL with pre-filled info 
    (title, details, location, time) and opens it in a new tab.
  */

  const openGoogleCalendar = (studyGroupId: number) => {
    const title = encodeURIComponent("Study Group Meeting");
    const details = encodeURIComponent("Join the study session for our course!");
    const location = encodeURIComponent("Online / Library");
    
    // Format start time: now in YYYYMMDDTHHMMSSZ
    const startTime = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    // Format end time: one hour from now
    const endTime = new Date(new Date().getTime() + 60 * 60 * 1000)
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0] + "Z";
  
    // Construct the Google Calendar event URL
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startTime}/${endTime}`;
    
    // Open the Google Calendar event creation page in a new browser tab
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
              data-testid="custom-alert" 
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
              chatPfps={chatPfps}
              loadingChatList={loadingChatList}
              removeUser={removeUser}
              updateChats = {updateChats}
            />
          )}

          <div className='newChat'>
            <button  className='newChatButton'  onClick={openPopup}>
              + New Chat
            </button>
          </div>
          </div>

          {isPopupOpen && (
            <>
              <div className="matches-popup-overlay" onClick={closePopup}></div>
              <div className="matches-popup">
                <div className="matches-popup-header">
                  <h3>Potential New Chats</h3>
                  <button className="matches-popup-close" onClick={closePopup}>×</button>
                </div>
                <NewChatList 
                  handleSelectUser={() => {}} 
                  onClose={closePopup} 
                  />
              </div>
            </>
          )}
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
                        if (currentGroupId) {
                          navigate(`/groups?groupId=${currentGroupId}&tab=true`);
                        }
                      }}
                    >
                      Edit Study Group
                    </button>
                  ) : (
                    <button
                      className="CreateStudyGroupButton"
                      onClick={() => {
                        
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
                      handleCreateStudyGroup = {handleCreateStudyGroup}
                      setCurrentGroupId={(id:any) => setCurrentGroupId(id)}
                    />
                  </div>
                )}

              </div>


              <div className="ChatWindow" ref={chatWindowRef}>
                {selectedChat ? (
                  // If selectedChat exists
                  Array.isArray(selectedChat.messages) ? (
                    selectedChat.messages.length > 0 ? (
                      selectedChat.messages.map((message, index) => {
                        const isLastInCluster =
                          index === selectedChat.messages.length - 1 || // Last message overall
                          selectedChat.messages[index + 1].userId !== message.userId; // Next message is from a different user


                        return (
                          <div key={index} className={`Message-pfp-container ${message.userId === currentUserId ? 'MyMessage-pfp-container' : ''}`}>

                            <div className="MessageContainer">
                              { }
                            {!message.system && (index === 0 || selectedChat.messages[index - 1].userId !== message.userId) && (
                              <div className={`message-username ${message.userId === currentUserId ? 'MyUsername' : ''}`}>
                                {message.userId !== undefined && msgUsernames[message.userId] ? msgUsernames[message.userId] : "Loading..."}
                                {/* {message.userId !== undefined && msgPfps[message.userId] ? (
                                <img src={msgPfps[message.userId] } className="message-pfp" alt="" height={"40px"} />
                            )
                              : "Loading..."} */}
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

                                      // Check if the line contains a colon
                                      if (line.includes(":")) {
                                        const [label, ...valueParts] = line.split(":");
                                        const value = valueParts.join(":").trim(); // Join back if there are additional colons

                                        return (
                                          <div key={index}>
                                            {/* <span style={{ fontWeight: "bold" }}>{label}: </span>
                                          <span style={{ fontWeight: "normal" }}>{value}</span>
                                          <br /> */}

                                            <div className="calendarDetails">
                                              <label>{label}</label>
                                              <p>{value}</p>
                                            </div>
                                          </div>
                                        );
                                      } else {
                                        // If no colon, just display the line as is without a colon
                                        return (
                                          <div key={index}>
                                            <span>{line}</span>
                                            <br />
                                          </div>
                                        );
                                      }
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
                            
                          
                            {message.userId !== currentUserId ? (
                              !message.system && isLastInCluster ? (
                                <div
                                  className={`profilePic ${
                                    message.userId === currentUserId ? "MyProfilePic" : ""
                                  }`}
                                >
                                  {message.userId !== undefined && msgPfps[message.userId] ? (
                                    <img
                                      src={msgPfps[message.userId]}
                                      className="message-pfp"
                                      alt=""
                                      height={"40px"}
                                    />
                                  ) : (
                                    "Loading..."
                                  )}
                                </div>
                              ) : (
                                <div className="pfp-placeholder"></div> // Keeps spacing consistent
                              )
                            ) : <div className='MyProfilePic'>
                              </div>}
                          </div>
                        )
                      })
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
              <div className="ChatInput" data-testid="chat-input">

                <PlusButtonProps
                  onSelect={handlePlusSelect}
                  studyGroupId={currentGroupId}
                  selectedChatId={selectedChat.id}
                  onSendButtonMessage={handleButtonMessage}
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