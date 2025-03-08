import React from 'react';
import './ConfirmPopup.css';
import { RiErrorWarningFill } from "react-icons/ri";

interface ConfirmPopupProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmPopup: React.FC<ConfirmPopupProps> = ({ message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel" }) => {
    return (
        <div className="confirm-popup-overlay">
            <div className="confirm-popup">
                <div className='confirm-header'>
                    <RiErrorWarningFill className='warningIcon' />
                    <h1>Are you sure?</h1>
                </div>
                <p>{message}</p>
                <div className="confirm-popup-buttons">
                    <button className='confirm' onClick={onConfirm}>{confirmText}</button>
                    <button className="cancel" onClick={onCancel}>{cancelText}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmPopup;