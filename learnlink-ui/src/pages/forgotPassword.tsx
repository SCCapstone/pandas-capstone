import Logo from '../components/Logo';
import './forgotPassword.css';
import CopyrightFooter from '../components/CopyrightFooter';
import {useNavigate} from 'react-router-dom';
import React, {useState} from 'react';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!email) {
            setError('Enter your email');
            return;
        }
        setLoading(true);
        setSuccess(null);
        setError(null);

        try {
            const response = await fetch ('http://localhost:2020/api/forgotpassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
            });

            if(!response.ok){
                throw new Error("Failed to send reser link");
            }

            setSuccess('Password reset link sent! Check Your Email.')
            setEmail('');

        } catch (err) {
            setError('Could not send the reset link. Please try again.');
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
                    <button className="send" disabled={loading} type="submit">{loading ? 'Sending...' : 'Send Reset Link'}</button>
                </form>
            </div>
            <div>
                <CopyrightFooter />
            </div>
        </div>
    );
}

export default ForgotPassword;