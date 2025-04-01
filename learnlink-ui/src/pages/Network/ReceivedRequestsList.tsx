// src/pages/Network/ReceivedRequestsList.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { SwipeRequest, SwipeStatus } from './types';
import { getLoggedInUserId } from '../../utils/auth';
import openProfilePopup from '../messaging'
import { updateSwipeStatus } from '../../utils/userServices';
import { FaCheck, FaXmark } from 'react-icons/fa6';
import { handleSendSystemMessage, updateChatTimestamp} from "../../utils/messageUtils";

interface ReceivedRequestsListProps {
    handleSelectUser: (userId: number) => void;
}


const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

// Received Requests Tab Content
const ReceivedRequestsList: React.FC<ReceivedRequestsListProps> = ({ handleSelectUser }) => {
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

    // Function to approve a join request
const handleApproval = async (
    requestId: number,
    studyGroupId?: number | null,
    targetUserId?: number | null,
    requestUserId?: number
  ) => {
    setLoadingApproval(requestId); // Set loading state for this specific request
    try {
      let endpoint = "";
      let payload: any = {};
  
  
      // Check if a chat already exists
      if (targetUserId) {
  
        const chatCheckResponse = await axios.get(`${REACT_APP_API_URL}/api/chats/check`, {
          params: { userId1: requestUserId, userId2: targetUserId },
        });
  
        if (chatCheckResponse.data.exists) {
          setError("A chat with this user already exists.");
          handleDeleteRequest(requestId);
          handleRequestsChange(requestId);
          return; // Stop function execution
        }
      }
  
      console.log(studyGroupId);
      if (studyGroupId) {
        // If the request is for a study group, add the user to the group
        endpoint = "/api/add-to-study-group";
        payload.studyGroupId = studyGroupId;
        payload.requestUserId = requestUserId;
      } else if (targetUserId) {
        console.log("approved user", targetUserId)
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
        console.log("response 200");
        if (targetUserId) {
        //   addNewChat(response.data);
        }
  
        // Sync the study group chat users
        if (studyGroupId) {
          await axios.post(`${REACT_APP_API_URL}/api/sync-study-group-chat`, { studyGroupId });

          // Fetch the user's name
          const addedUserResponse = await axios.get(`${REACT_APP_API_URL}/api/users/${requestUserId}`);
          const addedUser = addedUserResponse.data;

          const studyGroupChatIDRes = await axios.get(`${REACT_APP_API_URL}/api/study-groups/${studyGroupId}/chat`);
          const studyGroupChatID = studyGroupChatIDRes.data;

          let mess =`${addedUser.firstName} ${addedUser.lastName} was added to the group.`;
          console.log ("mess::::", mess);
          console.log("study group chat id", studyGroupChatID.chatId);
          // Send system message
          handleSendSystemMessage(mess, studyGroupChatID.chatId);
          updateChatTimestamp(studyGroupChatID.chatId);
        }
  
        // NOTIFICATION
  
        // Fetch the name of the current user
        const userResponse = await axios.get(`${REACT_APP_API_URL}/api/users/${currentUserId}`);
        const currentUser = userResponse.data;
  
        let notificationMessage = `Your request has been approved by ${currentUser.firstName} ${currentUser.lastName}`;
  
        if (studyGroupId) {
          // Fetch the study group name
          const groupResponse = await axios.get(`${REACT_APP_API_URL}/api/study-groups/${studyGroupId}`);
          console.log(groupResponse);
  
          // Update notification message for study group requests
          notificationMessage = `Your request to join ${groupResponse.data.studyGroup.name} has been approved by ${currentUser.firstName} ${currentUser.lastName}`;
        }
  
        // Send the notification
        await axios.post(`${REACT_APP_API_URL}/notifications/send`, {
          userId: requestUserId,
          other_id: currentUser.id,
          message: notificationMessage,
          type: "StudyGroup",
          studyGroupID: studyGroupId,
        });
  
        updateSwipeStatus(requestId, SwipeStatus.Accepted); // Update status to accepted
  
        // handleDeleteRequest(requestId); // Remove request after approval
        handleRequestsChange(requestId);
      }

    } catch (err: unknown) {
      console.error("Error approving request:", err);
      if (axios.isAxiosError(err) && err.response?.status === 405) {
        console.log("Caught 405 error in catch block");
        setError("This study group is full. You cannot approve this request.");
        handleDenial(requestId);

        // handleDeleteRequest(requestId);
        handleRequestsChange(requestId);
      }
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // API responded with an error
          setError(err.response.data.message || "An error occurred while processing the request.");
        } else if (err.request) {
          // No response received
          setError("No response from server. Please check your network.");
        }
      } else if (err instanceof Error) {
        // General JavaScript error
        setError(`Unexpected error: ${err.message}`);
      } else {
        setError("An unknown error occurred.");
      }
    }
    finally {
      setLoadingApproval(null); // Reset loading state
    }
  };


  // Function to reject a join request
  const handleDenial = async (requestId: number) => {
    updateSwipeStatus(requestId, SwipeStatus.Denied);  // Pass the enum value
    // handleDeleteRequest(requestId);
    handleRequestsChange(requestId);
  };

  // Function to delete a request from the system
  const handleDeleteRequest = async (requestId: number) => {
    try {
      await axios.delete(`${REACT_APP_API_URL}/api/swipe/${requestId}`);
      setRecievedRequestsList(receivedRequestsList.filter((request) => request.id !== requestId));
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Failed to reject request.');
    }
  };

  const handleRequestsChange = async (requestId: number) => {
    setRecievedRequestsList(receivedRequestsList.filter((request) => request.id !== requestId));

  };

  const handleProfilePopup = (userId: number) => {
    const user = receivedRequestsList.find((req) => req.user.id === userId)?.user;
    if (user) {
      openProfilePopup({ id: user.id, name: `${user.firstName} ${user.lastName}` });
    }
  };


  const closeProfilePopup = () => {
    setSelectedProfile(null);
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
        <p className="no-requests">No recieved requests.</p>
      ) : (
        <div className="network-list-container">
          {/* <h3>Your Matches</h3>
            <p>List of matched study partners...</p> */}
          <ul className="network-list">
            <div className='network-list-info'></div>

            {receivedRequestsList.map((request) => (
              <ul key={request.id} onClick={() => handleSelectUser(request.user.id)}>

                <div className='network-list-parent'>
                  {request.targetGroupId ? (
                    <div className='study-group-request'>
                      <p>
                        Request to join the study group:
                        <strong> {request.targetGroup?.studyGroup.name || 'Unnamed Study Group'}</strong>
                      </p>
                    </div>
                  ) : null}
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
                      {request.message ? (
                        <div className='network-message'>
                          {/* <h3>Message:</h3> */}
                          <p>{request.message}</p>
                        </div>
                      ) : null
                      }
                    </div>
                  </div>
                  <div className='network-list-status'>
                    <button
                      className='network-accept-button'
                      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                        event.stopPropagation();
                        handleApproval(
                          request.id,
                          request.targetGroupId ?? undefined, // Passing the targetGroupId (or undefined)
                          request.targetUserId ?? undefined, // Passing the targetUserId (or undefined)
                          request.user.id // Passing the requestUserId
                        )
                      }
                      }
                      disabled={loadingApproval === request.id}

                    >
                      {loadingApproval === request.id ? 'Approving...' : <><FaCheck /> Accept</>}
                    </button>
                    <button className='network-deny-button'
                      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                        event.stopPropagation();
                        handleDenial(request.id)
                      }}
                    >
                      <FaXmark />
                      Reject
                    </button>
                  </div>
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