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

const JoinRequests: React.FC<JoinRequestProps> = ({ currentUserId }) => {
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';
  const [requests, setRequests] = useState<SwipeRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setReqUser] = useState<User[]>([]);
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
  
      setReqUser(userRequests);
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
      <h2>Join Requests</h2>
  
      {error && <p className="error-message">{error}</p>}
      
      {requests.length === 0 ? (
        <p className="no-requests">No join requests available.</p>
      ) : (
        <ul className="requests-list">
          {requests.map((request, index) => (
            <li key={request.id} className="request-item">
              <div className="request-details">
                <p><strong>Requester Name:</strong> {user[index]?.firstName} {user[index]?.lastName}</p>
                {request.targetGroupId && (
                  <p><strong>Target Group ID:</strong> {request.targetGroupId}</p>
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
