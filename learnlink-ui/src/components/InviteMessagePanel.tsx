import './components.css';
import './InviteMessagePanel.css';
import '../pages/messaging.css';
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextareaAutosize } from "@mui/material";

interface InviteMessagePanelProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (message: string) => void;
  targetName: string;
}

const InviteMessagePanel: React.FC<InviteMessagePanelProps> = ({ open, onClose, onConfirm, targetName }) => {
  const [message, setMessage] = useState("");

  const handleConfirm = () => {
    onConfirm(message);
    setMessage(""); // Reset message after sending
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md" // Adjust this to "lg" if you need it even bigger
      sx={{ "& .MuiDialog-paper": { width: "400px", height: "auto" } }}
    >
      <DialogTitle>Send a message to {targetName}</DialogTitle>
      <DialogContent>
        <TextareaAutosize
          minRows={3}
          placeholder="Write a message..."
          value={message}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
          style={{ width: "85%", padding: "20px", fontSize: "16px", fontFamily:'Inter' }}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", marginLeft: "15px", marginRight: "15px", marginBottom: "10px" }}>
        <Button onClick={onClose} sx={{ backgroundColor: "#00668C", color: 'white',fontFamily:'Inter', width:"100px"}}>Cancel</Button>
        <Button onClick={handleConfirm} sx={{ backgroundColor: "#00668C", color: 'white',fontFamily:'Inter', width:"100px" }}>Send</Button>
      </DialogActions>
    </Dialog>
  );
};

export default InviteMessagePanel;
