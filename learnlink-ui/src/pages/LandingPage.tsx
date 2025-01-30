// LandingPage.tsx
import React from 'react';
import Navbar from '../components/Navbar';
import './LandingPage.css';
import CopyrightFooter from '../components/CopyrightFooter';

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

export default LandingPage;
