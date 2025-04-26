// LandingPage.tsx
import React from 'react';
import Navbar from '../components/Navbar';
import './LandingPage.css';
import CopyrightFooter from '../components/CopyrightFooter';

// Functional component for the LandingPage
const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <div>
      <Navbar />
      </div>
      <main className="content">
        <p>To start matching, please update your ideal match factor via the profile tab!</p>
      </main>
      <div>
        <CopyrightFooter />
      </div>
    </div>
  );
};

// Exporting the LandingPage component for use in other parts of the app
export default LandingPage;
