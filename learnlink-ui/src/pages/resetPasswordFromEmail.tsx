import Logo from '../components/Logo';
import CopyrightFooter from '../components/CopyrightFooter';
import { useNavigate, useParams } from 'react-router-dom';
import React, { useState } from 'react';
import './resetPasswordFromEmail.css';
import { set } from 'react-hook-form';


const ResetPasswordFromEmail: React.FC = () => {

    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(true);
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
            alert("Password reset successful!");
            navigate("/login");
        } else {
            setError(data.error || "Something went wrong");
            if (data.error === "Invalid or expired token") {
                alert("Invalid or expired token");
                navigate("/forgotpassword");
            }
        }
    };

    return (
        <div className='resetPasswordFromEmail-Page'>
            <div className='Logo2-rpfe'>
                <Logo />
            </div>
            <div className="forgotPasswordFromEmail">
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