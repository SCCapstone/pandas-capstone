import { JSX, useState } from "react";
import { Plus, Calendar, Table } from "lucide-react";
import {createCalendarEvent} from '../utils/messageUtils';
import CalendarEventPopup from "./CalendarEventPopup";
import './PlusButtonProps.css';

interface PlusButtonProps {
    onSelect: (element: JSX.Element) => void;
    studyGroupId: number | null;
    selectedChatId: number | null;
    onSendButtonMessage: (buttonData: { action: string; studyGroupId?: number; label: string }) => void; // 👈 Pass this function from Messaging.tsx
  }

export default function PlusButton({ onSelect, studyGroupId, selectedChatId, onSendButtonMessage}: PlusButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [calendarModalOpen, setCalendarModalOpen] = useState(false);
    const [calendarEventURL, setCalendarEventURL] = useState<string | null>(null);
    

    const options = [
        {
            label: "Weekly Scheduler",
            icon: <Table size={18} />,
            value: "weekly-scheduler",
        },
        {
            label: "Calendar Event",
            icon: <Calendar size={18} />,
            value: "calendar-event",
        },
    ];
    const convertTo12HourFormat = (time: string) => {
        const [hours, minutes] = time.split(":").map(Number);
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
      
        const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
        return date.toLocaleTimeString([], options);
      };

    const handleCalendarURL = (eventDetails: {
        title: string;
        date: string;
        startTime: string;
        endTime: string;
        description: string;
        location: string;
      }) => { 
        const eventURL = createCalendarEvent(eventDetails);
        setCalendarEventURL(eventURL);
      
        if (selectedChatId) {
          const validStudyGroupId = studyGroupId ?? undefined; 
      
          const buttonData = {
            action: `calendar-event,${eventURL}`, // Append URL here
            studyGroupId: validStudyGroupId,
            label: `🗓️ Add to Calendar\n\nTitle: ${eventDetails.title}\nOn: ${eventDetails.date}\nFrom: ${convertTo12HourFormat(eventDetails.startTime)} to ${convertTo12HourFormat(eventDetails.endTime)}\nAt: ${eventDetails.location}`,
        };
          
        // if (selectedChatId) {
        //     const validStudyGroupId = studyGroupId ?? undefined; 
        
        //     const buttonData = {
        //       action: `calendar-event,${eventDetails}`, // Append URL here
        //       studyGroupId: validStudyGroupId,
        //       label: `🗓️ Add to Calendar`
        //   };

          console.log('sedning buttondata', buttonData.label)
    
          onSendButtonMessage(buttonData);
          setIsOpen(false);

        }
      };
      

      const handleSelect = (value: string) => {
        console.log("Selected value:", value);
      
        if (!selectedChatId) return; 
      
        if (value === "calendar-event") {
          setCalendarModalOpen(true);
          return; // Don't proceed further until the modal is submitted
        }
      
        const validStudyGroupId = studyGroupId ?? undefined; 
      
        const buttonData = {
          action: value,
          studyGroupId: validStudyGroupId,
          label: "📅 Open Weekly Scheduler",
        };
      
        onSendButtonMessage(buttonData);
        setIsOpen(false);
  };



  return (
    <div className="plus-button-container"  data-testid="plus-button-c" >
      <button className="plus-button" onClick={() => setIsOpen(!isOpen)} data-testid="plus-button" aria-label="Open menu">
        <Plus size={30} color="White" />
      </button>
      <div className={`plus-menu ${isOpen ? "open" : ""}`}>
  {options.map((option) => {
    const isWeeklyScheduler = option.value === "weekly-scheduler";
    const isDisabled = isWeeklyScheduler && !studyGroupId;
    
    return (
      <div 
        key={option.value}
        className="plus-menu-item-wrapper"
        style={{ position: 'relative' }} // Needed for tooltip positioning
      >
        <button
          className={`plus-menu-buttons ${isDisabled ? "disabled" : ""}`}
          onClick={isDisabled ? undefined : () => handleSelect(option.value)}
          disabled={isDisabled}
          data-tooltip={isDisabled ? "This option is only available for study groups" : ""}
        >
          {option.icon}
          {option.label}
        </button>
        {isDisabled && (
          <div className="plus-button-disabled-tooltip">
            This option is only <br></br>available for study groups
          </div>
        )}
      </div>
    );
  })}
</div>
      <CalendarEventPopup
        open={calendarModalOpen}
        onClose={() => {
          setCalendarModalOpen(false);
          setIsOpen(false)
        }}
        onSubmit={(eventDetails) => {
          handleCalendarURL(eventDetails); // Implement this to open the calendar app
          setCalendarModalOpen(false);
        }}
      />
    </div>
  );
}
