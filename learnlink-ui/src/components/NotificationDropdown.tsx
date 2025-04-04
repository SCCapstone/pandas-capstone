import React, { useState, useEffect } from 'react';
import './NotificationDropdown.css';
import { FaXmark } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Define notification types
enum NotificationType {
  Match = "Match",
  Message = "Message",
  StudyGroup = "StudyGroup"
}

// Notification interface
interface Notification {
  id: number;
  user_id: number;
  other_id: number;
  message: string;
  read: boolean;
  created_at: string;
  type: NotificationType;
  chatID: number;
  studyGroupID: number;
}

interface NotificationDropdownProps {
  setNotifCount: React.Dispatch<React.SetStateAction<number>>;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ setNotifCount }) => {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Unauthorized: No token found');
          setLoading(false);
          return;
        }

        const response = await fetch(`${REACT_APP_API_URL}/api/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const data = await response.json();
        console.log(data);
        setNotifs(data);
      } catch (err) {
        setError('Error loading notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);


  const handleDeleteNotif = async(notif: Notification) => {
    try{
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${REACT_APP_API_URL}/api/notifications/delete/${notif.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) return;

      setNotifs((prevNotifs) => prevNotifs.filter((n) => n.id !== notif.id));
      setNotifCount((prevCount) => prevCount - 1);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleSelectNotif = async (notif: Notification) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      if (notif.type === NotificationType.Message){
        navigate(`/messaging?selectedChatId=${notif.chatID}`);
      }
      else if (notif.type === NotificationType.Match) {
        navigate('/network?tab=receivedRequests');
      }
      else if (notif.type === NotificationType.StudyGroup) {
        console.log("OTHER::: ", notif.other_id);
        if(notif.studyGroupID){
          navigate(`/groups?groupId=${notif.studyGroupID}&tab=false`);
        }
        
        else if (notif.other_id) {
          const chatCheckResponse = await axios.get(`${REACT_APP_API_URL}/api/chats/check`, {
            params: { userId1: notif.user_id, userId2: notif.other_id },
          });
    
          console.log(chatCheckResponse.data);
          if (chatCheckResponse.data.exists) {
            console.log("A chat with this user already exists.");

            navigate(`/messaging?selectedChatId=${chatCheckResponse.data.chatId}`);
            
            return; // Stop function execution
          }
      }
    }
      
   handleDeleteNotif(notif);
  } catch (error) {
    console.error('Error selecting notification:', error);
  }
  };



  const handleClearAll = async () => {
    try {
      setNotifs([]);
    
      const token = localStorage.getItem('token');
      if (!token) return;
    
      const response = await fetch(`${REACT_APP_API_URL}/api/notifications/deleteAll`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    
      if (!response.ok) {
        throw new Error('Error clearing notifications');
      }
    
      const data = await response.json();
      console.log('Notifications cleared:', data);
  
      setNotifCount(0);
    
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };
  
  
  

  // Map NotificationType to emoji icons
  const getNotificationIcon = (type: NotificationType) => {
    let icon;
    switch (type) {
      case NotificationType.Match:
        icon = "🔗";
        break;
      case NotificationType.Message:
        icon = "✉️";
        break;
      case NotificationType.StudyGroup:
        icon = "📚";
        break;
      default:
        icon = "🔔";
        break;
    }
    return icon;
  };

  return (
    <div className="notif-dropdown">
      {error && <p>{error}</p>}
      {notifs.length > 0 && (
        <button className="clear-all-btn" onClick={handleClearAll}>
          Clear All
        </button>
      )}
      <ul>
        {notifs.length === 0 && !loading && <div id="none">No new notifications</div>}
        {notifs.map((notif) => (
          <li key={notif.id} onClick={() => handleSelectNotif(notif)} className={notif.read ? 'read' : 'unread'}>
            <span className="notif-icon">{getNotificationIcon(notif.type)}</span>
            <p>{notif.message}</p>
            <button className="DeleteButton" onClick={(event: React.MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); handleDeleteNotif(notif);}}> <FaXmark /></button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationDropdown;
