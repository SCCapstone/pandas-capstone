import React from 'react';
import { Alert } from '@mui/material';
import './CustomAlert.css';
import { FaXmark } from 'react-icons/fa6';

interface CustomAlertProps {
    text: string;
    severity: "error" | "warning" | "info" | "success";
    onClose: () => void;

}

const CustomAlert: React.FC<CustomAlertProps> = ({ text, severity, onClose }) => {
    const [visible, setVisible] = React.useState(true);

    if (!visible) return null;

    return (
        <Alert className={`customAlert ${severity}`} severity={severity}>
            <div className='alertInfo'>
                <h1>
                    {severity === "error" ? "Error: " : severity === "warning" ? "Warning: " : severity === "info" ? "Info: " : "Success: "}
                </h1>
                <p>{text}</p>
            </div>
            <div className='alertActions'>
                <button className="alertX" onClick={() => { onClose(); }}><FaXmark /></button>
            </div>
        </Alert>
    );
};

export default CustomAlert;