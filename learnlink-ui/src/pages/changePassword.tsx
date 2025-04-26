import { useState } from 'react';
import Navbar from '../components/Navbar';
import CopyrightFooter from '../components/CopyrightFooter';
import CustomAlert from '../components/CustomAlert';
import './changePassword.css';

const ChangePassword: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
   
  // Backend API URL
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

  // Handlers for input fields
  const handleOldPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOldPassword(e.target.value);
  };

  // Handlers for input fields
  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${REACT_APP_API_URL}/api/update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Send the JWT token in the Authorization header
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle warnings or errors from the backend
        if (data.warning) {
          setError(data.warning || 'An error occurred');
          setAlerts((prevAlerts) => [
            ...prevAlerts,
            { id: Date.now(), alertText: data.warning || 'An error occurred', alertSeverity: "warning", visible: true },
          ]);
        } else {
          setError(data.error || 'An error occurred');
          setAlerts((prevAlerts) => [
            ...prevAlerts,
            { id: Date.now(), alertText: data.error || 'An error occurred', alertSeverity: "error", visible: true },
          ]);
        }
      } else {
        // Successfully updated password, handle success (e.g., navigate to another page or show a success message)
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          { id: Date.now(), alertText: data.error || 'Password updated successfully', alertSeverity: "success", visible: true },
        ]);
        // alert('Password updated successfully');
      }
    } catch (err) {
      setError('Failed to update password. Please try again later.');
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        { id: Date.now(), alertText: 'Failed to update password. Please try again later.', alertSeverity: 'error', visible: true },
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  // Check if any alert is currently visible
  const alertVisible = alerts.some(alert => alert.visible);

  return (
    <div className="page-container">
      <header>
        <Navbar />
      </header>
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
      <main className="content">
        <div className="change-password">
          <h1 className="p1">Change Password</h1>
          <div className="change-password-container">
            <form onSubmit={handleSubmit}>
              <label htmlFor="oldPassword">Old Password</label>
              <input
                id="oldPassword"
                type="password"
                placeholder="********"
                value={oldPassword}
                onChange={handleOldPasswordChange}
                required
              />
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                placeholder="********"
                value={newPassword}
                onChange={handleNewPasswordChange}
                required
              />
              {/* {error && <p className="error">{error}</p>} */}
              <button className="lButton" type="submit" disabled={loading}>
                {loading ? "Updating..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      </main>
      <footer>
        <CopyrightFooter />
      </footer>
  </div>

  );
}

export default ChangePassword;
