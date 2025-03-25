import React, { useState } from "react";
import { getLoggedInUserId } from "../utils/auth";
import "./WeeklySchedule.css";

const days = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"] as const;
const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM"];
const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

  export interface StudyGroup {
    id: number;
    name: string;
    description: string;
    profilePic?: string;
  }

type Day = typeof days[number];
type Availability = Record<Day, string[]>;

interface WeeklyScheduleProps {
    studyGroupId: number;
  }
  
  const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({ studyGroupId }) => {
    console.log(`Displaying availability for Study Group ${studyGroupId}`);

  
    const [availability, setAvailability] = useState<Availability>({
        Sun: [],
        Mon: [],
        Tues: [],
        Wed: [],
        Thur: [],
        Fri: [],
        Sat: [],
    });
    const [isDragging, setIsDragging] = useState(false);
    const [draggingDay, setDraggingDay] = useState<Day | null>(null);
    const [startTimeSlot, setStartTimeSlot] = useState<string | null>(null);
    const [endTimeSlot, setEndTimeSlot] = useState<string | null>(null);
    const [currStudyGroup, setCurrStudyGroup] = useState<StudyGroup | null>(null);

    const handleMouseDown = (day: Day, timeSlot: string, e: React.MouseEvent) => {
        e.preventDefault();
        setDraggingDay(day);
        setIsDragging(true);
        setStartTimeSlot(timeSlot);
        setEndTimeSlot(timeSlot);
    };

    const handleMouseMove = (day: Day, timeSlot: string, e: React.MouseEvent) => {
        if (isDragging && draggingDay === day) {
            setEndTimeSlot(timeSlot);
        }
    };

    const handleMouseUp = () => {
        if (!isDragging || !draggingDay || !startTimeSlot || !endTimeSlot) return;

        const startIndex = timeSlots.indexOf(startTimeSlot);
        const endIndex = timeSlots.indexOf(endTimeSlot);
        const [start, end] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];

        setAvailability((prevState) => ({
            ...prevState,
            [draggingDay]: Array.from(new Set([...prevState[draggingDay], ...timeSlots.slice(start, end + 1)])),
        }));

        setIsDragging(false);
        setDraggingDay(null);
        setStartTimeSlot(null);
        setEndTimeSlot(null);
    };

    const handleTimeSlotClick = (day: Day, timeSlot: string, e: React.MouseEvent) => {
        if (isDragging) return;

        setAvailability((prevState) => ({
            ...prevState,
            [day]: prevState[day].includes(timeSlot)
                ? prevState[day].filter((slot) => slot !== timeSlot)
                : [...prevState[day], timeSlot],
        }));
    };

    const saveAvailability = async () => {
        const userId = getLoggedInUserId(); // Replace with the actual logged-in user ID
      
        const response = await fetch(`${REACT_APP_API_URL}/api/studyGroup/${studyGroupId}/availability`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            availability,
          }),
        });
      
        if (response.ok) {
          console.log("Availability saved successfully");
        } else {
          console.log("Failed to save availability");
        }
      };

      const getStudyGroup = async () => {
        const userId = getLoggedInUserId(); // Replace with the actual logged-in user ID
        
        try {
          const response = await fetch(`${REACT_APP_API_URL}/api/study-groups/${studyGroupId}`, {
            method: "GET", // Use GET method to fetch data, not POST
            headers: {
              "Content-Type": "application/json",
              // Optionally, you could include an Authorization header if needed:
              // Authorization: `Bearer ${authToken}`,
            },
          });
      
          if (!response.ok) {
            throw new Error("Failed to fetch study group");
          }
      
          const studyGroupData = await response.json();
          setCurrStudyGroup(studyGroupData); // Assuming you want to set the response in state
      
        } catch (error) {
          console.error(error);
        }
      };
      
    return (
        <div className="schedule-page">
            <div className="schedule-table-legend">
                <table className="schedule-table" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                    <thead>
                        <tr>
                            <th className="empty-cell"></th>
                            {days.map((day) => (
                                <th key={day}>{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map((timeSlot) => (
                            <tr key={timeSlot}>
                                <td className="time-slot">{timeSlot}</td>
                                {days.map((day) => {
                                    const isSelected = availability[day].includes(timeSlot);
                                    const isInRange =
                                        isDragging &&
                                        draggingDay === day &&
                                        startTimeSlot &&
                                        endTimeSlot &&
                                        timeSlots.indexOf(timeSlot) >= timeSlots.indexOf(startTimeSlot) &&
                                        timeSlots.indexOf(timeSlot) <= timeSlots.indexOf(endTimeSlot);

                                    return (
                                        <td
                                            key={`${day}-${timeSlot}`}
                                            className={`cell ${isSelected || isInRange ? "selected" : ""}`}
                                            onMouseDown={(e) => handleMouseDown(day, timeSlot, e)}
                                            onMouseMove={(e) => handleMouseMove(day, timeSlot, e)}
                                            onClick={(e) => handleTimeSlotClick(day, timeSlot, e)}
                                        >
                                            {isSelected || isInRange ? "" : ""}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
            <button onClick={saveAvailability}>Save Availability</button>

        </div>

    );
};

export default WeeklySchedule;