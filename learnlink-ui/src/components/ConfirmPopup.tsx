import React from 'react';
import './ConfirmPopup.css';
import { RiErrorWarningFill } from "react-icons/ri";

interface ConfirmPopupProps {
    message: string;
    onConfirm: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onCancel: (event: React.MouseEvent<HTMLButtonElement>) => void;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmPopup: React.FC<ConfirmPopupProps> = ({ message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel" }) => {
    const handleConfirm = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();  // Stops event propagation
        onConfirm(event);         // Executes the provided onConfirm handler
    };

    const handleCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();  // Stops event propagation
        onCancel(event);          // Executes the provided onCancel handler
    };
    
    return (
        <div className="confirm-popup-overlay">
            <div className="confirm-popup">
                <div className='confirm-header'>
                    <RiErrorWarningFill className='warningIcon' />
                    <h1>Are you sure?</h1>
                </div>
                <p>{message}</p>
                <div className="confirm-popup-buttons">
                    <button className='confirm' onClick={handleConfirm}>{confirmText}</button>
                    <button className="cancel" onClick={handleCancel}>{cancelText}</button>
                    
                </div>
            </div>
        </div>
    );
};

export default ConfirmPopup;