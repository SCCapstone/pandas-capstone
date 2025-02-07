import { useState } from "react";
import "./components.css";

interface ResendEmailProps {
    email: string;
}

interface ApiResponse {
    success: boolean;
}

const ResendEmail = ({ email }: ResendEmailProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

    const handleResend = async () => {
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(`${REACT_APP_API_URL}/api/send-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    to: email,
                    subject: "Resend Test Email",
                    html: "<p>This is a test email from Resend.</p>",
                }),
            });

            const data: ApiResponse = await response.json();
            if (data.success) {
                setMessage("Email sent successfully!");
            } else {
                setMessage("Failed to send email.");
            }
        } catch (error) {
            setMessage("Error sending email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button className="send-email-btn" onClick={handleResend} disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
            </button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ResendEmail;