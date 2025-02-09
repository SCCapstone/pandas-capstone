import './login.css';
import Logo from '../components/Logo';
import CopyrightFooter from '../components/CopyrightFooter';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

type LoginInputs = {
    userName: string;
    userPassword: string;
};

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Handle form inputs
    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value);
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

    // Handle form submission
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            setError("Username and password are required.");
            return;
        }

        setLoading(true);
        try {
            // Send POST request to backend
            console.log('Request URL:', `${REACT_APP_API_URL}/api/login`);
            const response = await fetch(`${REACT_APP_API_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error("Invalid username or password.");
            }

            // Get the response body, which should contain a JWT or session data
            const data = await response.json();
            localStorage.setItem('token', data.token); // Store the JWT in localStorage

            // Navigate to landing page after successful login
            navigate('/swiping'); 
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="Logo2">
                <Logo />
            </div>
            <div className="login">
                <div className="container">
                    <h1 className="login_title">Login</h1>
                    <h2 className="enter_title">Enter your credentials to login.</h2>
                    <form onSubmit={handleLogin}>
                        <label>Username</label>
                        <input 
                            id="username"
                            type="text"
                            placeholder="JohnDoe123"
                            value={username}
                            onChange={handleUsernameChange}
                            required
                        />
                        <label>Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                        />
                        {error && <p className="error">{error}</p>}

                        <div className="forgot" onClick={() => navigate('/forgotpassword')}>
                            Forgot password?
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </button>

                        <div className="or">
                            <label>Or</label>
                        </div>

                        <button
                            type="button" // Prevent form submission
                            onClick={() => navigate('/signup')} >
                            Sign Up
                        </button> 
                    </form>
                </div>
            </div>
            <footer>
                <CopyrightFooter />
            </footer>

        </div>
        
    );
}

export default Login;
