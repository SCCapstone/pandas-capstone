import React from 'react';
import Navbar from '../../components/Navbar';
import ResourcesNavBar from '../../components/ResourcesNavBar';
import './resources.css';
import CopyrightFooter from '../../components/CopyrightFooter';

const StudyTips: React.FC = () => {
  return (
    <div className="resources-page">
      <header>
        <Navbar />
      </header>


      <div className='resources-content'>
        <ResourcesNavBar />
        <main className="main-content">
          <h1>Study Tips</h1>
          <div className="tip-icon">
          </div>
          <h2>Collaborate Asynchronously</h2>
          <p>Create shared Quizlet study cards or have a shared Notes page, so that multiple people can input their takeaways from lectures.</p>

          <h2>Choose Study Location Wisely</h2>
          <p>Ensure that the needs of each group member is satisfied in the location of the meeting spot. If most members prefer someplace quiet, choose something like the library, whereas if the group prefers a lively background, maybe choose a coffee shop.</p>
          
          <h2>Teach Eachother</h2>
          <p>Take turns explaining the content from memory without looking at notes to eachother, reviewing the missed content afterwards</p>
          
          <h2>Dumb It Down</h2>
          <p>When studying attempt to explain it to eachother as if the other person does not know the content. Learn how to take high-level content to a elementary level to better your own understanding of the material.</p>
        </main>
      </div>
      <footer>
        <CopyrightFooter />
      </footer>
    </div>
  );
};

export default StudyTips;


