import { JSX, useState } from "react";
import { Plus, Calendar, Table } from "lucide-react";
import './PlusButtonProps.css';

interface PlusButtonProps {
    onSelect: (element: JSX.Element) => void;
    studyGroupId: number | null;
    selectedChatId: string | null;
    onSendButtonMessage: (buttonData: { action: string; studyGroupId?: number; label: string }) => void; // 👈 Pass this function from Messaging.tsx
}

export default function PlusButton({ onSelect, studyGroupId, selectedChatId, onSendButtonMessage }: PlusButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

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

    const handleSelect = (value: string) => {
        console.log('beep');

        if (!selectedChatId) return; // Ensure a chat is selected

        const parsedStudyGroupId = isNaN(parseInt(selectedChatId, 10)) ? undefined : parseInt(selectedChatId, 10);

        const buttonData = {
            action: value, // "weekly-scheduler" or "calendar-event"
            studyGroupId: parsedStudyGroupId,  // Will be a number or undefined
            label: value === "weekly-scheduler" ? "📅 Open Weekly Scheduler" : "🗓️ Add Calendar Event",
        };

        // 🔄 Instead of calling handleSendButtonMessage, call the passed function from Messaging.tsx
        onSendButtonMessage(buttonData); 

        setIsOpen(false); // Close the selection UI
    };

    return (
        <div className="plus-button-container">
            <button className="plus-button" onClick={() => setIsOpen(!isOpen)}>
                <Plus size={30} color="White" />
            </button>

            <div className={`plus-menu ${isOpen ? "open" : ""}`}>
                {options.map((option) => (
                    <button
                        className="plus-menu-buttons"
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                    >
                        {option.icon}
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
