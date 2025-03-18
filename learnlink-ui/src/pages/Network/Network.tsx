
import './Network.css';
import Navbar from '../../components/Navbar';
import CopyrightFooter from '../../components/CopyrightFooter';
import { useNavigate } from 'react-router-dom';
import CustomAlert from '../../components/CustomAlert';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getLoggedInUserId } from '../../utils/auth';



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



// Matches Tab Content
const MatchesList = ({ handleSelectUser }: { handleSelectUser: (userId: number) => void }) => { 
    const navigate = useNavigate();
    const [matchesList, setMatchesList] = useState<User[]>([]);
    const [sentRequestsList, setSentRequestsList] = useState<User[]>([]);
    const [receivedRequestsList, setReceivedRequestsList] = useState<User[]>([]);

    return (
        <div className="TabPanel">
            <h3>Your Matches</h3>
            <p>List of matched study partners...</p>
            <ul className="network-list">
                {matchesList.map((user) => (
                    <ul key={user.id} onClick={() => handleSelectUser(user.id)}>
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
const SentRequestsList = ({ handleSelectUser }: { handleSelectUser: (userId: number) => void }) => { 
    const [error, setError] = useState<string | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<{ id: number; name: string } | null>(null);
    const [loadingRequests, setLoadingRequests] = useState<boolean>(false);
    const [loadingApproval, setLoadingApproval] = useState<number | null>(null); // Tracks which request is being approved
    const [sentRequestsList, setSentRequestsList] = useState<SwipeRequest[]>([]);
    // const [status, setStatus] = useState<string>('');
    const currentUserId = getLoggedInUserId();

    useEffect(() => {
        console.log("currentUserId:", currentUserId);
        if (currentUserId) {
          handleRetrievingRequests();
        }
      }, [currentUserId]); // Dependency ensures effect runs when currentUserId updates

      const handleDeleteRequest = async (requestId: number) => {
        try {
          await axios.delete(`${REACT_APP_API_URL}/api/swipe/${requestId}`);
          setSentRequestsList(prevRequests => 
            prevRequests.filter(request => request.id !== requestId)
        );
        } catch (err) {
          console.error('Error rejecting request:', err);
        }
      };
    
      // Function to fetch swipe requests related to the current user or their study group
      const handleRetrievingRequests = async () => {

        setLoadingRequests(true); 
        try {
          const requestResponse = await axios.get(`${REACT_APP_API_URL}/api/swipe/sentRequests/${currentUserId}`);
      
          // Filter swipes to only include those with direction === "Yes"
        let requestData = requestResponse.data.filter((req: SwipeRequest) => req.direction === 'Yes' && (req.targetUserId || req.targetGroupId));
        console.log("requests", requestData);
    
          // Eliminate duplicates by using a Set to track unique request keys
          const uniqueRequestsMap = new Map();
          requestData.forEach((req: SwipeRequest) => {
            const uniqueKey = `${req.userId}-${req.targetGroupId || req.targetUserId}`;
            if (!uniqueRequestsMap.has(uniqueKey)) {
              uniqueRequestsMap.set(uniqueKey, req);
              }
          });
            const uniqueRequests = Array.from(uniqueRequestsMap.values());


            // Fetch **target user** or **group details**
            const updatedRequests = await Promise.all(
                uniqueRequests.map(async (req: SwipeRequest) => {
                    if (req.targetUserId) {
                        const userResponse = await axios.get(`${REACT_APP_API_URL}/api/users/${req.targetUserId}`);
                        return { ...req, targetUser: userResponse.data };
                    }
                    if (req.targetGroupId) {
                        const groupResponse = await axios.get(`${REACT_APP_API_URL}/api/study-groups/${req.targetGroupId}`);
                        return { ...req, targetGroup: groupResponse.data };
                    }
                    return req;
                })
            );

            setSentRequestsList(updatedRequests);

            console.log("finally",sentRequestsList);
        } catch (err) {
            console.error('Error fetching requests:', err);
            setError('Failed to load requests.');
        }
        finally {
            setLoadingRequests(false); // Stop loading
        }
    };
    return (
        <div className="TabPanel">
            {/* Display error message if any */}
      {error && <p className="error-message">{error}</p>}
      
      {loadingRequests ? (
      <div className="loading-container">
        Loading... <span className="loading-spinner"></span>
      </div>
    ) : sentRequestsList.length === 0 ? (
      <p className="no-requests">No join requests.</p>
      ) : (
            <div className="network-list-container">
            {/* <h3>Your Matches</h3>
            <p>List of matched study partners...</p> */}
            <ul className="network-list">
                        {sentRequestsList.map((request) => (
                            <ul key={request.id} onClick={() => request.targetUserId && handleSelectUser(request.targetUserId!)}>
                                {request.targetUserId  &&  request.targetUser? (
                                    // Display target user details
                                    <div className='network-list-container'>
                                        <div className='network-list-info'>
                                            <img
                                                src={request.targetUser.profilePic || 'https://learnlink-public.s3.us-east-2.amazonaws.com/AvatarPlaceholder.svg'}
                                                alt={`${request.targetUser.firstName} ${request.targetUser.lastName}`}
                                                className='network-profile-pic'
                                            />
                                            <div className='network-bio'>
                                                <h3>{request.targetUser.username}</h3>
                                                <p>{request.targetUser.firstName} {request.targetUser.lastName}</p>
                                            </div>
                                        </div>
                                        <div className='network-list-status'>
                                            {request.status === 'Pending' ? (
                                                <button className='network-withdraw-button' onClick={(event: React.MouseEvent<HTMLButtonElement>) => {event.stopPropagation();handleDeleteRequest(request.id);}}>Withdraw</button>
                                            ) : null}
                                            <button className={`status-${request.status.toLowerCase()}`}>{request.status}</button>
                                        </div>

                                    </div>
                                ) : request.targetGroupId && request.targetGroup ? (
                                    // Display target group details
                                    <div className='network-list-container'>
                                    <div className='network-list-info'>
                                        <img
                                            src={request.targetGroup.studyGroup.profilePic || 'https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/generic_studygroup_pfp.svg'}
                                            alt={`${request.targetGroup.studyGroup.name}`}
                                            className='network-profile-pic'
                                        />
                                        <div className='network-bio'>
                                            <h3>Group: {request.targetGroup.studyGroup.name}</h3>
                                            <p>{request.targetGroup.studyGroup.description}</p>
                                        </div>
                                        </div>
                                        <div className='network-list-status'>
                                            {request.status === 'Pending' ? (
                                                <button className='network-withdraw-button' onClick={() => handleDeleteRequest(request.id)}>Withdraw</button>
                                            ) : null}
                                            <button className={`status-${request.status.toLowerCase()}`}>{request.status}</button>
                                        </div>
                                        </div>

                                    
                                ) : null}
                            </ul>
                        ))}
                    </ul>
            </div>
      )}
        </div>
    );
};


// Received Requests Tab Content
const ReceivedRequestsList = ({ handleSelectUser }: { handleSelectUser: (userId: number) => void }) => { 
    const [error, setError] = useState<string | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<{ id: number; name: string } | null>(null);
    const [loadingRequests, setLoadingRequests] = useState<boolean>(false);
    const [loadingApproval, setLoadingApproval] = useState<number | null>(null); // Tracks which request is being approved
    const [receivedRequestsList, setRecievedRequestsList] = useState<SwipeRequest[]>([]);
    const currentUserId = getLoggedInUserId();

    useEffect(() => {
        console.log("currentUserId:", currentUserId);
        if (currentUserId) {
          handleRetrievingRequests();
        }
      }, [currentUserId]); // Dependency ensures effect runs when currentUserId updates

      // Function to fetch swipe requests related to the current user or their study group
      const handleRetrievingRequests = async () => {
        setLoadingRequests(true);
        try {
            const requestResponse = await axios.get(`${REACT_APP_API_URL}/api/swipe/${currentUserId}`);
    
            // Filter to only "Yes" swipes
            let requestData = requestResponse.data.filter((req: SwipeRequest) => req.direction === 'Yes'&& req.status === SwipeStatus.Pending);
    
            // Eliminate duplicates before proceeding to fetch details
            const uniqueRequestsMap = new Map();
            requestData.forEach((req: SwipeRequest) => {
                const uniqueKey = `${req.userId}-${req.targetGroupId || req.targetUserId}`;
                if (!uniqueRequestsMap.has(uniqueKey)) {
                    uniqueRequestsMap.set(uniqueKey, req);
                }
            });
    
            const uniqueRequests = Array.from(uniqueRequestsMap.values());
    
            // Fetch user details for each unique request
            const userRequests = await Promise.all(
                uniqueRequests.map(async (req: SwipeRequest) => {
                    const userResponse = await axios.get(`${REACT_APP_API_URL}/api/users/${req.userId}`);
                    return { ...req, user: userResponse.data };
                })
            );
    
            // Fetch study group details if needed
            const updatedRequests = await Promise.all(
                userRequests.map(async (req: SwipeRequest) => {
                    if (req.targetGroupId) {
                        const groupResponse = await axios.get(`${REACT_APP_API_URL}/api/study-groups/${req.targetGroupId}`);
                        return { ...req, targetGroup: groupResponse.data };
                    }
                    return req;
                })
            );
    
            setRecievedRequestsList(updatedRequests);
            console.log("Updated Requests List:", updatedRequests);
        } catch (err) {
            console.error('Error fetching requests:', err);
            setError('Failed to load requests.');
        } finally {
            setLoadingRequests(false);
        }
    };
    return (
        <div className="TabPanel">
                  {/* Display error message if any */}
      {error && <p className="error-message">{error}</p>}
      
      {loadingRequests ? (
      <div className="loading-container">
        Loading... <span className="loading-spinner"></span>
      </div>
      ) : receivedRequestsList.length === 0 ? (
        <p className="no-requests">No join requests.</p>
      ) : (
        <div className="network-list-container">
          {/* <h3>Your Matches</h3>
            <p>List of matched study partners...</p> */}
          <ul className="network-list">
          <div className='network-list-info'></div>

            {receivedRequestsList.map((request) => (
              <ul key={request.id} onClick={() => handleSelectUser(request.user.id)}>
                <div className='network-list-container'>
                  <div className='network-list-info'>
                    <img
                      src={request.user.profilePic || 'https://learnlink-public.s3.us-east-2.amazonaws.com/AvatarPlaceholder.svg'}
                      alt={`${request.user.firstName} ${request.user.lastName}`}
                      className='network-profile-pic'
                    />
                    <div className='network-bio'>
                      <h3>{request.user.username}</h3>
                      <p>{request.user.firstName} {request.user.lastName}</p>
                    </div>
                  </div>
                  <div className='network-list-status'>
                    <button className='network-accept-button' onClick={(event: React.MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); }}>Accept</button>
                    <button className='network-deny-button' onClick={(event: React.MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); }}>Deny</button>
                  </div>
                </div>
              </ul>
            ))}
          </ul>

        </div>
      )}
    </div>
  );
};



export default Network;
