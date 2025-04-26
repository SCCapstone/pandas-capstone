import Logo from '../components/Logo';
import './forgotPassword.css';

import CopyrightFooter from '../components/CopyrightFooter';
import {Navigate, useNavigate} from 'react-router-dom';
import React, {useState} from 'react';
import ResendEmail from '../components/ResendEmail';
import CustomAlert from '../components/CustomAlert';

// Component definition
const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
    const alertVisible = alerts.some(alert => alert.visible);
    // API URL (fallback to localhost for development)
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };
    // Email validation function
    const validateEmail = (email: string): boolean => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    };
    // Handles form submission for sending reset link
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(email)

                // If email field is empty, show an error alert
        if(!email) {
            setError('Enter your email');
            setAlerts((prevAlerts) => [
                ...prevAlerts,
                { id: Date.now(), alertText: 'Email field cannot be blank', alertSeverity: "error", visible: true },
            ]);
            return;
        }

        if (!validateEmail(email)) {
            setAlerts((prevAlerts) => [
                ...prevAlerts,
                { id: Date.now(), alertText: 'Enter a valid email address', alertSeverity: "error", visible: true },
            ]);
            setError('Enter a valid email address');
            return;
        }
        // Start loading state and reset messages
        setLoading(true);
        setSuccess(null);
        setError(null);

        try {
                        // Send POST request to backend API
            const response = await fetch (`${REACT_APP_API_URL}/api/forgot-password/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
            });

                        // If the response is not ok, handle the error
            if(!response.ok){
                setAlerts((prevAlerts) => [
                    ...prevAlerts,
                    { id: Date.now(), alertText: 'Failed to send reset link.', alertSeverity: "error", visible: true },
                ]);
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to send reset link");
            }
            
                        // Show success message if request was successful
            setAlerts((prevAlerts) => [
                ...prevAlerts,
                { id: Date.now(), alertText: 'Password reset link sent! Check Your Email.', alertSeverity: "success", visible: true },
            ]);

            setSuccess('Password reset link sent! Check Your Email.');
            setEmail('');

        } catch (err) {
            console.error(err);  // Log the error for debugging purposes
            setError(err instanceof Error ? err.message : 'Could not send the reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='forgotPassword-page'>
            <div className="Logo2" onClick={() => navigate('/welcome')}>
                <Logo />
            </div>
            <div className="forgotPassword">
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
                <div className="forgotPassword-container">
                    <h1>Forgot Password</h1>
                    <form className="container1" onSubmit={handleSubmit}>
                        <label>Email</label>
                        <input type="email"
                            placeholder="example@learnlink.com"
                            name="email"
                            onChange={handleChange}
                            required
                        ></input>
                        {error && <p className="error">{error}</p>}
                        {success && <p className="success">{success}</p>}
                        <ResendEmail email={email} />
                        <p style={{ fontStyle: 'italic' }}>* Email may take up to 15 minutes to arrive.</p>


                        {/* <button className="send" disabled={loading} type="submit">{loading ? 'Sending...' : 'Send Reset Link'}</button> */}
                    </form>
                </div>
            </div>
            <div>
                <CopyrightFooter />
            </div>
        </div>
    );
}

export default ForgotPassword;