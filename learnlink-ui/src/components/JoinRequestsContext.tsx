import React, { useEffect, useState, ReactNode, createContext, useContext } from 'react';
import axios from 'axios';
import { SwipeRequest, SwipeStatus } from '../utils/types';

// Define the type for the context value
interface JoinRequestContextType {
  joinRequestCount: number;
  setJoinRequestCount: React.Dispatch<React.SetStateAction<number>>;
  refetchJoinRequestCount: () => Promise<void>;
  loading: boolean;
}

// Create the context
const JoinRequestContext = createContext<JoinRequestContextType | undefined>(undefined);
const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

// Props interface for the component
interface JoinRequestNotifsProps {
  currentUserId: number | null;
  children?: ReactNode;
}

// JoinRequests component that provides context to its children
const JoinRequestNotifs: React.FC<JoinRequestNotifsProps> = ({ currentUserId, children }) => {
  const [joinRequestCount, setJoinRequestCount] = useState<number>(0);
  const [loadingRequests, setLoadingRequests] = useState<boolean>(true);

  // Fetch the initial count of join requests
    const fetchJoinRequestCount = async () => {
      setLoadingRequests(true);
      if (!currentUserId) {
        return;
      }
      try {
        const requestResponse = await axios.get(`${REACT_APP_API_URL}/api/swipe/${currentUserId}`);

        // Filter swipes to only include those with direction === "Yes"
        let requestData = requestResponse.data.filter((req: SwipeRequest) => req.direction === 'Yes' && req.status === SwipeStatus.Pending);

        // Eliminate duplicates by using a Set to track unique request keys
        const uniqueRequestsMap = new Map();
        requestData.forEach((req: SwipeRequest) => {
          const uniqueKey = `${req.userId}-${req.targetGroupId || req.targetUserId}`;
          if (!uniqueRequestsMap.has(uniqueKey)) {
            uniqueRequestsMap.set(uniqueKey, req);
          }
        });
        const uniqueRequests = Array.from(uniqueRequestsMap.values());
        setJoinRequestCount(uniqueRequests.length);
      } catch (err) {
        console.error('Error fetching requests:', err);
      } finally {
        setLoadingRequests(false); // Stop loading
      }
    };

  useEffect(() => {

    if (currentUserId) {
      fetchJoinRequestCount();
    }
  }, [currentUserId, setJoinRequestCount]);

  return (
    <JoinRequestContext.Provider 
    value={{ joinRequestCount, setJoinRequestCount, refetchJoinRequestCount: fetchJoinRequestCount, loading: loadingRequests }}>
    {children}
    </JoinRequestContext.Provider>
  );
};

// Custom hook to access the join request context
export const useJoinRequest = () => {
  const context = useContext(JoinRequestContext);
  if (!context) {
    throw new Error('useJoinRequest must be used within a JoinRequestProvider');
  }
  return context;
};

export default JoinRequestNotifs;
