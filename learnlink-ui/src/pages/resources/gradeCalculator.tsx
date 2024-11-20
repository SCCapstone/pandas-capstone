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
        <main className="main-content">
          {/* main-content is already set up to handle being 
          within the sidebar-header-footer space*/}

          {/* Add anything additional within this*/}

          
        </main>
      </div>
      <footer>
        <CopyrightFooter />
      </footer>
    </div>
  );
};

export default GradeCalculator;
