import { useState } from "react";
import { Plus, Calendar, Table } from "lucide-react";
import './PlusButtonProps.css'

interface PlusButtonProps {
    onSelect: (option: string, studyGroupId?: string) => void;
    studyGroupId?: string;
}

export default function PlusButton({ onSelect, studyGroupId }: PlusButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    const options = [
        { label: "Weekly Scheduler", icon: <Table size={18} />, value: "weekly-scheduler" },
        { label: "Calendar Event", icon: <Calendar size={18} />, value: "calendar-event" },
    ];

    return (
        <div className="plus-button-container">
            {/* Floating + Button */}
            <button
                className="plus-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Plus size={30} color="White" />
            </button>

            {/* Pop-up Menu */}
            <div className={`plus-menu ${isOpen ? "open" : ""}`}>
                {options.map((option) => (
                    <button className="plus-menu-buttons"
                        key={option.value}
                        onClick={() => {
                            onSelect(option.value, studyGroupId);
                            setIsOpen(false); // Close menu on selection
                        }}
                    >
                        {option.icon}
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
