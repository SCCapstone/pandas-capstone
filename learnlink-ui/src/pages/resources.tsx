import React from 'react';
import Navbar from '../components/Navbar';
import './resources.css';
import CopyrightFooter from '../components/CopyrightFooter';

const Resources: React.FC = () => {
  return (
    <div className="resources">
        <Navbar />
        <div className="content">
            <p> Hello </p>
      </div>
      <CopyrightFooter />
    </div>
  );
};

export default Resources;
