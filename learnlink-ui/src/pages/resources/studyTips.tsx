import React from 'react';
import Navbar from '../../components/Navbar';
import ResourcesNavBar from '../../components/ResourcesNavBar';
import './resources.css';
import './studyTips.css';
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
          <h2>Tip #1</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo neque id sapien dignissim euismod. Fusce sagittis dignissim lorem ac mattis. Vestibulum non ipsum dui. Proin nec mi consectetur ante sodales accumsan. Nullam consequat tellus vel rutrum blandit.</p>

          <h2>Tip #2</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo neque id sapien dignissim euismod. Fusce sagittis dignissim lorem ac mattis. Vestibulum non ipsum dui. Proin nec mi consectetur ante sodales accumsan. Nullam consequat tellus vel rutrum blandit.</p>

          <h2>Tip #3</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo neque id sapien dignissim euismod. Fusce sagittis dignissim lorem ac mattis. Vestibulum non ipsum dui. Proin nec mi consectetur ante sodales accumsan. Nullam consequat tellus vel rutrum blandit.</p>

          <h2>Tip #4</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo neque id sapien dignissim euismod. Fusce sagittis dignissim lorem ac mattis. Vestibulum non ipsum dui. Proin nec mi consectetur ante sodales accumsan. Nullam consequat tellus vel rutrum blandit.</p>

        </main>
      </div>
      <footer>
        <CopyrightFooter />
      </footer>
    </div>
  );
};

export default StudyTips;
