// LandingPage.tsx
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import './swiping.css';
import CopyrightFooter from '../components/CopyrightFooter';
import SwipeProfiles from '../components/SwipeProfiles';  // Import the SwipeProfiles component

const Swiping: React.FC = () => {
  const [userId, setUserId] = useState<number | null>(null);  // State to store the user's ID

  useEffect(() => {
    // Here, you'd normally fetch the user ID from authentication or session
    const loggedInUserId = 2; // Replace with actual user logic, e.g., from context or local storage
    setUserId(loggedInUserId);
  }, []);

  return (
    <div className="landing-page">
      <div>
        <Navbar />
      </div>
      <main className="content">
        <p>{userId}</p>
        {/* Show a message if the user is not logged in */}
        {!userId ? (
          <p>Loading user profile...</p>
        ) : (
          <>
            <SwipeProfiles userId={userId} />  {/* Render the SwipeProfiles component */}
          </>
        )}
      </main>
      <div>
        <CopyrightFooter />
      </div>
    </div>
  );
};

export default Swiping;
