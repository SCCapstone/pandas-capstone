// src/pages/Network/MatchesList.tsx
import React, { useState, useEffect } from 'react';
import { Match } from '../utils/types';
import axios from 'axios';
import CustomAlert from '../components/CustomAlert';
import { getLoggedInUserId } from '../utils/auth';
import { set } from 'react-hook-form';
import { useNavigate } from "react-router-dom";
import '../components/NewChatList.css';
import '../pages/Network/Network.css';
import { updateChatTimestamp } from "../utils/messageUtils";


interface MatchesListProps {
  handleSelectUser: (id: number, isStudyGroup:boolean) => void;
  onClose: () => void;  // Add this to close the popup
}
const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';


const NewChatList: React.FC<MatchesListProps> = ({ handleSelectUser, onClose}) => {
  const [matchesList, setMatchesList] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
  const alertVisible = alerts.some(alert => alert.visible);
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

            // Check for existing chats
            const matchesWithoutChats = await Promise.all(
                uniqueMatches.map(async (match:any) => {
                const friendId = match.user1Id === currentUserId ? match.user2Id : match.user1Id;
                try {
                    const chatCheckResponse = await axios.get(`${REACT_APP_API_URL}/api/chats/check`, {
                    params: { userId1: currentUserId, userId2: friendId },
                    });
    
                    return chatCheckResponse.data.exists ? null : match; // Exclude matches with existing chats
                } catch (err) {
                    console.error("Error checking chat existence:", err);
                    return match; // If there's an error, assume chat doesn't exist
                }
                })
            );
    
            // Filters out the users with existing chats
            setMatchesList(matchesWithoutChats.filter(Boolean));

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
                console.log("A chat with this user already exists.", chatCheckResponse.data);
                setError("A chat with this user already exists.");
                onClose(); // Close popup after navigation
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
            
              const chatCheckResponse = await axios.get(`${REACT_APP_API_URL}/api/chats/check`, {
                params: { userId1: userId, userId2: currentId },
              });
        
              // Get the chat details
              const chat = chatCheckResponse.data;
        
        
        
              onClose(); // Close popup after navigation
              navigate(`/messaging?selectedChatId=${response.data.id}`);
              window.location.reload(); 
              
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

    if(matchesList.length === 0) return <p className="no-requests">All matches have chats already, match with more people for new chats.</p>

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
              <ul key={match.id} onClick={() => handleSelectUser(friend.id , false)}>
                  <div className='network-list-container'>
                      <div className='network-list-info'>
                          <img
                              src={friend.profilePic || 'https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_bust-in-silhouette.png'}
                              alt={`${friend.firstName} ${friend.lastName}`}
                              className='network-profile-pic'
                          />
                          <div className='network-bio'>
                              <h3>{friend.username}</h3>
                              <p>{friend.firstName} {friend.lastName}</p>
                          </div>
                      </div>
                      <div className='network-list-status'>
                              <button className='network-message-button' onClick={(event: React.MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); handleMessage(friend.id,currentUserId );}}>Message</button>
                      </div>

                      

                  </div>
              </ul>
          );
      })}

            </ul>
        </div>
    );
};

export default NewChatList;

