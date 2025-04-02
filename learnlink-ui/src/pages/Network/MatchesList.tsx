// src/pages/Network/MatchesList.tsx
import React, { useState, useEffect } from 'react';
import { Match, User } from './types';
import axios from 'axios';
import CustomAlert from '../../components/CustomAlert';
import { getLoggedInUserId } from '../../utils/auth';
import ConfirmPopup from '../../components/ConfirmPopup'
import { set } from 'react-hook-form';
import { useNavigate } from "react-router-dom";


interface MatchesListProps {
  handleSelectUser: (userId: number) => void;
}
const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';


const MatchesList: React.FC<MatchesListProps> = ({ handleSelectUser }) => {
  const [matchesList, setMatchesList] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
  const alertVisible = alerts.some(alert => alert.visible);
  const [displayRemoveWarning, setDisplayRemoveWarning] = useState<boolean>(false);
  const [selectedFriend, setSelectedFriend] = useState<number | null>(null); // Track friend being removed
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const currentUserId = getLoggedInUserId();

  useEffect(() => {

    const fetchMatches = async () => {
        try {
            const token = localStorage.getItem('token');  // Example, change as per your implementation

            const response = await axios.get(`${REACT_APP_API_URL}/api/profiles`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const filteredMatches = response.data.matches.filter(
                (match: { isStudyGroupMatch: boolean }) => match.isStudyGroupMatch !== true
              );

              console.log(filteredMatches)

            
        // Filter out duplicates by checking unique pairs (user1Id, user2Id)
        const seenMatches = new Set();
        const uniqueMatches = filteredMatches.filter((match: { user1Id: number, user2Id: number }) => {
          const userPair = [match.user1Id, match.user2Id].sort().join('-'); // Sort to make order irrelevant
          
          if (seenMatches.has(userPair)) {
            return false; // Duplicate match, skip it
          }
          
          seenMatches.add(userPair);
          return true;
        });
          // Sort by `createdAt` in descending order (newest matches first)
          uniqueMatches.sort((a: { createdAt: string | number | Date; }, b: { createdAt: string | number | Date; }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          setMatchesList(uniqueMatches);

        } catch (err) {
          setAlerts((prevAlerts) => [
            ...prevAlerts,
            { id: Date.now(), alertText:`Failed to fetch matches. Please try again later.`, alertSeverity: 'error', visible: true },
              ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const removeMatch = async (userId: number) => {
    try {
        const token = localStorage.getItem('token');  // Example, change as per your implementation

        const response = await axios.delete(`${REACT_APP_API_URL}/api/match/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

            if (response.status === 200) {
                setMatchesList(prevMatchesList => prevMatchesList.filter(m => m.user1Id !== userId && m.user2Id !== userId));
                console.log('Match removed successfully');
                setAlerts((prevAlerts) => [
                    ...prevAlerts,
                    { id: Date.now(), alertText: `Match removed successfully`, alertSeverity: 'success', visible: true },
                ]);
            }
        } catch (err) {
            console.error('Error removing match:', err);
            setAlerts((prevAlerts) => [
                ...prevAlerts,
                { id: Date.now(), alertText: `Error removing match: ${err}`, alertSeverity: 'error', visible: true },
            ]);
        }

    };

    const handleMessage  = async (userId: number, currentId: number | null) => {
        //creates a new chat as long as a non-study group chat between the two users doesnt exist
        try {
            let endpoint = "";
            let payload: any = {};
        
        
            // Check if a chat already exists
            if (userId) {
        
              const chatCheckResponse = await axios.get(`${REACT_APP_API_URL}/api/chats/check`, {
                params: { userId1: userId, userId2: currentId },
              });
        
              if (chatCheckResponse.data.exists) {
                console.log("A chat with this user already exists.");
                setError("A chat with this user already exists.");

                navigate(`/messaging?selectedChatId=${chatCheckResponse.data.chatId}`);
                
                return; // Stop function execution
              }
              console.log("chat w user", userId)
              // If the request is for a one-on-one chat, create a new chat
              endpoint = "/api/chats";
              payload.userId1 = userId;
              payload.userId2 = currentId;
            } else {
              throw new Error("Invalid request: No user.");
            }
           
            
        
            const response = await axios.post(`${REACT_APP_API_URL}${endpoint}`, payload);
        
        
        if (response.status === 200 || response.status === 201) {
              // If chat was created successfully, update parent component
              console.log("response 200");
              
              navigate(`/messaging?selectedChatId=${response.data.id}`);
              
            } 
          
          } catch (err: unknown) {
            console.error("Error approving request:", err);
            if (axios.isAxiosError(err) && err.response?.status === 405) {
              console.log("Caught 405 error in catch block");
              
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
      
    };

    if (loading) return <div className="loading-container">Loading... <span className="loading-spinner"></span> </div>;

    if(matchesList.length === 0) return <p className="no-requests">No connections yet.</p>

  return (
    <div className="TabPanel">
     {alertVisible && (
                <div className='alert-container'>
                {alerts.map(alert => (
                    <CustomAlert
                        key={alert.id}
                        text={alert.alertText || ''}
                        severity={alert.alertSeverity || 'info' as "error" | "warning" | "info" | "success"}
                        onClose={() => setAlerts(prevAlerts => prevAlerts.filter(a => a.id !== alert.id))}
                    />
                ))}
            </div>
            )}
      {/* <h3>Your Matches</h3>
      <p>List of matched study partners...</p> */}
      <ul className="network-list">
      {matchesList.map((match) => {

            // Determine the opponent based on the current user's ID
            const friend = match.user1Id === currentUserId ? match.user2 : match.user1;
            // console.log("user1",match.user1Id)
            // console.log("me", currentUserId)

            // Check if the friend is different from the current user
            if (friend.id === currentUserId) {
              return null; // Skip the match if it's the current user matching with themselves
          }
          return (
              <ul key={match.id} onClick={() => handleSelectUser(friend.id)}>
                  <div className='network-list-container'>
                      <div className='network-list-info'>
                          <img
                              src={friend.profilePic || 'https://learnlink-public.s3.us-east-2.amazonaws.com/AvatarPlaceholder.svg'}
                              alt={`${friend.firstName} ${friend.lastName}`}
                              className='network-profile-pic'
                          />
                          <div className='network-bio'>
                              <h3>{friend.username}</h3>
                              <p>{friend.firstName} {friend.lastName}</p>
                          </div>
                      </div>
                      <div className='network-list-status'>
                              <button className='network-withdraw-button' onClick={(event: React.MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); setSelectedFriend(friend.id); setDisplayRemoveWarning(true)}}>Remove</button>
                              <button className='network-message-button' onClick={(event: React.MouseEvent<HTMLButtonElement>) => { event.stopPropagation();  setSelectedFriend(friend.id); handleMessage(friend.id,currentUserId );}}>Message</button>
                      </div>

                      {displayRemoveWarning && selectedFriend === friend.id && (
                          <ConfirmPopup
                              message="Are you sure you want to remove this connection? All 1-on-1 chats with this user be deleted."
                              onConfirm={() => {
                                  setDisplayRemoveWarning(false);
                                  removeMatch(friend.id);
                                  setSelectedFriend(null);
                              }}
                              
                              onCancel={() => { 
                                setDisplayRemoveWarning(false);
                                setSelectedFriend(null);
                            }}
                          />
                      )}

                  </div>
              </ul>
          );
      })}
                {/* {matchesList.map((user) => (
          <li key={user.id} onClick={() => handleSelectUser(user.id)}>
            <img src={user.profilePic} alt={`${user.firstName} ${user.lastName}`} className="network-profile-pic" />
            <div className="network-bio">
              <h3>{user.username}</h3>
              <p>{user.firstName} {user.lastName}</p>
            </div>
          </li>
        ))} */}
            </ul>
        </div>
    );
};

export default MatchesList;
