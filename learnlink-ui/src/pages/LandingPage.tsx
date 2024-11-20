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
        <p>To start searching please update your profile via top left corner!</p>
      </main>
      <div>
        <CopyrightFooter />
      </div>
    </div>
  );
};

export default LandingPage;
