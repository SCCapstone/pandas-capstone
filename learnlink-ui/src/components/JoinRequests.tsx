import './JoinRequests.css';
import '../pages/messaging.css';
import './components.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Props interface defining the expected properties for the JoinRequests component
interface JoinRequestProps {
  currentUserId: number | null;  // ID of the currently logged-in user
  addNewChat: (newChat: any) => void; // Callback function to update the parent component with new chat data
}

// Interface defining the structure of a swipe request
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
}

// Interface for a user object
interface User {
  id: number;
  firstName: string;
  lastName: string;
}

// Interface for a group object
interface Group {
  studyGroup: StudyGroup; // Contains details of the study group
}

// Interface defining a study group
interface StudyGroup {
  id: number;
  name: string; // Name of the study group
}

// JoinRequests component handles fetching, displaying, approving, and rejecting join requests
const JoinRequests: React.FC<JoinRequestProps> = ({ currentUserId, addNewChat }) => {
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';
  const [requests, setRequests] = useState<SwipeRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch requests when currentUserId changes
  useEffect(() => {
    console.log("currentUserId:", currentUserId);
    if (currentUserId) {
      handleRetrievingRequests();
    }
  }, [currentUserId]); // Dependency ensures effect runs when currentUserId updates

  // Function to fetch swipe requests related to the current user or their study group
  const handleRetrievingRequests = async () => {
    try {
      const requestResponse = await axios.get(`${REACT_APP_API_URL}/api/swipe/${currentUserId}`);
  
      // Filter swipes to only include those with direction === "YES"
      let requestData = requestResponse.data.filter((req: SwipeRequest) => req.direction === 'Yes');


      // Fetch user details for each request
      const userRequests = await Promise.all(
        requestData.map(async (req: SwipeRequest) => {
          const userResponse = await axios.get(`${REACT_APP_API_URL}/api/users/${req.userId}`);
          return { ...req, user: userResponse.data }; // Attach user data to request
        })
      );
  
      // Fetch study group details for requests that have a targetGroupId
      const updatedRequests = await Promise.all(
        userRequests.map(async (req: SwipeRequest) => {
          if (req.targetGroupId) {
            const groupResponse = await axios.get(`${REACT_APP_API_URL}/api/study-groups/${req.targetGroupId}`);
            return { ...req, targetGroup: groupResponse.data }; // Attach group data to request
          }
          return req; // Return request unchanged if no target group
        })
      );
  
      setRequests(updatedRequests);
      console.log(requests);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load requests.');
    }
  };
  
  // Function to approve a join request
  const handleApproval = async (
    requestId: number,
    studyGroupId?: number | null,
    targetUserId?: number | null,
    requestUserId?: number
  ) => {
    try {
      let endpoint = "";
      let payload: any = { };
  
      console.log(studyGroupId);
      if (studyGroupId) {
        // If the request is for a study group, add the user to the group
        endpoint = "/api/add-to-study-group";
        payload.studyGroupId = studyGroupId;
        payload.requestUserId = requestUserId;
      } else if (targetUserId) {
        // If the request is for a one-on-one chat, create a new chat
        endpoint = "/api/chats";
        payload.userId1 = requestUserId;
        payload.userId2 = targetUserId;
      } else {
        throw new Error("Invalid request: No study group or target user.");
      }
      
      const response = await axios.post(`${REACT_APP_API_URL}${endpoint}`, payload);
  
      if (response.status === 200 || response.status === 201) {
        // If chat was created successfully, update parent component
        if (targetUserId) {
          addNewChat(response.data);
        }

          // Call the API to sync the study group chat users
        if (studyGroupId) {
          await axios.post(`${REACT_APP_API_URL}/api/sync-study-group-chat`, { studyGroupId });
        }

        //TODO add -- add notifications here for approval


        handleDeleteRequest(requestId); // Remove request after approval
      } 
      else if (response.status === 405) {
        setError("This study group is full. You cannot approve this request.");
        handleDeleteRequest(requestId);
      }
      else {
        setError("Failed to approve request. Please try again.");
      }
    } catch (err) {
      console.error("Error approving request:", err);
      setError("Failed to approve request. Please check your network and try again.");
    }
  };

  // Function to reject a join request
  const handleDenial = async (requestId: number) => {
    handleDeleteRequest(requestId);
  };

  // Function to delete a request from the system
  const handleDeleteRequest = async (requestId: number) => {
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
      {/* Display error message if any */}
      {error && <p className="error-message">{error}</p>}
      
      {/* Display message if there are no requests */}
      {requests.length === 0 ? (
        <p className="no-requests">No join requests.</p>
      ) : (
        <ul className="requests-list">
          {requests
            .slice()
            .sort((a, b) => {
              // Sorting requests by creation date (most recent first)
              const dateA = new Date(a.createdAt || 0).getTime();
              const dateB = new Date(b.createdAt || 0).getTime();
              return dateB - dateA;
            })
            .map((request) => (
              <li key={request.id} className="request-item">
                <div className="request-details">
                  {/* Display requester's name */}
                  <p><strong>Requester Name: </strong>{request.user.firstName} {request.user.lastName}</p>
                  
                  {/* Display target group if applicable */}
                  {request.targetGroupId && request.targetGroup && (
                    <p><strong>Target Group: </strong> {request.targetGroup.studyGroup.name}</p>
                  )}
                  
                  {/* Display request message */}
                  <p><strong>Message: </strong> {request.message}</p>
                </div>

                {/* Approve and reject buttons */}
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
