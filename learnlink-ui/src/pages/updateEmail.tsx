import { useState } from 'react';
import Navbar from '../components/Navbar';
import CopyrightFooter from '../components/CopyrightFooter'; 
import './updateEmail.css';
import CustomAlert from '../components/CustomAlert';

const UpdateEmail: React.FC = () => {
    // Declaring state variables to store old email, new email, error messages, loading state, and alerts
  const [oldEmail, setOldEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
  const alertVisible = alerts.some(alert => alert.visible);

  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

    // Function to handle change in old email input field
  const handleOldEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOldEmail(e.target.value);
  };

    // Function to handle change in new email input field
  const handleNewEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEmail(e.target.value);
  };

    // Function to validate email input, ensuring old and new emails are not the same
  const validateEmail = (): boolean => {
  
    if (oldEmail === newEmail) {
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        { id: Date.now(), alertText: 'New email must be different than old email', alertSeverity: "error", visible: true },
    ]);
      return false;
    }
  
    return true;
  };


    // Function to handle form submission for updating email
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    // if (!validateEmail()) {
    //   return;
    // }

    try {
            // Make an API request to update the email
      const response = await fetch(`${REACT_APP_API_URL}/api/update-email`, {
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
      console.log(data.err)

      if (!response.ok) {
                // Handle different error status codes from the API
        switch (response.status) {

          case 451:
            setAlerts((prevAlerts) => [
              ...prevAlerts,
              {
                id: Date.now(),
                alertText: data.error || "Something went wrong.",
                alertSeverity: "error",
                visible: true,
              },
            ]);
            break;

          case 452:
            setAlerts((prevAlerts) => [
              ...prevAlerts,
              {
                id: Date.now(),
                alertText: data.error || "Something went wrong.",
                alertSeverity: "warning",
                visible: true,
              },
            ]);
            break;

          case 453:
            setAlerts((prevAlerts) => [
              ...prevAlerts,
              {
                id: Date.now(),
                alertText: data.error || "Something went wrong.",
                alertSeverity: "error",
                visible: true,
              },
            ]);
            break;

          case 454:
            setAlerts((prevAlerts) => [
              ...prevAlerts,
              {
                id: Date.now(),
                alertText: data.error || "Something went wrong.",
                alertSeverity: "error",
                visible: true,
              },
            ]);
            break;

          default:
            setError(data.error || 'An error occurred');
            setAlerts((prevAlerts) => [
              ...prevAlerts,
              { id: Date.now(), alertText: 'An error occurred', alertSeverity: "error", visible: true },
            ]);
        }
    } else {
      // Successfully updated email, handle success (e.g., navigate to another page or show a success message)
      // alert('Email updated successfully');
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        { id: Date.now(), alertText: 'Email updated successfully', alertSeverity: "success", visible: true },
      ]);
      }
    } catch (err) {
            // Handle network errors or any other issues
      setError('Failed to update email. Please try again later.');
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        { id: Date.now(), alertText: 'Failed to update email. Please try again later. ', alertSeverity: "error", visible: true },
    ]);
    } finally {
            // Reset loading state
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <header>
        <Navbar />
      </header>
      <main className="content">
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
        <div className="update-email">
          <h1 className="p1">Update Email</h1>
          <div className="update-email-container">
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
            {/* {error && <p className="error">{error}</p>} */}

            <button className="lButton" type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Email"}
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

export default UpdateEmail;
