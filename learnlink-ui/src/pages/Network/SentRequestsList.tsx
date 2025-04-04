// src/pages/Network/SentRequestsList.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { SwipeRequest, SwipeStatus } from '../../utils/types';
import { getLoggedInUserId } from '../../utils/auth';

interface SentRequestsListProps {
    handleSelectUser: (id: number | null, isStudyGroup: boolean) => void;
}

const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

// Sent Requests Tab Content
const SentRequestsList:React.FC<SentRequestsListProps> = ({ handleSelectUser }) => { 
    const [error, setError] = useState<string | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<{ id: number; name: string } | null>(null);
    const [loadingRequests, setLoadingRequests] = useState<boolean>(false);
    const [loadingApproval, setLoadingApproval] = useState<number | null>(null); // Tracks which request is being approved
    const [sentRequestsList, setSentRequestsList] = useState<SwipeRequest[]>([]);
    const userRequests = sentRequestsList.filter(request => request.targetUserId && request.targetUser);
    const groupRequests = sentRequestsList.filter(request => request.targetGroupId && request.targetGroup);

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

            const sortedReqs = updatedRequests.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            const filteredReq = sortedReqs.filter((req: SwipeRequest) => req.status === 'Pending');
            console.log("final requests", filteredReq);

            setSentRequestsList(filteredReq);

            console.log("finally", sentRequestsList);
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
                <p className="no-requests">No pending requests.</p>
            ) : (
                <div className="network-list-containers">
                    {/* <h3>Your Matches</h3>
            <p>List of matched study partners...</p> */}
                  {userRequests.length > 0 ? (
                    <>
                    <div className='sent-request-header users'>
                        <p>
                            <strong>Users</strong>
                            {/* <strong> {request.targetGroup?.studyGroup.name || 'Unnamed Study Group'}</strong> */}
                        </p>
                    </div>
                    <ul className="network-list">
                        {userRequests.map((request) => (
                            <ul key={request.id} onClick={() => handleSelectUser(request.targetGroupId ?? request.targetUserId, !!request.targetGroupId)}>
                                {request.targetUserId && request.targetUser ? (
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
                                                <button className='network-withdraw-button' onClick={(event: React.MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); handleDeleteRequest(request.id); }}>Withdraw</button>
                                            ) : null}
                                            <button className={`status-${request.status.toLowerCase()}`}>{request.status}</button>
                                        </div>

                                    </div>
                                ) : request.targetGroupId && request.targetGroup ? (
                                    // Display target group details
                                    <div className='network-list-parent'>
                                        <div className='study-group-request'>
                                            {/* <p>
                                                <strong>Study Group</strong>
                                                    <strong> {request.targetGroup?.studyGroup.name || 'Unnamed Study Group'}</strong>
                                                </p>
                                                 */}
                                        </div>
                                        <div className='network-list-container'>
                                            <div className='network-list-info'>
                                                <img
                                                    src={request.targetGroup.studyGroup.profilePic || 'https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/generic_studygroup_pfp.svg'}
                                                    alt={`${request.targetGroup.studyGroup.name}`}
                                                    className='network-profile-pic'
                                                />
                                                <div className='network-bio'>
                                                    <h3>{request.targetGroup.studyGroup.name}</h3>
                                                    <p>{request.targetGroup.studyGroup.description}</p>
                                                </div>
                                            </div>
                                            <div className='network-list-status'>
                                                {request.status === 'Pending' ? (
                                                    <button className='network-withdraw-button' onClick={(event: React.MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); handleDeleteRequest(request.id) }}>Withdraw</button>
                                                ) : null}
                                                <button className={`status-${request.status.toLowerCase()}`}>{request.status}</button>
                                            </div>
                                        </div>
                                    </div>


                                ) : null}
                            </ul>

                        ))}
                    </ul>
                    </>
                    ) : null}
                    <ul className="network-list">
                        {groupRequests.length > 0 ? (
                            <><div className='sent-request-header study-groups'>
                                <p>
                                    <strong>Study Groups</strong>
                                    {/* <strong> {request.targetGroup?.studyGroup.name || 'Unnamed Study Group'}</strong> */}
                                </p>
                            </div>

                                {groupRequests.map((request) => (
                                    <ul key={request.id} onClick={() => handleSelectUser(request.targetGroupId ?? request.targetUserId, !!request.targetGroupId)}>
                                        {request.targetUserId && request.targetUser ? (
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
                                                        <button className='network-withdraw-button' onClick={(event: React.MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); handleDeleteRequest(request.id); }}>Withdraw</button>
                                                    ) : null}
                                                    <button className={`status-${request.status.toLowerCase()}`}>{request.status}</button>
                                                </div>

                                            </div>
                                        ) : request.targetGroupId && request.targetGroup ? (
                                            // Display target group details
                                            <div className='network-list-parent'>
                                                <div className='study-group-request'>
                                                </div>
                                                <div className='network-list-container'>
                                                    <div className='network-list-info'>
                                                        <img
                                                            src={request.targetGroup.studyGroup.profilePic || 'https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/generic_studygroup_pfp.svg'}
                                                            alt={`${request.targetGroup.studyGroup.name}`}
                                                            className='network-profile-pic'
                                                        />
                                                        <div className='network-bio'>
                                                            <h3>{request.targetGroup.studyGroup.name}</h3>
                                                            <p>{request.targetGroup.studyGroup.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className='network-list-status'>
                                                        {request.status === 'Pending' ? (
                                                            <button className='network-withdraw-button' onClick={(event: React.MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); handleDeleteRequest(request.id) }}>Withdraw</button>
                                                        ) : null}
                                                        <button className={`status-${request.status.toLowerCase()}`}>{request.status}</button>
                                                    </div>
                                                </div>
                                            </div>


                                        ) : null}
                                    </ul>

                                ))}
                            </>
                        ) : null}
                    </ul>

                </div>
            )}
        </div>
    );
};

export default SentRequestsList;