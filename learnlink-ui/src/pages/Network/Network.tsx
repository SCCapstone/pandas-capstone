
import './Network.css';
import Navbar from '../../components/Navbar';
import CopyrightFooter from '../../components/CopyrightFooter';
import { useNavigate } from 'react-router-dom';
import CustomAlert from '../../components/CustomAlert';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getLoggedInUserId } from '../../utils/auth';
import MatchesList from './MatchesList';
import SentRequestsList from './SentRequestsList';
import ReceivedRequestsList from './ReceivedRequestsList';



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
    const [activeTab, setActiveTab] = useState("sentRequests");

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
                    {activeTab === "matches" && <MatchesList handleSelectUser={handleSelectUser}/>}
                    {activeTab === "sentRequests" && <SentRequestsList handleSelectUser={handleSelectUser}/>}
                    {activeTab === "receivedRequests" && <ReceivedRequestsList handleSelectUser={handleSelectUser}/>}
                </div>
            </div>
            <CopyrightFooter />
        </div>
    );
};

export default Network;