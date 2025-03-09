
import './Network.css';
import Navbar from '../components/Navbar';
import CopyrightFooter from '../components/CopyrightFooter';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import CustomAlert from '../components/CustomAlert';



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

const Network = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("sentRequests");

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
    const navigate = useNavigate();
    const [matchesList, setMatchesList] = useState<User[]>([]);
    const [sentRequestsList, setSentRequestsList] = useState<User[]>([]);
    const [receivedRequestsList, setReceivedRequestsList] = useState<User[]>([]);
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

    return (
        <div className="TabPanel">
            <h3>Your Matches</h3>
            <p>List of matched study partners...</p>
            <ul className="network-list">
                {matchesList.map((user) => (
                    <ul key={user.id} onClick={() => HandleSelectUser(user.id)}>
                        <img src={user.profilePic} alt={`${user.firstName} ${user.lastName}`} className='network-profile-pic' />
                        <div className='network-bio'>
                            <h3>{user.username}</h3>
                            <p>{user.firstName} {user.lastName}</p>
                        </div>
                    </ul>
                ))}
            </ul>
        </div>
    );
};

// Sent Requests Tab Content
const SentRequestsList = () => {
    const [sentRequestsList, setSentRequestsList] = useState<User[]>([]);
    return (
        <div className="TabPanel">
            <h3>Your Matches</h3>
            <p>List of matched study partners...</p>
            <ul className="network-list">
                {sentRequestsList.map((user) => (
                    <ul key={user.id} onClick={() => HandleSelectUser(user.id)}>
                        <img src={user.profilePic} alt={`${user.firstName} ${user.lastName}`} className='network-profile-pic' />
                        <div className='network-bio'>
                            <h3>{user.username}</h3>
                            <p>{user.firstName} {user.lastName}</p>
                        </div>
                    </ul>
                ))}
            </ul>
        </div>
    );
};

// Received Requests Tab Content
const ReceivedRequestsList = () => {
    const [receivedRequestsList, setReceivedRequestsList] = useState<User[]>([]);

    return (
        <div className="TabPanel">
            <h3>Received Requests</h3>
            <p>Requests others have sent to you...</p>
            <ul className="network-list">
                {receivedRequestsList.map((user) => (
                    <ul key={user.id} onClick={() => HandleSelectUser(user.id)}>
                        <img src={user.profilePic} alt={`${user.firstName} ${user.lastName}`} className='network-profile-pic' />
                        <div className='network-bio'>
                            <h3>{user.username}</h3>
                            <p>{user.firstName} {user.lastName}</p>
                        </div>
                    </ul>
                ))}
            </ul>
                </div>
  );
};

const HandleSelectUser = (userId: number) => {
    const navigate = useNavigate();
    navigate(`/user-profile/${userId}`); // Navigate to the user's profile page
    // setSearchQuery('');
    // setSearchResults([]);
  };



export default Network;
