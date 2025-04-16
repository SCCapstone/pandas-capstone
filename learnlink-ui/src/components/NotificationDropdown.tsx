import React, { useState, useEffect } from 'react';
import './NotificationDropdown.css';
import { FaXmark } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Enum for notification types
enum NotificationType {
  Match = "Match",
  Message = "Message",
  StudyGroup = "StudyGroup"
}

// Notification interface for notification structure
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

  // useEffect hook to fetch notifications when the component is mounted
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
        setNotifs(data);
      } catch (err) {
        setError('Error loading notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []); // Empty dependency array ensures this runs once when component mounts

  // Deletes a notification from the UI and server
  const handleDeleteNotif = async (notif: Notification) => {
    try {
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

      // Update the notifications list after deletion
      setNotifs((prevNotifs) => prevNotifs.filter((n) => n.id !== notif.id));
      setNotifCount((prevCount) => prevCount - 1);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handles notification selection and navigates to the appropriate page based on notification type
  const handleSelectNotif = async (notif: Notification) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      handleDeleteNotif(notif); // Delete the notification from UI

      await new Promise(resolve => setTimeout(resolve, 100)); // Allow state update before navigation

      // Navigate to the correct page based on notification type
      if (notif.type === NotificationType.Message) {
        navigate(`/messaging?selectedChatId=${notif.chatID}`);
      } else if (notif.type === NotificationType.Match) {
        navigate('/network?tab=receivedRequests');
      } else if (notif.type === NotificationType.StudyGroup) {
        if (notif.studyGroupID) {
          navigate(`/groups?groupId=${notif.studyGroupID}&tab=false`);
        } else if (notif.other_id) {
          // Check if a chat exists for this user pair
          const chatCheckResponse = await axios.get(`${REACT_APP_API_URL}/api/chats/check`, {
            params: { userId1: notif.user_id, userId2: notif.other_id },
          });

          if (chatCheckResponse.data.exists) {
            navigate(`/messaging?selectedChatId=${chatCheckResponse.data.chatId}`);
          }
        }
      }
    } catch (error) {
      console.error('Error selecting notification:', error);
    }
  };

  // Clears all notifications from the UI and server
  const handleClearAll = async () => {
    try {
      setNotifs([]); // Clear notifications from UI

      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${REACT_APP_API_URL}/api/notifications/deleteAll`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error clearing notifications');
      setNotifCount(0); // Reset notification count
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Maps notification types to emoji for icons
  const getNotificationIcon = (type: NotificationType) => {
    let icon;
    switch (type) {
      case NotificationType.Match:
        icon = "🔗"; // Link icon for Match type
        break;
      case NotificationType.Message:
        icon = "✉️"; // Envelope icon for Message type
        break;
      case NotificationType.StudyGroup:
        icon = "📚"; // Book icon for StudyGroup type
        break;
      default:
        icon = "🔔"; // Default notification icon
        break;
    }
    return icon;
  };

  return (
    <div className="notif-dropdown">
      {error && <p>{error}</p>} {/* Show error message if any */}
      {notifs.length > 0 && (
        <button className="clear-all-btn" onClick={handleClearAll}>
          Clear All
        </button>
      )}
      <ul>
      {/* Show loading text if loading and not an error */}
      {loading && !error && <div data-testid="loading-text"></div>}

      {/* If not loading and no notifications, show no new notifications */}
      {!loading && notifs.length === 0 && <div id="none">No new notifications</div>}        {notifs.map((notif) => (
          <li key={notif.id} onClick={() => handleSelectNotif(notif)} className={notif.read ? 'read' : 'unread'}>
            <span className="notif-icon">{getNotificationIcon(notif.type)}</span>
            <p>{notif.message}</p>
            <button data-testid="delete-notifs" className="DeleteButton" onClick={(event: React.MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); handleDeleteNotif(notif); }}> <FaXmark /></button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationDropdown;
