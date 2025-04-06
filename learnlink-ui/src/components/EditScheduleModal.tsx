import React, { useState, useEffect } from 'react';
import './EditScheduleModal.css';
import CustomAlert from '../components/CustomAlert';

interface EditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number; // Assuming groupId is passed as a prop to fetch the schedule
}
const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';


const EditScheduleModal: React.FC<EditScheduleModalProps> = ({ isOpen, onClose, groupId }) => {
  const [days, setSelectedDays] = useState<string[]>(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [startTime, setStartTime] = useState<string>("9:00 AM");
  const [endTime, setEndTime] = useState<string>("10:00 AM");
  const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);


  const alertVisible = alerts.some(alert => alert.visible);

  // Days of the week
  const daysOfWeek = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'];

  // Function to format time in HH:MM AM/PM (no extra leading 0)
  const formatTime = (hour: number): string => {
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:00 ${period}`;
  };

  // Generate time options from 12:00 AM to 11:00 PM
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      options.push(formatTime(hour));
    }
    return options;
  };

  // Convert time to 24-hour format for comparison
  const timeTo24Hr = (time: string): number => {
    const [hour, minute] = time.split(":");
    const period = minute.slice(3);
    let hour24 = parseInt(hour);
    if (period === "PM" && hour24 !== 12) hour24 += 12;
    if (period === "AM" && hour24 === 12) hour24 = 0;
    return hour24;
  };


  // Fetch current schedule when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchSchedule = async () => {
          setLoading(true);
          try {
              const token = localStorage.getItem('token');
              if (!token) {
                  // alert('You need to be logged in to edit the study group.');
                  setAlerts((prevAlerts) => [
                      ...prevAlerts,
                      { id: Date.now(), alertText: 'You need to be logged in to edit the schedule.', alertSeverity: "error", visible: true },
                  ]);
                  return;
              }
              const response = await fetch(`${REACT_APP_API_URL}/api/study-groups/${groupId}/schedule`, {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                  },
              });
              if (!response.ok) {
                  throw new Error('Failed to fetch schedule');
              }
              const data = await response.json();

              // Define the correct order of days
              const dayOrder = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];

              // Sort received days according to the correct order
              const sortedDays = (data.scheduleDays || []).sort(
                  (a: string, b: string) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
              );

              console.log(sortedDays)


              setSelectedDays(sortedDays || []);
              setStartTime(data.scheduleStartTime || "9:00 AM");
              setEndTime(data.scheduleEndTime || "10:00 AM");
          } catch (error) {
          console.error('Error fetching schedule:', error);
          setAlerts((prevAlerts) => [
            ...prevAlerts,
            { id: Date.now(), alertText: 'Failed to load schedule.', alertSeverity: "error", visible: true },
          ]);
        } finally {
          setLoading(false);
        }
      };

      fetchSchedule();
    }
  }, [isOpen, groupId]);

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStartTime(e.target.value);
    if (timeTo24Hr(e.target.value) >= timeTo24Hr(endTime)) {
      setEndTime(generateTimeOptions()[generateTimeOptions().indexOf(e.target.value) + 1]); // Reset end time to next valid time
    }
    if (timeTo24Hr(endTime) < timeTo24Hr(startTime) + 1) {
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        { id: Date.now(), alertText: 'End Time cannot be before Start Time.', alertSeverity: "error", visible: true },
      ]);
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEndTime(e.target.value);
    if (timeTo24Hr(e.target.value) <= timeTo24Hr(startTime)) {
      setStartTime(generateTimeOptions()[generateTimeOptions().indexOf(e.target.value) - 1]); // Reset end time to next valid time
    }
    if (timeTo24Hr(endTime) < timeTo24Hr(startTime) - 1) {
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        { id: Date.now(), alertText: `Start Time cannot be before End Time.`, alertSeverity: "error", visible: true },
      ]);
    }
  };

  const handleDaySelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const day = e.target.value;
    setSelectedDays((prevDays) =>
      prevDays.includes(day) ? prevDays.filter((d) => d !== day) : [...prevDays, day]
    );
  };

  const handleSave = async () => {
    if (days.length === 0) {
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        { id: Date.now(), alertText: `You must select at least one day.`, alertSeverity: "error", visible: true },
      ]);
      return;
    }
    if (!(timeTo24Hr(endTime) >= timeTo24Hr(startTime) + 1)) {
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        { id: Date.now(), alertText: `End Time cannot be before Start Time.`, alertSeverity: "error", visible: true },
      ]);
      return;
    }

    if (timeTo24Hr(endTime) >= timeTo24Hr(startTime) + 1 && days.length > 0) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // alert('You need to be logged in to edit the study group.');
          setAlerts((prevAlerts) => [
            ...prevAlerts,
            { id: Date.now(), alertText: 'You need to be logged in to edit the study group.', alertSeverity: "error", visible: true },
          ]);
          return;
        }
        const reqBody = JSON.stringify({ scheduleDays: days, scheduleStartTime: startTime, scheduleEndTime: endTime });
        console.log(reqBody);
        const response = await fetch(`${REACT_APP_API_URL}/api/study-groups/${groupId}/schedule`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
         },
          body: reqBody,
        });

        if (!response.ok) {
          throw new Error('Failed to update schedule');
        }

        const updatedData = await response.json();
        // onSave({ days, startTime, endTime });
        setAlerts([])
        onClose();
      } catch (error) {
        console.error('Error saving schedule:', error);
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          { id: Date.now(), alertText: 'Failed to save schedule.', alertSeverity: "error", visible: true },
        ]);
      }
    }
  };

  return isOpen ? (
    <div className="modal">
      {alertVisible && (
        <div className="alert-container">
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
      <div className="modal-content">
        <h2>Edit Schedule</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div>
              <h3>Select Days</h3>
              {daysOfWeek.map((day) => (
                <label key={day}>
                  <input
                    type="checkbox"
                    value={day}
                    checked={days.includes(day)}
                    onChange={handleDaySelection}
                  />
                  {day}
                </label>
              ))}
            </div>
            <div>
              <label htmlFor="start-time">Start Time:</label>
              <select id="start-time" value={startTime} onChange={handleStartTimeChange}>
                {generateTimeOptions().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="end-time">End Time:</label>
              <select id="end-time" value={endTime} onChange={handleEndTimeChange}>
                {generateTimeOptions().filter((time) => timeTo24Hr(time) >= timeTo24Hr(startTime) + 1).map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-buttons">
              <button onClick={handleSave}>Save</button>
              <button className="modal-close" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  ) : null;
};

export default EditScheduleModal;