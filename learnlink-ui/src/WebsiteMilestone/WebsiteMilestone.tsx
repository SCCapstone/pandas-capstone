import React, { useState } from 'react';
import FinalDemo from './FinalDemo';
import Info from './Info';
import About from './About';

const WebsiteMilestone: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'demo' | 'about'>('info');

  return (
    <div className="website-milestone">
      {/* Tab Buttons */}
      <div className="tabs">
        <button
          onClick={() => setActiveTab('info')}
          className={`infoButton ${
            activeTab === 'info' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Info
        </button>
        <button
          onClick={() => setActiveTab('demo')}
          className={`demoButton ${
            activeTab === 'demo' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Final Demo
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`aboutButton ${
            activeTab === 'about' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          About
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'info' && <Info />}
        {activeTab === 'demo' && <FinalDemo />}
        {activeTab === 'about' && <About />}
      </div>

      {/* GitHub Link */}
      <section className="mt-10">
        <h2 className="github">GitHub Repository</h2>
        <a
          href="https://github.com/yourusername/your-repo" // Replace with your repo URL
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-lg"
        >
          View the Code on GitHub
        </a>
      </section>
    </div>
  );
};

export default WebsiteMilestone;
