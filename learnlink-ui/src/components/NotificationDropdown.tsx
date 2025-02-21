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

  // Fetch notifications from the backend
  useEffect(() => {
    const fetchNotifications = async () => {
        try {
          const token = localStorage.getItem('token');
          const userResponse = await fetch(`${REACT_APP_API_URL}/api/notifications`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
      
          if (!userResponse.ok) {
            const errorText = await userResponse.text();
            console.error('Error response:', errorText);
            throw new Error(`Error: ${userResponse.status}`);
          }
      
          const data = await userResponse.json();
          console.log('Fetched notifications:', data); // Log the data here to see what is returned
          setNotifs(data);
        } catch (err) {
          console.error('Error loading notifications:', err);
          setError('Error loading notifications');
        } finally {
          setLoading(false);
        }
      };
      

    fetchNotifications();
  }, []); // Empty dependency array ensures this runs once when the component mounts

  // Handle selecting a notification
  const handleSelectNotif = (notif: Notification) => {
    // Mark as read or take other actions based on the selected notification
    console.log('Selected notification:', notif);
  };

  return (
    <div>
      <ul className="notif-dropdown">
        {loading && <p>Loading notifications...</p>}
        {error && <p>{error}</p>}
        {notifs.length === 0 && !loading && <p>No new notifications</p>}
        {notifs.map((notif) => (
          <li key={notif.id} onClick={() => handleSelectNotif(notif)}>
            <p>{notif.message}</p>
            <p>{new Date(notif.created_at).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationDropdown;