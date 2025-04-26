import React from 'react';
import './FullScreenAlert.css';
import { RiErrorWarningFill } from "react-icons/ri";

// Defining the types for the props that the ConfirmPopup component will receive
interface ConfirmPopupProps {
    message: string;
    HeaderText?: string;
    buttonText?: string;
    OnCancel: () => void;
}

// Creating the ConfirmPopup component with props defined above
const ConfirmPopup: React.FC<ConfirmPopupProps> = ({ message, HeaderText= "Alert", buttonText = "Okay", OnCancel}) => {

    return (
                // Main overlay that covers the screen to show the full-screen popup
        <div className="fullscreen-popup-overlay">
            <div className="fullscreen-popup">
                <div className='fullscreen-header'>
                    <RiErrorWarningFill className='warningIcon' />
                    <h1>{HeaderText}</h1>
                </div>
                <p>{message}</p>
                <div className="fullscreen-popup-buttons">
                    <button className="okay" onClick={OnCancel}>{buttonText}</button>
                </div>
            </div>
        </div>
    );
};

// Exporting the ConfirmPopup component so it can be used in other parts of the app
export default ConfirmPopup;