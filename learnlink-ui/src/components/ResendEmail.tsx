import { useState } from "react";
import "./components.css";
import CustomAlert from '../components/CustomAlert';


interface ResendEmailProps {
    email: string;
}

interface ApiResponse {
    success: boolean;
}

const ResendEmail = ({ email }: ResendEmailProps) => {
        // State hooks for loading state, response message, and alerts
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';
    const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
    const alertVisible = alerts.some(alert => alert.visible);

        // Function to handle email resend request
    const handleResend = async () => {
        setLoading(true);
        setMessage("");

        try {
                        // Make POST request to API to send email
            const response = await fetch(`${REACT_APP_API_URL}/api/forgot-password/email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                }),
            });

            const data: ApiResponse = await response.json();
                       // Handle the response from the API
            if (data.success) {
                setAlerts((prevAlerts) => [
                    ...prevAlerts,
                    { id: Date.now(), alertText: 'Email sent successfully! \nPlease wait up to 15 minutes for it to arrive', alertSeverity: "success", visible: true },
                ]);
                setMessage("Email sent successfully!");
            } else {
                setAlerts((prevAlerts) => [
                    ...prevAlerts,
                    { id: Date.now(), alertText: 'Failed to send reset link.', alertSeverity: "error", visible: true },
                ]);
                setMessage("Failed to send email.");
            }
        } catch (error) {
                        // Handle any errors during the API call
            setAlerts((prevAlerts) => [
                ...prevAlerts,
                { id: Date.now(), alertText: 'Error sending email.', alertSeverity: "error", visible: true },
            ]);
            setMessage("Error sending email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
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
            <button className="send-email-btn" onClick={handleResend} disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
            </button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ResendEmail;