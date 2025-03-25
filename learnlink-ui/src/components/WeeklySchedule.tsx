import React, { useState, useRef } from "react";
import "./WeeklySchedule.css"; // Ensure you have this CSS file
import { set } from "react-hook-form";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM"];

type Day = typeof days[number];
type Availability = Record<Day, string[]>;

const WeeklySchedule: React.FC = () => {
    const [availability, setAvailability] = useState<Availability>({
        Sunday: [],
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
    });

    const [isDragging, setIsDragging] = useState(false);
    const [draggingDay, setDraggingDay] = useState<Day | null>(null);
    const [startTimeSlot, setStartTimeSlot] = useState<string | null>(null);
    const [endTimeSlot, setEndTimeSlot] = useState<string | null>(null);

    const scheduleRef = useRef<HTMLDivElement | null>(null);

    // Handle when a user starts dragging (mousedown)
    const handleMouseDown = (day: Day, timeSlot: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("FrrrrREAK")

        setIsDragging(true);
        setDraggingDay(day);
        setStartTimeSlot(timeSlot);
        setEndTimeSlot(timeSlot);
    };

    // Handle when a user moves the mouse while dragging
    const handleMouseMove = (day: Day, timeSlot: string, e: React.MouseEvent) => {
        if (isDragging && draggingDay === day) {
            e.preventDefault();
            e.stopPropagation();
            setEndTimeSlot(timeSlot);
        }
    };

    // Handle when the user releases the mouse
    const handleMouseUp = () => {
        console.log("FREAK")
        if (isDragging && draggingDay && startTimeSlot && endTimeSlot) {
            const startIndex = timeSlots.indexOf(startTimeSlot);
            const endIndex = timeSlots.indexOf(endTimeSlot);
            const [start, end] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];

            setAvailability((prevState) => {
                const newAvailability = { ...prevState };
                const selectedSlots = timeSlots.slice(start, end + 1);
                newAvailability[draggingDay] = Array.from(new Set([...newAvailability[draggingDay], ...selectedSlots]));
                return newAvailability;
            });
        }

        setIsDragging(false);
        setDraggingDay(null);
        setStartTimeSlot(null);
        setEndTimeSlot(null);
    };

    // Toggle selection on click
    const handleTimeSlotClick = (day: Day, timeSlot: string, e: React.MouseEvent) => {
        setIsDragging(false)
        if (isDragging) return; // Ignore clicks during drag
    
        e.preventDefault();
        e.stopPropagation();
    
        setAvailability((prevState) => {
            const currentSlots = prevState[day] || [];
            const isSelected = currentSlots.includes(timeSlot);
    
            console.log(`Before update: ${day} ->`, currentSlots);
    
            const updatedSlots = isSelected
                ? currentSlots.filter((slot) => slot !== timeSlot) // Remove if already selected
                : [...currentSlots, timeSlot]; // Add if not selected
    
            console.log(`After update: ${day} ->`, updatedSlots);
    
            return { ...prevState, [day]: updatedSlots };
        });
    };
    
    
    return (
        <div
            className="schedule-container"
            ref={scheduleRef}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp} // Ensure selection stops when leaving container
        >
            <div className="time-slot-header">
                <div className="empty-cell"></div>
                {days.map((day) => (
                    <div key={day} className="day-header">
                        {day}
                    </div>
                ))}
            </div>

            {timeSlots.map((timeSlot) => (
                <div key={timeSlot} className="time-slot-row">
                    <div className="time-slot">{timeSlot}</div>
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
                            <div
                                key={`${day}-${timeSlot}`}
                                className={`cell ${isSelected || isInRange ? "selected" : ""}`}
                                onMouseDown={(e) => handleMouseDown(day, timeSlot, e)}
                                onMouseMove={(e) => handleMouseMove(day, timeSlot, e)}
                                onMouseUp={(e) => handleMouseUp()} // Ensure drag releases properly
                                onClick={(e) => handleTimeSlotClick(day, timeSlot, e)}
                            >
                                {isSelected || isInRange ? "✔" : ""}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default WeeklySchedule;
