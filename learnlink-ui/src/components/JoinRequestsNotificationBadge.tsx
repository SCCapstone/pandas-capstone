import React from 'react';
import { useJoinRequest } from './JoinRequestsContext'; // Correct path to the file
import './JoinRequestsNotificationBadge.css';

// Props interface for the component
interface JoinRequestsNotificationProps {
  showDotOnly?: boolean; // A flag to decide whether to show the dot only or the badge
}

const JoinRequestsNotification: React.FC<JoinRequestsNotificationProps> = ({ showDotOnly = false }) => {
  const { joinRequestCount } = useJoinRequest(); // Use the hook to access join request count
  
  if (joinRequestCount < 1) {
    return null; // Don't show anything if no requests
  }

  // Conditionally render the dot or badge based on showDotOnly
  return (
    <div>
      {showDotOnly ? (
        <div className="req-notification-badge-dot" />
      ) : (
        <div className="req-notification-badge">
          {joinRequestCount}
        </div>
      )}
    </div>
  );
};

export default JoinRequestsNotification;
