import { useState } from 'react';
import Navbar from '../components/Navbar';
import CopyrightFooter from '../components/CopyrightFooter'; 

const UpdateEmail = () => {
  const [oldEmail, setOldEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOldEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOldEmail(e.target.value);
  };

  const handleNewEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:2020/api/update-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Send the JWT token in the Authorization header
        },
        body: JSON.stringify({
          oldEmail,
          newEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred');
      } else {
        // Successfully updated email, handle success (e.g., navigate to another page or show a success message)
        alert('Email updated successfully');
      }
    } catch (err) {
      setError('Failed to update email. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header>
        <Navbar />
      </header>
      <div className="login">
        <div className="container">
          <h1 className="l1">Update Email</h1>
          <form onSubmit={handleSubmit}>
            <label>Old Email</label>
            <input 
              type="email"
              placeholder="JohnDoe123@email.com"
              value={oldEmail}
              onChange={handleOldEmailChange}
              required
            />
            <label>New Email</label>
            <input
              type="email"
              placeholder="JohnDoe1234@email.com"
              value={newEmail}
              onChange={handleNewEmailChange}
              required
            />
            {error && <p className="error">{error}</p>}

            <button className="lButton" type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Email"}
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

export default UpdateEmail;
