import Logo from '../components/Logo';
import CopyrightFooter from '../components/CopyrightFooter';
import { useNavigate, useParams } from 'react-router-dom';
import React, { useState } from 'react';
import './resetPasswordFromEmail.css';
import { set } from 'react-hook-form';
import CustomAlert from '../components/CustomAlert';


const ResetPasswordFromEmail: React.FC = () => {

    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
    const alertVisible = alerts.some(alert => alert.visible);

    const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

  
    React.useEffect(() => {
        const validatePassword = (): boolean => {
            if (password === "" || confirmPassword === "") {
                setError("");
                setDisabled(true);
                return false;
                
            } else if (password === confirmPassword) {
                setError("");
                setDisabled(false);
                return true;
            } else {
                setError("Passwords do not match");
                // setAlerts((prevAlerts) => [
                //     ...prevAlerts,
                //     { id: Date.now(), alertText: 'Passwords do not match', alertSeverity: "error", visible: true },
                // ]);
                setDisabled(true);
                return false;
            }
        };

        validatePassword();
    }, [password, confirmPassword]);
    

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (password !== confirmPassword) {
            console.log("Passwords do not match");
            setError("Passwords do not match");
            setAlerts((prevAlerts) => [
                ...prevAlerts,
                { id: Date.now(), alertText: 'Passwords do not match', alertSeverity: "error", visible: true },
            ]);
            setLoading(false);
            return;
        }
        const response = await fetch(`${REACT_APP_API_URL}/api/reset-password/email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
        });

        const data = await response.json();
        if (response.ok) {
            setLoading(false);
            console.log(data);
            // alert("Password reset successful!");
            setAlerts((prevAlerts) => [
                ...prevAlerts,
                { id: Date.now(), alertText: 'Password reset successful', alertSeverity: "success", visible: true },
            ]);

            navigate("/login");
        } else {
            setError(data.error || "Something went wrong");
            if (data.error === "Invalid or expired token") {
                // alert("Invalid or expired token");
                setAlerts((prevAlerts) => [
                    ...prevAlerts,
                    { id: Date.now(), alertText: "Invalid or expired token", alertSeverity: "error", visible: true },
                ]);
                navigate("/forgotpassword");
            } else {
                setAlerts((prevAlerts) => [
                    ...prevAlerts,
                    { id: Date.now(), alertText: 'Something went wrong', alertSeverity: "error", visible: true },
                ]);
            }
        }
    };

    return (
        <div className='resetPasswordFromEmail-Page'>
            <div className='Logo2-rpfe'>
                <Logo />
            </div>
            <div className="forgotPasswordFromEmail">
                {alertVisible && (
                    <div className='alert-container'>
                        {alerts.map(alert => (
                            <CustomAlert
                                key={alert.id}
                                text={alert.alertText || ''}
                                severity={alert.alertSeverity || 'info' as "error" | "warning" | "info" | "success"}
                                onClose={() => setAlerts(prevAlerts => prevAlerts.filter(a => a.id !== alert.id))}
                            />
                        ))}
                    </div>
                )}
                <h1>Reset Password</h1>
                <form className="forgotpassword-container" onSubmit={handleResetPassword}>
                    <label>New Password</label>
                    <input
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); }}
                    />

                    <label>Confirm Password</label>
                    <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); }}
                    />
                    <div className='error'>
                        {error && <span>* {error}</span>}

                    </div>
                    <button type="submit" className="send-email-btn" disabled={disabled}>
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>
            </div>
            <div>
                <CopyrightFooter />
            </div>
        </div>

    );
}

export default ResetPasswordFromEmail;