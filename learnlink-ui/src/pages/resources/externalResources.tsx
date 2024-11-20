import React from 'react';
import Navbar from '../../components/Navbar';
import ResourcesNavBar from '../../components/ResourcesNavBar';
import './resources.css';
import './externalResources.css';
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
          <h2>Resource #1</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo.</p>
          <a href="http://example.com">Link to Resource #1</a>
        </main>
      </div>
      <footer className="footer-placeholder">
        <CopyrightFooter />
      </footer>
    </div>
  );
};

export default ExternalResources;
