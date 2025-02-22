import './NotificationDropdown.css';
import { useState, useEffect } from 'react';

interface Notification {
  id: number;
  message: string;
  read: boolean;
  created_at: string;
}

const NotificationDropdown: React.FC = () => {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

  useEffect(() => {
    const fetchNotifications = async () => {
      console.log('Fetching notifications...');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found.');
          setError('Unauthorized: No token found');
          setLoading(false);
          return;
        }

        const response = await fetch(`${REACT_APP_API_URL}/api/notifications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response from server:', errorText);
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched notifications:', data); // Debugging log
        setNotifs(data);
      } catch (err) {
        console.error('Error loading notifications:', err);
        setError('Error loading notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []); // Runs once when component mounts

  // Handle notification click (delete notification)
  // TODO - when you click I want it to also take you to the chat
  const handleSelectNotif = async (notif: Notification) => {
    try {
      console.log('Deleting notification with ID:', notif.id);

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found.');
        return;
      }

      const response = await fetch(`${REACT_APP_API_URL}/api/notifications/delete/${notif.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to delete notification:', await response.text());
        return;
      }

      console.log('Notification deleted successfully:', notif.id);

      // Update state to reflect the deletion in UI
      setNotifs((prevNotifs) => prevNotifs.filter((n) => n.id !== notif.id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <div>
      <ul className="notif-dropdown">
        {loading && <p>Loading notifications...</p>}
        {error && <p>{error}</p>}
        {notifs.length === 0 && !loading && <p id="none">No new notifications</p>}
        {notifs.map((notif) => (
          <li key={notif.id} onClick={() => handleSelectNotif(notif)} className={notif.read ? 'read' : 'unread'}>
            <p>{notif.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationDropdown;
