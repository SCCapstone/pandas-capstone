import React, { useEffect, useState, ReactNode, createContext, useContext, useCallback } from 'react';
import axios from 'axios';
import { SwipeRequest, SwipeStatus } from '../utils/types';

interface JoinRequestContextType {
  joinRequestCount: number;
  updateRequestCount: (change: number) => void; // Add this
  refetchRequests: () => Promise<void>;
  loading: boolean;
}


const JoinRequestContext = createContext<JoinRequestContextType | undefined>(undefined);
const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

interface JoinRequestNotifsProps {
  notifCurrentUserId: number | null;
  children?: ReactNode;
}

const JoinRequestNotifs: React.FC<JoinRequestNotifsProps> = ({ notifCurrentUserId, children }) => {
  const [joinRequestCount, setJoinRequestCount] = useState<number>(0);
  const [loadingRequests, setLoadingRequests] = useState<boolean>(true);

  const updateRequestCount = useCallback((change: number) => {
    setJoinRequestCount(prev => Math.max(0, prev + change));
  }, []);

  // Memoized fetch function with cancellation
  const fetchJoinRequestCount = useCallback(async () => {
    if (!notifCurrentUserId) {
      setJoinRequestCount(0);
      setLoadingRequests(false);
      return;
    }
    setLoadingRequests(true);

    try {
      console.log("FETCHING REQ COUNT", joinRequestCount);
      const requestResponse = await axios.get(`${REACT_APP_API_URL}/api/swipe/${notifCurrentUserId}`, {
      });

      // Filter and process requests
      let requestData = requestResponse.data.filter((req: SwipeRequest) => 
        req.direction === 'Yes' && req.status === SwipeStatus.Pending);

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
      if (!axios.isCancel(err)) {
        console.error('Error fetching requests:', err);
      }
    } finally {
      setLoadingRequests(false);
    }
  }, [notifCurrentUserId]);

  useEffect(() => {
    // Initial fetch when component mounts or userId changes
    fetchJoinRequestCount();

  }, [fetchJoinRequestCount]);

  // Optional: Add polling if needed
  useEffect(() => {
    if (!notifCurrentUserId) return;

    const intervalId = setInterval(fetchJoinRequestCount, 30000); // Poll every 30 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [notifCurrentUserId, fetchJoinRequestCount]);

  return (
    <JoinRequestContext.Provider 
      value={{ 
        joinRequestCount,
        updateRequestCount, // Expose the update function
        refetchRequests: fetchJoinRequestCount,
        loading: loadingRequests,
      }}
    >
      {children}
    </JoinRequestContext.Provider>
  );
};


export const useJoinRequest = () => {
  const context = useContext(JoinRequestContext);
  if (!context) {
    throw new Error('useJoinRequest must be used within a JoinRequestProvider');
  }
  return context;
};

export default JoinRequestNotifs;