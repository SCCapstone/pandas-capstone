import './InviteMessagePanel.css';
import '../pages/messaging.css';
import React, { useState } from 'react';
import axios from 'axios';

interface InviteMessagePanelProps {
  currentUserId: number;
  targetUserId: number;
  onClose: () => void;
}

const InviteMessagePanel: React.FC<InviteMessagePanelProps> = ({ currentUserId, targetUserId, onClose }) => {
  const [message, setMessage] = useState('');
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

  const handleSendInvite = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to be logged in to send an invite.');
        return;
      }

      if (!message.trim()) {
        alert('Please enter a message before sending.');
        return;
      }

      const inviteData = {
        senderId: currentUserId,
        receiverId: targetUserId,
        message,
      };

      const response = await axios.post(
        `${REACT_APP_API_URL}/api/study-groups/invite`,
        inviteData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Invite sent:', response.data);
      alert('Invite sent successfully!');
      onClose();
    } catch (error) {
      console.error('Error sending invite:', error);
      alert('Failed to send invite.');
    }
  };

  return (
    <div className="invite-message-panel">
      <h1>Invite to Study Group</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <div>
          <label>Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message to invite the user..."
          />
        </div>
        <button type="button" onClick={handleSendInvite}>Send Invite</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};

export default InviteMessagePanel;
