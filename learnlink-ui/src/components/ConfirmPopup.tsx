import React from 'react';
import './ConfirmPopup.css';
import { RiErrorWarningFill } from "react-icons/ri";

interface ConfirmPopupProps {
    message: string;
    onConfirm: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onCancel: (event: React.MouseEvent<HTMLButtonElement>) => void;
    confirmText?: string;
    cancelText?: string;
    datatestid?: string;
}

const ConfirmPopup: React.FC<ConfirmPopupProps> = ({ message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel" , datatestid}) => {
    // Handles the click event for confirming an action. 
    // It prevents the event from bubbling up and then calls the provided onConfirm callback.
    const handleConfirm = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();  // Stops event propagation
        onConfirm(event);         // Executes the provided onConfirm handler
    };

    // Handles the click event for cancelling an action. 
    // It prevents the event from bubbling up and then calls the provided onCancel callback.
    const handleCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();  // Stops event propagation
        onCancel(event);          // Executes the provided onCancel handler
    };
    
    return (
        <div className="confirm-popup-overlay">
            <div className="confirm-popup" data-testid={datatestid|| 'confirm-popup'}>
                <div className='confirm-header'>
                    <RiErrorWarningFill className='warningIcon' />
                    <h1>Are you sure?</h1>
                </div>
                <div data-testid="confirm-message">{message}</div>
                <div className="confirm-popup-buttons">
                    <button className='confirm' data-testid="confirm-button" onClick={handleConfirm}>{confirmText}</button>
                    <button className="cancel" onClick={handleCancel}>{cancelText}</button>
                    
                </div>
            </div>
        </div>
    );
};

export default ConfirmPopup;