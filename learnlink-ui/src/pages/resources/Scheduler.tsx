import React from 'react';
import Navbar from '../../components/Navbar';
import ResourcesNavBar from '../../components/ResourcesNavBar';
import './resources.css';
import CopyrightFooter from '../../components/CopyrightFooter';
import WeeklySchedule from '../../components/WeeklySchedule';

const Scheduler: React.FC = () => {
  return (
    <div className="resources-page">
      <header>
        <Navbar />
      </header>


      <div className='resources-content'>
        <ResourcesNavBar />
        <main className="main-content">
          <WeeklySchedule></WeeklySchedule>
        </main>
      </div>
      <footer>
        <CopyrightFooter />
      </footer>
    </div>
  );
};

export default Scheduler;


