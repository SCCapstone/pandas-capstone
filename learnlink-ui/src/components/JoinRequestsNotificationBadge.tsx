import React from 'react';
import { useJoinRequest } from './JoinRequestsContext'; // Correct path to the file

const JoinRequestsNotificationBadge: React.FC = () => {
  const { joinRequestCount } = useJoinRequest(); // Use the hook to access join request count

  return (
    <div>
      {joinRequestCount > 0 && (
        <div className="notification-badge">
          {joinRequestCount}
        </div>
      )}
    </div>
  );
};

export default JoinRequestsNotificationBadge;
