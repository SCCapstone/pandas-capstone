import React, { useState, useEffect } from "react";
import { getLoggedInUserId } from "../utils/auth";
import "./WeeklySchedule.css";
import EditScheduleModal from './EditScheduleModal';  // Import the modal component


// const days = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"] as const;
// const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM"];
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
    const [hoveredSlot, setHoveredSlot] = useState<{ day: string; timeSlot: string } | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);

    // const [schedule, setSchedule] = useState({
    //     days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    //     startTime: '09:00 AM',
    //     endTime: '05:00 PM',
    //   });
    const [days, setDays] = useState(["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"]);
    const [timeSlots, setTimeSlots] = useState(["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM"]);
    const [scheduleStartTime, setScheduleStartTime] = useState<string>("9:00 AM");
    const [scheduleEndTime, setScheduleEndTime] = useState<string>("5:00 PM");
    type Day = typeof days[number];
    type Availability = Record<Day, string[]>;
    const [isModalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(true)

    const openEditModal = () => setModalOpen(true);
    const closeEditModal = () => setModalOpen(false);

    function generateTimeSlots(startTime: string, endTime: string): string[] {
        const times: string[] = [];
        let currentTime = new Date(`1970-01-01T${convertTo24Hour(startTime)}:00`);
        const end = new Date(`1970-01-01T${convertTo24Hour(endTime)}:00`);
    
        while (currentTime <= end) {
            times.push(formatAMPM(currentTime));
            currentTime.setMinutes(currentTime.getMinutes() + 30);
        }
    
        return times;
    }
    
    function convertTo24Hour(time: string): string {
        const [timePart, modifier] = time.split(" ");
        let [hours, minutes] = timePart.split(":").map(Number);
    
        if (modifier === "PM" && hours !== 12) {
            hours += 12;
        } else if (modifier === "AM" && hours === 12) {
            hours = 0;
        }
    
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }
    
    function formatAMPM(date: Date): string {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
    
        hours = hours % 12 || 12; // Convert 0 to 12 for AM
        const minutesStr = String(minutes).padStart(2, "0");
    
        return `${hours}:${minutesStr} ${ampm}`;
    }
    
    // Fetch current schedule when modal opens
    useEffect(() => {
        {
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
                    const response = await fetch(`${REACT_APP_API_URL}/api/study-groups/${studyGroupId}/schedule`, {
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
                    // Assuming the response contains the schedule info
                    setDays(data.scheduleDays || []);
                    setScheduleStartTime(data.scheduleStartTime || "9:00 AM");
                    setScheduleEndTime(data.scheduleEndTime || "5:00 PM");
                    setTimeSlots(generateTimeSlots(scheduleStartTime,scheduleEndTime))
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
    }, [isModalOpen, studyGroupId]);
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
            setCurrStudyGroup(studyGroupData.studyGroup);
            setUsers(studyGroupData.studyGroup.users);
            const usersAvailabilityData: Record<number, Availability> = {};

            // Populate users' availability
            studyGroupData.studyGroup.users.forEach((user: User) => {
                const userAvailability = availabilityData.find((item: any) => item.userId === user.id);
                if (userAvailability) {
                    const availabilityJson = userAvailability.availability;
                    const availabilityForUser: Availability = {
                        Sun: [],
                        Mon: [],
                        Tues: [],
                        Wed: [],
                        Thur: [],
                        Fri: [],
                        Sat: [],
                    };

                    Object.keys(availabilityJson).forEach((day: string) => {
                        availabilityForUser[day as Day] = availabilityJson[day] || [];
                    });

                    usersAvailabilityData[user.id] = availabilityForUser;
                }
            });

            // Now set the state for all users' availability
            setUsersAvailability(usersAvailabilityData);

        } catch (error) {
            console.error(error);
        }
    };

    // Save the current user's availability
    const saveAvailability = async () => {
        const userId = getLoggedInUserId();

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
            await getStudyGroup(); // Refresh study group data, including users' availability
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

    const getCellClass = (day: Day, timeSlot: string) => {
        // console.log("usersAvailable:")
        // Count the number of users available at this time slot
        const usersAvailable = users?.filter((user) => usersAvailability[user.id]?.[day]?.includes(timeSlot)).length || 0;
        const totalUsers = users?.length || 1;
        // console.log("totalUsers:", users?.length)

        // console.log("usersAvailable: for timeslot", day, timeSlot, usersAvailable)

        // Scale the opacity from transparent to semi-opaque to solid based on the number of users available
        const opacity = usersAvailable / totalUsers;

        // Return the appropriate class for the cell (semi-opaque to solid)
        return {
            backgroundColor: `rgba(0, 128, 0, ${opacity})`, // Green background with varying opacity
            // backgroundColor: `rgb(0, 102, 140, ${opacity})`, // Blue background with varying opacity

            color: opacity > 0.5 ? 'white' : 'black',  // Dark text when solid, light when transparent
        };
    };

    const getCellAvailability = (day: Day, timeSlot: string) => {
        // console.log("usersAvailable:")
        // users available at this time slot
        const usersAvailable = users?.filter((user) => usersAvailability[user.id]?.[day]?.includes(timeSlot));
        const countUsersAvailable = usersAvailable?.length;
        // users not available at this time slot
        const usersUnavailable = users?.filter(user => !usersAvailability[user.id]?.[day]?.includes(timeSlot));
        const countUsersUnavailable = usersUnavailable?.length;

        const countTotalUsers = users?.length

        // console.log("usersAvailable: for timeslot", day, timeSlot, usersAvailable)
        // console.log("users UnAvailable: for timeslot", day, timeSlot, usersUnavailable)

        return {
            usersAvailable,
            countUsersAvailable,
            usersUnavailable,
            countUsersUnavailable,
            countTotalUsers
        };
    };

    return (
        <div className="schedule-page">
            {/* Study Group Legend */}
            <div className="schedule-table-title">
                {currStudyGroup && (
                    <div>
                        <h1>Weekly Scheduler for Study Group: <span style={{ fontWeight: 350 }}>{currStudyGroup.name}</span></h1>
                        {/* <p>{currStudyGroup.description}</p> */}
                    </div>
                )}
                <button onClick={openEditModal}>Edit Schedule</button>
                {/* Pass props to the modal */}
                {currStudyGroup?.id && (
                    <EditScheduleModal
                        isOpen={isModalOpen}
                        onClose={closeEditModal}
                        groupId={currStudyGroup?.id}
                    />
                )}

            </div>
            <div className="schedule-tables-container">
                <div className="current-user-schedule">
                    <h2>Your Availability</h2>
                    <p>Click and drag to toggle. Save using button below.</p>

                    <table className="current-user-schedule-color-legend">
                        <thead>
                            <tr>
                                <td>Unavailable</td>
                                <td>Available</td>

                            </tr>

                        </thead>

                        <tbody>
                            <tr>
                                <td></td>
                                <td
                                    style={{ background: "#00678c93" }
                                    }></td>
                            </tr>
                        </tbody>
                    </table>
                    {/* Editable Schedule Table (Current User's Availability) */}
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
                    {/* Save Availability Button */}
                    <button className="save-button" onClick={saveAvailability}>Save Availability</button>
                </div>
                <div className="combined-group-schedule">

                    {/* Merged Users' Availability Table */}
                    <h2>Group's Combined Availability</h2>
                    <p>Hover on timeslots to see whose available.</p>
                    <table className="current-user-schedule-color-legend">
                        <thead>
                            <tr>
                                <td>0/{users?.length || 1} Available</td>
                                <td>{users?.length || 1}/{users?.length || 1} Available</td>

                            </tr>

                        </thead>

                        <tbody>
                            <tr>
                                <td></td>
                                <td
                                    style={{ background: "rgba(0,128,0)" }
                                    }></td>
                            </tr>
                        </tbody>
                    </table>

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
                                        const cellStyle = getCellClass(day, timeSlot);

                                        return (
                                            <td
                                                key={`${day}-${timeSlot}`}
                                                className="cell"
                                                style={cellStyle}
                                                onMouseEnter={(e) => {
                                                    setHoveredSlot({ day, timeSlot });
                                                    setMousePos({ x: e.pageX, y: e.pageY });
                                                }}
                                                onMouseMove={(e) => {
                                                    setMousePos({ x: e.pageX, y: e.pageY });
                                                }}
                                                onMouseLeave={() => setHoveredSlot(null)}
                                            >
                                                {cellStyle.backgroundColor !== "rgba(0, 128, 0, 0)" && ""}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Tooltip */}
                    {hoveredSlot && (() => {
                        const { usersAvailable, usersUnavailable, countUsersUnavailable, countUsersAvailable, countTotalUsers } = getCellAvailability(hoveredSlot.day as "Sun" | "Mon" | "Tues" | "Wed" | "Thur" | "Fri" | "Sat",
                            hoveredSlot.timeSlot);
                        const getTooltipPosition = () => {
                            const tooltipWidth = 200; // Adjust this based on your tooltip's width
                            const tooltipHeight = 150; // Adjust this based on your tooltip's height
                            const offset = 10; // Space between the mouse and tooltip

                            // Check if the tooltip goes beyond the right side of the screen
                            let tooltipX = mousePos.x + offset;
                            if (tooltipX + tooltipWidth > window.innerWidth) {
                                tooltipX = mousePos.x - tooltipWidth - offset; // Position to the left if it goes off the right edge
                            }

                            // Check if the tooltip goes beyond the bottom of the screen
                            let tooltipY = mousePos.y + offset;
                            if (tooltipY + tooltipHeight > window.innerHeight) {
                                tooltipY = mousePos.y - tooltipHeight - offset; // Position above if it goes off the bottom
                            }

                            return { top: tooltipY, left: tooltipX };
                        };

                        return (
                            <div
                                className="absolute bg-white shadow-lg p-2 border rounded-lg text-sm"
                                style={{
                                    top: getTooltipPosition().top,
                                    left: getTooltipPosition().left,
                                    position: "absolute",
                                    background: "#fff",
                                    padding: "16px",
                                    borderRadius: "8px",
                                    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
                                    fontFamily: "'Inter', sans-serif", // Clean modern font
                                    maxWidth: "300px",
                                    width: "fit-content",
                                    zIndex: 1000,
                                    transition: "opacity 0.3s ease-in-out", // Smooth fade in
                                    opacity: 1,
                                }}
                            >
                                <strong style={{ fontSize: "1.1rem", fontWeight: "600", lineHeight: "30px" }}>{countUsersAvailable}/{countTotalUsers} Available</strong> <br></br>

                                <strong style={{ fontSize: "1.05rem", fontWeight: "600" }}>Available:</strong>
                                <ul style={{ marginTop: "8px", paddingLeft: "15px", listStyle: "none" }}>
                                    {usersAvailable && usersAvailable.length > 0 ? (
                                        usersAvailable.map(user =>
                                            <li
                                                key={user.id}>
                                                <img
                                                    src={user.profilePic || 'https://learnlink-public.s3.us-east-2.amazonaws.com/AvatarPlaceholder.svg'}
                                                    alt={`${user.firstName} ${user.lastName}`}
                                                    className="tooltip-pfp"
                                                ></img>
                                                <div>
                                                    {user.firstName} {user.lastName}

                                                </div>
                                            </li>)
                                    ) : (
                                        <li className="text-gray-500">None</li>
                                    )}
                                </ul>
                                <strong style={{ fontSize: "1.05rem", fontWeight: "600" }}>Unavailable:</strong>
                                <ul style={{ marginTop: "8px", paddingLeft: "15px", listStyle: "none" }}>
                                    {usersUnavailable && usersUnavailable.length > 0 ? (
                                        usersUnavailable.map(user =>
                                            <li
                                                key={user.id}>
                                                <img
                                                    src={user.profilePic || 'https://learnlink-public.s3.us-east-2.amazonaws.com/AvatarPlaceholder.svg'}
                                                    alt={`${user.firstName} ${user.lastName}`}
                                                    className="tooltip-pfp"
                                                ></img>
                                                <div>
                                                    {user.firstName} {user.lastName}

                                                </div>
                                            </li>
                                        )
                                    ) : (
                                        <li className="text-gray-500">None</li>
                                    )}
                                </ul>
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};

export default WeeklySchedule;