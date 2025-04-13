import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import CustomAlert from '../components/CustomAlert';
import './CalendarEventPopup.css'

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
  const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
    const alertVisible = alerts.some(alert => alert.visible);
  
  // Function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Extract YYYY-MM-DD
  };

  // Initial state with default values
  const [eventData, setEventData] = useState({
    title: "",
    date: getTodayDate(),
    startTime: "12:30",
    endTime: "13:00",
    description: "",
    location: "",
  });

  // Reset state when the modal opens
  useEffect(() => {
    if (open) {
      setEventData({
        title: "",
        date: getTodayDate(),
        startTime: "12:30",
        endTime: "13:00",
        description: "",
        location: "",
      });
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    console.log("Event Data:", eventData);
    const { title, date, startTime, endTime, location } = eventData;

    if (!title || !date || !startTime || !endTime || !location) {
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        { id: Date.now(), alertText: "Please fill out all required fields.", alertSeverity: "error", visible: true },
      ]);
      return;
    }

    const today = getTodayDate();
    if (date < today) {
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        { id: Date.now(), alertText: "Event date cannot be in the past.", alertSeverity: "error", visible: true },
      ]);      return
    }

    onSubmit(eventData);
    setAlerts([])
    onClose(); // Close the modal after submitting
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="diaglog-err">
        {alerts.map(alert => (
        <CustomAlert
          key={alert.id}
          text={alert.alertText || ''}
          severity={alert.alertSeverity || 'info' as "error" | "warning" | "info" | "success"}
          onClose={() => setAlerts(prevAlerts => prevAlerts.filter(a => a.id !== alert.id))}
        />
      ))}
      </div>
      
      <DialogTitle>Create Calendar Event</DialogTitle>
      <DialogContent>
        <TextField
          label="Event Title"
          fullWidth
          margin="dense"
          name="title"
          value={eventData.title}
          onChange={handleChange}
          required
        />
        <TextField
          label="Date"
          type="date"
          fullWidth
          margin="dense"
          name="date"
          value={eventData.date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label="Start Time"
          type="time"
          fullWidth
          margin="dense"
          name="startTime"
          value={eventData.startTime}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label="End Time"
          type="time"
          fullWidth
          margin="dense"
          name="endTime"
          value={eventData.endTime}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label="Location"
          fullWidth
          margin="dense"
          name="location"
          value={eventData.location}
          onChange={handleChange}
          required
        />
        <TextField
          label="Description"
          fullWidth
          margin="dense"
          name="description"
          multiline
          rows={3}
          value={eventData.description}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Create Event
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalendarEventPopup;
