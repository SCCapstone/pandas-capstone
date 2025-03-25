import React from 'react';
import Navbar from '../../components/Navbar';
import ResourcesNavBar from '../../components/ResourcesNavBar';
import './resources.css';
import CopyrightFooter from '../../components/CopyrightFooter';
import WeeklySchedule from '../../components/WeeklySchedule';
import { useParams } from "react-router-dom";

const Scheduler: React.FC = () => {
  // Retrieve studyGroupId from URL params and convert it to a number
  const { studyGroupId } = useParams<{ studyGroupId: string }>(); 

  // Ensure that studyGroupId is a number
  const groupId = studyGroupId ? parseInt(studyGroupId, 10) : null;
  
  if (!groupId) {
    return <div>Error: Invalid Study Group ID!</div>;
  }


  return (
    <div className="resources-page">
      <header>
        <Navbar />
      </header>


      <div className='resources-content'>
        <ResourcesNavBar />
        <main className="main-content">
          <WeeklySchedule 
          studyGroupId={groupId}
          ></WeeklySchedule>
        </main>
      </div>
      <footer>
        <CopyrightFooter />
      </footer>
    </div>
  );
};

export default Scheduler;


