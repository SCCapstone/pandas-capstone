import React from 'react';
import { Alert } from '@mui/material';
import './CustomAlert.css';
import { FaXmark } from 'react-icons/fa6';

// Defining the interface for the props that CustomAlert will receive
interface CustomAlertProps {
    text: string;  // The text to display in the alert
    severity: "error" | "warning" | "info" | "success";  // The severity of the alert (used for styling)
    onClose: () => void;  // The function to call when the alert is closed
}

const CustomAlert: React.FC<CustomAlertProps> = ({ text, severity, onClose }) => {
    // State to control the visibility of the alert
    const [visible, setVisible] = React.useState(true);

    // If the alert is not visible, return null to render nothing
    if (!visible) return null;

    return (
        <Alert className={`customAlert ${severity}`} severity={severity} data-testid="custom-alert" >
            {/* Alert Content */}
            <div className='alertInfo'>
                {/* Display a custom heading based on the severity */}
                <h1>
                    {severity === "error" ? "Error: " : severity === "warning" ? "Warning: " : severity === "info" ? "Info: " : "Success: "}
                </h1>
                <p>{text}</p>  {/* Display the alert text */}
            </div>

            {/* Alert Actions (close button) */}
            <div className='alertActions'>
                <button className="alertX" onClick={() => { onClose(); }}>  {/* Close button */}
                    <FaXmark />  {/* Using an icon for the close button */}
                </button>
            </div>
        </Alert>
    );
};

export default CustomAlert;
