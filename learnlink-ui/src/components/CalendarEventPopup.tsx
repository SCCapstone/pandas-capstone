import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";

interface CalendarEventPopupProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (eventDetails: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description: string;
    location: string;
  }) => void;
}

const CalendarEventPopup: React.FC<CalendarEventPopupProps> = ({ open, onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = () => {
    if (!title || !date || !startTime || !endTime || !location) {
      alert("Please fill out all required fields.");
      return;
    }

    onSubmit({
      title,
      date,
      startTime,
      endTime,
      description,
      location,
    });

    onClose(); // Close the modal after submitting
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create Calendar Event</DialogTitle>
      <DialogContent>
        <TextField 
          label="Event Title" 
          fullWidth 
          margin="dense" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required
        />
        <TextField 
          label="Date" 
          type="date" 
          fullWidth 
          margin="dense" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField 
          label="Start Time" 
          type="time" 
          fullWidth 
          margin="dense" 
          value={startTime} 
          onChange={(e) => setStartTime(e.target.value)} 
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField 
          label="End Time" 
          type="time" 
          fullWidth 
          margin="dense" 
          value={endTime} 
          onChange={(e) => setEndTime(e.target.value)} 
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField 
          label="Location" 
          fullWidth 
          margin="dense" 
          value={location} 
          onChange={(e) => setLocation(e.target.value)} 
          required
        />
        <TextField 
          label="Description" 
          fullWidth 
          margin="dense" 
          multiline 
          rows={3} 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} color="primary">Create Event</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalendarEventPopup;
