
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

interface User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    age: number; // Add the age property
    gender: string;
    college: string;
    coursework: string[];
    profilePic: string;

}

interface SwipeRequest {
    id: number;
    userId: number;             // ID of the user making the request
    targetUserId: number | null; // ID of the user they want to connect with (if applicable)
    targetGroupId: number | null; // ID of the group they want to join (if applicable)
    message: string;            // Message sent with the request
    createdAt: string;          // Timestamp of when the request was made
    user: User;                 // User details of the requester
    targetGroup: Group;         // Group details (if applicable)
    direction: 'Yes' | 'No';
    targetUser?: User;          // User details of the target user (if applicable)
    status: SwipeStatus;
}

// Enum for swipe status
enum SwipeStatus {
  Accepted = 'Accepted',
  Denied = 'Denied',
  Pending = 'Pending'
}

// Interface for a group object
interface Group {
  studyGroup: StudyGroup; // Contains details of the study group
}

// Interface defining a study group
interface StudyGroup {
  id: number;
  name: string; // Name of the study group
  description: string; // Description of the study group
  profilePic?: string; // URL of the group's profile picture
}


const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';


const Network = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("matches");
  const currentLocation = useLocation();

  const inputtedActive = searchParams.get("active");


  useEffect(() => {
    console.log('searchParams:', searchParams.toString());
    console.log('inputtedActive:', inputtedActive);
    if (inputtedActive === "matches") {
      console.log("setting active tab to matches");
      setActiveTab("matches");
    } else if (inputtedActive === "rr") {
      console.log("setting active tab to rr");
      setActiveTab("receivedRequests");
    }

    navigate(window.location.pathname, { replace: true });
  }, [inputtedActive]); 
  
  // Set the active tab based on the query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(currentLocation.search);
    const tab = queryParams.get("tab");
    if (tab && ["matches", "sentRequests", "receivedRequests"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [currentLocation.search]);

  const handleSelectUser = (userId: number) => {
    navigate(`/user-profile/${userId}`);
  };


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
            Connections
          </button>

          <button
            className={`Tab ${activeTab === "sentRequests" ? "active" : ""}`}
            onClick={() => setActiveTab("sentRequests")}
          >
            Requests Pending
          </button>

          <button
            className={`Tab ${activeTab === "receivedRequests" ? "active" : ""}`}
            onClick={() => setActiveTab("receivedRequests")}
          >            
            Requests Recieved
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
