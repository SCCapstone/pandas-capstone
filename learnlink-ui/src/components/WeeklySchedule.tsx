import React, { useState, useEffect } from "react";
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

export interface User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    age: number;
    gender?: string;
    college?: string;
    coursework?: string[];
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
    const [usersAvailability, setUsersAvailability] = useState<Record<number, Availability>>({}); // Track all users' availability
    const [users, setUsers] = useState<User[] | null>(null);

    // Fetch study group data and users' availability
    const getStudyGroup = async () => {
        const userId = getLoggedInUserId(); // Get the logged-in user ID
    
        try {
            // Fetch the study group data and all users' availability
            const response = await fetch(`${REACT_APP_API_URL}/api/studyGroup/${studyGroupId}/availability`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });
    
            if (!response.ok) {
                throw new Error("Failed to fetch study group data");
            }
    
            const availabilityData = await response.json();
    
            // Filter the availability data to find the current user's availability
            const currentUserAvailability = availabilityData.find((item: any) => item.userId === userId);
    
            if (currentUserAvailability) {
                // If the current user's availability is found, map it to the required format
                const userAvailability: Availability = {
                    Sun: [],
                    Mon: [],
                    Tues: [],
                    Wed: [],
                    Thur: [],
                    Fri: [],
                    Sat: [],
                };
    
                // Assuming availability is stored as a JSON object
                const availabilityJson = currentUserAvailability.availability;
                Object.keys(availabilityJson).forEach((day: string) => {
                    userAvailability[day as Day] = availabilityJson[day] || [];
                });
    
                // Set the current user's availability in state
                setAvailability(userAvailability);
            } else {
                console.error("Current user's availability not found");
            }
    
            // Fetch study group data (optional, if needed for the UI)
            const studyGroupResponse = await fetch(`${REACT_APP_API_URL}/api/study-groups/${studyGroupId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });
    
            if (!studyGroupResponse.ok) {
                throw new Error("Failed to fetch study group");
            }
    
            const studyGroupData = await studyGroupResponse.json();
            setCurrStudyGroup(studyGroupData);
            setUsers(studyGroupData.studyGroup.users);
    
        } catch (error) {
            console.error(error);
        }
    };
    
    // Save the current user's availability
    const saveAvailability = async () => {
        const userId = getLoggedInUserId(); // Replace with the actual logged-in user ID

        const response = await fetch(`${REACT_APP_API_URL}/api/studyGroup/${studyGroupId}/availability`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${localStorage.getItem('token')}`

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

    useEffect(() => {
        if (studyGroupId) {
            getStudyGroup();
        }
    }, [studyGroupId]);

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

    return (
        <div className="schedule-page">
          {/* Study Group Legend */}
          <div className="schedule-table-legend">
            {currStudyGroup && (
              <div>
                <h2>{currStudyGroup.name}</h2>
                <p>{currStudyGroup.description}</p>
              </div>
            )}
      
            {/* Editable Schedule Table (Current User's Availability) */}
            <h3>Your Availability</h3>
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
      
            {/* Merged Users' Availability Table */}
            <h3>Users' Combined Availability</h3>
            <table className="merged-availability-table">
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
                      // Check if all users are available at this time
                      const allAvailable = users?.every((user) => {
                        return usersAvailability[user.id]?.[day]?.includes(timeSlot);
                      });
      
                      // Determine the cell class based on availability
                      const cellClass = allAvailable ? "solid" : "translucent";
                      
                      return (
                        <td
                          key={`${day}-${timeSlot}`}
                          className={`cell ${cellClass}`}
                        >
                          {/* Optionally, display something here */}
                          {allAvailable && "✔"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      
          {/* Save Availability Button */}
          <button onClick={saveAvailability}>Save Availability</button>
        </div>
      );
};

export default WeeklySchedule;