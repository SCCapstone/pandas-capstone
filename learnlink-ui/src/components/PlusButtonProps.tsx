import { JSX, useState } from "react";
import { Plus, Calendar, Table } from "lucide-react";
import './PlusButtonProps.css'

interface PlusButtonProps {
    onSelect: (element: JSX.Element) => void;
    studyGroupId: number | null;
}

export default function PlusButton({ onSelect, studyGroupId }: PlusButtonProps) {
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
        let element: JSX.Element | null = null;

        if (value === "weekly-scheduler") {
            element = (
                <button
                    className="chat-button"
                    onClick={() => console.log("Opening Weekly Scheduler")}
                >
                    📅 Open Weekly Scheduler
                </button>
            );
        } else if (value === "calendar-event") {
            element = (
                <button
                    className="chat-button"
                    onClick={() => console.log("Opening Calendar Event")}
                >
                    🗓️ Add Calendar Event
                </button>
            );
        }

        if (element) {
            onSelect(element);
        }
        setIsOpen(false);
    };

    return (
        <div className="plus-button-container">
            {/* Floating + Button */}
            <button className="plus-button" onClick={() => setIsOpen(!isOpen)}>
                <Plus size={30} color="White" />
            </button>

            {/* Pop-up Menu */}
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
