
import './Network.css';
import Navbar from '../../components/Navbar';
import CopyrightFooter from '../../components/CopyrightFooter';
import { useNavigate, useLocation } from "react-router-dom";
import MatchesList from './MatchesList';
import SentRequestsList from './SentRequestsList';
import ReceivedRequestsList from './ReceivedRequestsList';
import React, { useState, useEffect } from "react";
import { useSearchParams } from 'react-router-dom';
import JoinRequestsNotificationBadge from '../../components/JoinRequestsNotificationBadge';

const Network = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("matches");
  const currentLocation = useLocation();

  const inputtedActive = searchParams.get("active");

  useEffect(() => {
    if (inputtedActive) {
      setActiveTab(inputtedActive);
    }
  }, [inputtedActive]);

  // Set the active tab based on the query parameter from the URL
  useEffect(() => {
    const queryParams = new URLSearchParams(currentLocation.search);
    const tab = queryParams.get("tab");
    if (tab && ["matches", "sentRequests", "receivedRequests"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [currentLocation.search]);

  // Function to handle tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update the query parameter in the URL without reloading the page
    setSearchParams({ active: tab });
  };

  const handleSelectUser = (id: number | null, isStudyGroup: boolean) => {
    if (!id) {
      throw new Error("Invalid ID");
    }
    if (isStudyGroup) {
      navigate(`/group-profile/${id}`);
    } else {
      navigate(`/user-profile/${id}`);
    }
  };

  return (
    <div className="NetworkPage">
      <Navbar />
      <div className="NetworkContainer">
        {/* Tabs Navigation */}
        <div className="NetworkTabsContainer">
          <button
            className={`Tab ${activeTab === "matches" ? "active" : ""}`}
            onClick={() => handleTabChange("matches")}
          >
            Connections
          </button>

          <button
            className={`Tab ${activeTab === "sentRequests" ? "active" : ""}`}
            onClick={() => handleTabChange("sentRequests")}
          >
            Requests Pending
          </button>

          <button
            className={`Tab ${activeTab === "receivedRequests" ? "active" : ""}`}
            onClick={() => handleTabChange("receivedRequests")}
          >
            Requests Received
            <JoinRequestsNotificationBadge showDotOnly={true}/>
          </button>
        </div>

        {/* Tab Content */}
        <div className="TabContent">
          {activeTab === "matches" && <MatchesList handleSelectUser={handleSelectUser} />}
          {activeTab === "sentRequests" && <SentRequestsList handleSelectUser={handleSelectUser} />}
          {activeTab === "receivedRequests" && <ReceivedRequestsList handleSelectUser={handleSelectUser} />}
        </div>
      </div>
      <CopyrightFooter />
    </div>
  );
};

export default Network;
