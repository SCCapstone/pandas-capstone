import './JoinRequests.css';
import '../pages/messaging.css';
import './components.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface JoinRequestProps {
  currentUserId: number | null;
}

interface SwipeRequest {
  id: number;
  userId: number;
  targetUserId: number | null;
  targetGroupId: number | null;
  message: string;
}

interface User{
  id: number;
  firstName: string;
  lastName: string;
}

interface Group{
  id: number;
  name: string;
}

const JoinRequests: React.FC<JoinRequestProps> = ({ currentUserId }) => {
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';
  const [requests, setRequests] = useState<SwipeRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setReqUser] = useState<User[]>([]);
  const [group, setGroup]  = useState<Group[]>([]);
  //console.log("JoinRequests component is rendering!");

  useEffect(() => {
    console.log("currentUserId:", currentUserId);
    if (currentUserId) {
      handleRetrievingRequests();
    }
  }, [currentUserId]); // Add currentUserId as a dependency
  

  // Fetch swipe requests where the current user/study group is the target
  const handleRetrievingRequests = async () => {
    try {
      const requestResponse = await axios.get(`${REACT_APP_API_URL}/api/swipe/${currentUserId}`);
      setRequests(requestResponse.data);
  
      // Fetch user details for each request
      const userRequests = await Promise.all(
        requestResponse.data.map(async (req: SwipeRequest) => {
          const userResponse = await axios.get(`${REACT_APP_API_URL}/api/users/${req.userId}`);
          return userResponse.data;
        })
      );
  
      // Fetch study group details only if targetGroupId exists
      const studyGroupInfo = await Promise.all(
        requestResponse.data
          .filter((req: SwipeRequest) => req.targetGroupId !== null) // Filter out null targetGroupId
          .map(async (req: SwipeRequest) => {
            const groupResponse = await axios.get(`${REACT_APP_API_URL}/api/study-groups/${req.targetGroupId}`);
            return groupResponse.data;
          })
      );
  
      setReqUser(userRequests);
      setGroup(studyGroupInfo);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load requests.');
    }
  };
  

  // Approve request (creates a match)
  const handleApproval = async (requestId: number) => {
    /*
    try {
      await axios.post(`${REACT_APP_API_URL}/api/match`, { requestId });
      setRequests(requests.filter((request) => request.id !== requestId));
    } catch (err) {
      console.error('Error approving request:', err);
      setError('Failed to approve request.');
    }
      */
  };

  // Reject request (delete or ignore)
  const handleDenial = async (requestId: number) => {
    
    /*
    try {
      await axios.delete(`${REACT_APP_API_URL}/api/swipe/${requestId}`);
      setRequests(requests.filter((request) => request.id !== requestId));
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Failed to reject request.');
    }*/
  };

  return (
    <div className="requests-panel">
      {error && <p className="error-message">{error}</p>}
      
      {requests.length === 0 ? (
        <p className="no-requests">No join requests.</p>
      ) : (
        <ul className="requests-list">
          {requests.map((request, index) => (
            <li key={request.id} className="request-item">
              <div className="request-details">
                <p><strong>Requester Name:</strong> {user[index]?.firstName} {user[index]?.lastName}</p>
                {request.targetGroupId && (
                  <p><strong>Target Group:</strong> {group.find(g => g.id === request.targetGroupId)?.name || 'Unknown Group'}</p>
                )}
                <p><strong>Message:</strong> {request.message}</p>
              </div>
              <div className="request-actions">
                <button className="approve" onClick={() => handleApproval(request.id)}>✔️ Approve</button>
                <button className="reject" onClick={() => handleDenial(request.id)}>❌ Reject</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};  

export default JoinRequests;
