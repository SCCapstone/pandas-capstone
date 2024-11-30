// LandingPage.tsx
import React from 'react';
import Navbar from '../components/Navbar';
import './swiping.css';
import CopyrightFooter from '../components/CopyrightFooter';

const Swiping: React.FC = () => {
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

export default Swiping;
