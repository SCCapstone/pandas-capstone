import Logo from '../components/Logo';
import './forgotPassword.css';

import CopyrightFooter from '../components/CopyrightFooter';
import {useNavigate} from 'react-router-dom';
import React, {useState} from 'react';
import ResendEmail from '../components/ResendEmail';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<string | null>(null);
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };
    // Email validation function
    const validateEmail = (email: string): boolean => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!email) {
            setError('Enter your email');
            return;
        }

        if (!validateEmail(email)) {
            setError('Enter a valid email address');
            return;
        }

        setLoading(true);
        setSuccess(null);
        setError(null);

        try {
            const response = await fetch (`${REACT_APP_API_URL}/api/forgot-password/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
            });

            if(!response.ok){
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to send reset link");
            }

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
        <div>
            <div className="Logo2">
                <Logo />
            </div>
            <div className="forgotPassword">
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

                    {/* <button className="send" disabled={loading} type="submit">{loading ? 'Sending...' : 'Send Reset Link'}</button> */}
                </form>
            </div>
            <div>
                <CopyrightFooter />
            </div>
        </div>
    );
}

export default ForgotPassword;