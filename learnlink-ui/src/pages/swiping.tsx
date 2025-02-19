// LandingPage.tsx
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import './swiping.css';
import CopyrightFooter from '../components/CopyrightFooter';
import SwipeProfiles from '../components/SwipeProfiles';  // Import the SwipeProfiles component
import { getLoggedInUserId } from '../utils/auth';

const Swiping: React.FC = () => {
  const [userId, setUserId] = useState<number | null>(null);  // State to store the user's ID

  useEffect(() => {
    // Here, you'd normally fetch the user ID from authentication or session
    const loggedInUserId = getLoggedInUserId();
    ; // Replace with actual user logic, e.g., from context or local storage
    if (loggedInUserId) {
      console.log('Logged-in User ID:', loggedInUserId);
      setUserId(loggedInUserId);

    } else {
      console.log('User is not logged in or token is invalid');
    }
  }, []);

  return (
    <div className="swiping-page">
      <header className="header">
        <Navbar />
      </header>
      <main className="swipe-content">
        {!userId ? (
          <p>Loading user profile...</p>
        ) : (
          <SwipeProfiles userId={userId} />
        )}
      </main>
      <footer className="footer">
        <CopyrightFooter />
      </footer>
    </div>
  );
  
};

export default Swiping;
