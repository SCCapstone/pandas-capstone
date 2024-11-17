import React from 'react';
import Navbar from '../components/Navbar';
import './profile.css';
import CopyrightFooter from '../components/CopyrightFooter';

const Profile: React.FC = () => {
  return (
    <div className="profile-page">
      <Navbar />
      <main className="content">
        <p>Work in Progress</p>
      </main>
      <CopyrightFooter />
    </div>
  );
};

export default Profile;
