import React from 'react';
import Navbar from '../../components/Navbar';
import ResourcesNavBar from '../../components/ResourcesNavBar';
import './resources.css';
import './gradeCalculator.css';
import CopyrightFooter from '../../components/CopyrightFooter';

const GradeCalculator: React.FC = () => {
  return (
    <div className="resources-page">
      <header>
        <Navbar />
      </header>


      <div className='resources-content'>
        <ResourcesNavBar />


        {/* <div className="resources-tabs">
        <button className="tab active">STUDY TIPS</button>
        <button className="tab">EXTERNAL RESOURCES</button>
        <button className="tab">GRADE CALC</button>
        </div> */}
        <main className="study-tips-content">
          <h1>study tips here:</h1>
          <div className="tip-icon">
          </div>
        </main>
      </div>
      <footer className="footer-placeholder">
        <CopyrightFooter />
      </footer>
    </div>
  );
};

export default GradeCalculator;
