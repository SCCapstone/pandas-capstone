import React from 'react';
import Navbar from '../components/Navbar';
import './resources.css';
import CopyrightFooter from '../components/CopyrightFooter';

const Resources: React.FC = () => {
  return (
    <div className="resources-page">
      <Navbar />
      <div className="resources-tabs">
        <button className="tab active">STUDY TIPS</button>
        <button className="tab">EXTERNAL RESOURCES</button>
        <button className="tab">GRADE CALC</button>
      </div>
      <main className="resources-content">
        <p className="tips">study tips here:</p>
        <div className="tip-icon">
        </div>
      </main>
      <footer className="footer-placeholder">
        <CopyrightFooter />
      </footer>
    </div>
  );
};

export default Resources;
