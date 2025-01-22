import { useState } from 'react';
import Navbar from '../components/Navbar';
import CopyrightFooter from '../components/CopyrightFooter'; 
import './changePassword.css';

const ChangePassword: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL;


  const handleOldPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOldPassword(e.target.value);
  };

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
        setError(data.error || 'An error occurred');
      } else {
        // Successfully updated password, handle success (e.g., navigate to another page or show a success message)
        alert('Password updated successfully');
      }
    } catch (err) {
      setError('Failed to update password. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header>
        <Navbar />
      </header>
      <div className="update-password">
        <div className="update-password-container">
          <h1 className="p1">Update Password</h1>
          <form onSubmit={handleSubmit}>
            <label>Old Password</label>
            <input 
              type="password"
              placeholder="********"
              value={oldPassword}
              onChange={handleOldPasswordChange}
              required
            />
            <label>New Password</label>
            <input
              type="password"
              placeholder="********"
              value={newPassword}
              onChange={handleNewPasswordChange}
              required
            />
            {error && <p className="error">{error}</p>}

            <button className="lButton" type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
      <div>
        <CopyrightFooter />
      </div>
    </div>
  );
}

export default ChangePassword;
