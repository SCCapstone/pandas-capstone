import React, { useState, useEffect } from 'react';
import './NotificationDropdown.css';

// Define notification types
enum NotificationType {
  Match = "Match",
  Message = "Message",
  StudyGroup = "StudyGroup"
}

// Notification interface
interface Notification {
  id: number;
  message: string;
  read: boolean;
  created_at: string;
  type: NotificationType;
}

interface NotificationDropdownProps {
  setNotifCount: React.Dispatch<React.SetStateAction<number>>;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ setNotifCount }) => {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
        setNotifs(data);
      } catch (err) {
        setError('Error loading notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleSelectNotif = async (notif: Notification) => {
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

      setNotifs((prevNotifs) => prevNotifs.filter((n) => n.id !== notif.id));
      setNotifCount((prevCount) => prevCount - 1);
    } catch (error) {
      console.error('Error deleting notification:', error);
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
    <div>
      <ul className="notif-dropdown">
        {loading && <p>Loading notifications...</p>}
        {error && <p>{error}</p>}
        {notifs.length === 0 && !loading && <p id="none">No new notifications</p>}
        {notifs.map((notif) => (
          <li key={notif.id} onClick={() => handleSelectNotif(notif)} className={notif.read ? 'read' : 'unread'}>
            <span className="notif-icon">{getNotificationIcon(notif.type)}</span>
            <p>{notif.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationDropdown;
