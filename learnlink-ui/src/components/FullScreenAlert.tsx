import React from 'react';
import './FullScreenAlert.css';
import { RiErrorWarningFill } from "react-icons/ri";

interface ConfirmPopupProps {
    message: string;
    HeaderText?: string;
    buttonText?: string;
    OnCancel: () => void;
}

const ConfirmPopup: React.FC<ConfirmPopupProps> = ({ message, HeaderText= "Alert", buttonText = "Okay", OnCancel}) => {

    return (
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

export default ConfirmPopup;