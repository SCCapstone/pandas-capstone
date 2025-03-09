
import './Network.css';
import Navbar from '../components/Navbar';
import CopyrightFooter from '../components/CopyrightFooter';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import CustomAlert from '../components/CustomAlert';

const Network = () => {
    const [activeTab, setActiveTab] = useState("matches");

    return (
        <div className="NetworkPage">
            <Navbar />
            <div className="NetworkContainer">
                {/* Tabs Navigation */}
                <div className="NetworkTabsContainer">
                    <button
                        className={`Tab ${activeTab === "matches" ? "active" : ""}`}
                        onClick={() => setActiveTab("matches")}
                    >
                        Matches
                    </button>

                    <button
                        className={`Tab ${activeTab === "sentRequests" ? "active" : ""}`}
                        onClick={() => setActiveTab("sentRequests")}
                    >
                        Sent Requests
                    </button>

                    <button
                        className={`Tab ${activeTab === "receivedRequests" ? "active" : ""}`}
                        onClick={() => setActiveTab("receivedRequests")}
                    >
                        Received Requests
                    </button>
                </div>

                {/* Tab Content */}
                <div className="TabContent">
                    {activeTab === "matches" && <MatchesList />}
                    {activeTab === "sentRequests" && <SentRequestsList />}
                    {activeTab === "receivedRequests" && <ReceivedRequestsList />}
                </div>
            </div>
            <CopyrightFooter />
        </div>
    );
};

// Matches Tab Content
const MatchesList = () => {
    return (
        <div className="TabPanel">
            <h3>Your Matches</h3>
            <p>List of matched study partners...</p>
            {/* TODO: Fetch and display match data */}
        </div>
    );
};

// Sent Requests Tab Content
const SentRequestsList = () => {
  return (
    <div className="TabPanel">
      <h3>Sent Requests</h3>
      <p>Requests you’ve sent to others...</p>
      {/* TODO: Fetch and display sent request data */}
    </div>
  );
};

// Received Requests Tab Content
const ReceivedRequestsList = () => {
  return (
    <div className="TabPanel">
      <h3>Received Requests</h3>
      <p>Requests others have sent to you...</p>
      {/* TODO: Fetch and display received request data */}
    </div>
  );
};

export default Network;
