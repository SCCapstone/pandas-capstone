// src/pages/Network/ReceivedRequestsList.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { SwipeRequest, SwipeStatus } from './types';
import { getLoggedInUserId } from '../../utils/auth';

interface ReceivedRequestsListProps {
  handleSelectUser: (userId: number) => void;
}

const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

// Received Requests Tab Content
const ReceivedRequestsList: React.FC<ReceivedRequestsListProps>  = ({ handleSelectUser }: { handleSelectUser: (userId: number) => void }) => { 
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

export default ReceivedRequestsList