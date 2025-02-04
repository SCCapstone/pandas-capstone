import React from 'react';
import Navbar from '../../components/Navbar';
import ResourcesNavBar from '../../components/ResourcesNavBar';
import './resources.css';
import CopyrightFooter from '../../components/CopyrightFooter';

const ExternalResources: React.FC = () => {
  return (
    <div className="resources-page">
      <header>
        <Navbar />
      </header>


      <div className='resources-content'>
        <ResourcesNavBar />
        <main className="main-content">
          <h1>External Resources</h1>
          <h2>External Scheduling Tool</h2>
          <p>Use When2Meet for scheduling a time that works for all group members.</p>
          <p>Have one group memeber create the event and share the link via messaging to the group.</p>
          <a href="https://www.when2meet.com">When2Meet</a>

          <h2>Online Flashcard Tool</h2>
          <p>Use Quizlet to make flashcard sets and study them in unique ways. You can even collaborate with your group on a set.</p>
          <a href="https://quizlet.com">Quizlet</a>
        </main>
      </div>
      <footer>
        <CopyrightFooter />
      </footer>
    </div>
  );
};

export default ExternalResources;

