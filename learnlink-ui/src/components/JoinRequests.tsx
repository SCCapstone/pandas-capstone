import './JoinRequests.css';
import '../pages/messaging.css';
import './components.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useResolvedPath } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

interface JoinRequestProps {
  currentUserId: number | null;
  addNewChat: (newChat: any) => void;
}

interface SwipeRequest {
  id: number;
  userId: number;
  targetUserId: number | null;
  targetGroupId: number | null;
  message: string;
  createdAt: string;
  user: User;
  targetGroup: Group;
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

const JoinRequests: React.FC<JoinRequestProps> = ({ currentUserId, addNewChat }) => {
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';
  const [requests, setRequests] = useState<SwipeRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
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
      const requestData = requestResponse.data;
  
      // Fetch user details for each request
      const userRequests = await Promise.all(
        requestData.map(async (req: SwipeRequest) => {
          const userResponse = await axios.get(`${REACT_APP_API_URL}/api/users/${req.userId}`);
          return { ...req, user: userResponse.data }; // Attach user data to request
        })
      );
  
      // Fetch study group details only for requests with targetGroupId
      const updatedRequests = await Promise.all(
        userRequests.map(async (req: SwipeRequest) => {
          if (req.targetGroupId) {
            const groupResponse = await axios.get(`${REACT_APP_API_URL}/api/study-groups/${req.targetGroupId}`);
            return { ...req, targetGroup: groupResponse.data }; // Attach group data to request
          }
          return req; // If no group, return request unchanged
        })
      );
  
      setRequests(updatedRequests);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load requests.');
    }
  };
  
  // Approve request 
  // adds someone to a study group or creates a chat between two users, where they can then create a study group if they want
  const handleApproval = async (
    requestId: number,
    studyGroupId?: number | null,
    targetUserId?: number | null,
    requestUserId?: number
  ) => {
    try {
      let endpoint = "";
      let payload: any = { };
  
      if (studyGroupId) {
        // If the request has a study group, add the user to the group
        endpoint = "/add-to-study-group";
        payload.studyGroupId = studyGroupId;
        payload.userId = requestUserId; // Ensure request user is added
      } else if (targetUserId) {
        // Otherwise, create a chat between the request user and the target user
        endpoint = "/api/chats";
        payload.userId1 = requestUserId;
        payload.userId2 = targetUserId;
      } else {
        throw new Error("Invalid request: No study group or target user.");
      }
      const response = await axios.post(`${REACT_APP_API_URL}${endpoint}`, payload);
  
      if (response.status === 200 || response.status === 201) {
        // If chat was created, update the chats in the parent component
        if (targetUserId) {
          addNewChat(response.data); // Pass the new chat to parent via callback
        }
        // Optionally remove the request after approval
        handleDeleteRequest(requestId);
      } else {
        setError("Failed to approve request. Please try again.");
      }
    } catch (err) {
      console.error("Error approving request:", err);
      setError("Failed to approve request. Please check your network and try again.");
    }
  };
  
  
  

  // Reject request (delete)
  const handleDenial = async (requestId: number) => {
    handleDeleteRequest(requestId);
  };

  //deletes a request from the panel (same as rejection but keeping them separate for logic purposes)
  const handleDeleteRequest = async(requestId: number )=> {
    try {
      await axios.delete(`${REACT_APP_API_URL}/api/swipe/${requestId}`);
      setRequests(requests.filter((request) => request.id !== requestId));
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Failed to reject request.');
    }
  };

  return (
    <div className="requests-panel">
      {error && <p className="error-message">{error}</p>}
      
      {requests.length === 0 ? (
        <p className="no-requests">No join requests.</p>
      
      ) : (
        
        <ul className="requests-list">  
        
                
          {requests
          
          .slice()
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA; // Sort in descending order
          })
          .map((request)  => (

            
            <li key={request.id} className="request-item">
              
              <div className="request-details">
                {/*Shows the name of the requestor*/}
                <p><strong>Requester Name: </strong>{request.user.firstName +' ' +request.user.lastName} </p>
                {/*Shows the group - if any - that they want to join*/}
                {request.targetGroupId && (
                  <p><strong>Target Group: </strong> {request.targetGroup.name}</p>
                )}
                {/*Shows the message from the requestor*/}
                <p><strong>Message: </strong> {request.message}</p>
              </div>
              <div className="request-actions">
                <button
                  className="approve"
                  onClick={() =>
                    handleApproval(
                      request.id,
                      request.targetGroupId ?? undefined, // Passing the targetGroupId (or undefined)
                      request.targetUserId ?? undefined, // Passing the targetUserId (or undefined)
                      request.userId // Passing the requestUserId
                    )
                  }
                >
                  ✔️ Approve
                </button>
                <button className="reject" onClick={() => handleDenial(request.id)}>
                  ❌ Reject
                </button>
              </div>


            </li>
          ))}
        </ul>
      )}
    </div>
  );
};  

export default JoinRequests;
