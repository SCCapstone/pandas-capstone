import './login.css';
import Logo from '../components/Logo';
import Copyright from '../components/CopyrightFooter';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { login } from '../services/authService';
import React, { useState } from 'react';

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
            const response = await fetch('http://localhost:2020/api/login', {
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
            navigate('/LandingPage'); 
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login">
            <div className="Logo2">
                <Logo />
            </div>
            <div className="container">
                <h1 className="l1">Login</h1>
                <h2 className="t2">Enter your credentials to login.</h2>
                <form onSubmit={handleLogin}>
                    <label>Username</label>
                    <input 
                        type="text"
                        placeholder="JohnDoe123"
                        value={username}
                        onChange={handleUsernameChange}
                        required
                    />
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                    />
                    {error && <p className="error">{error}</p>}

                    <div className="fp">
                        <label>Forgot password?</label>   
                    </div>

                    <button className="lButton" type="submit">Login</button>
                </form>
               

                <div className="or">
                    <label>OR</label>
                </div>
                
                <button 
                    className="sign" 
                    onClick={() => navigate('/signup')}
                >
                    Sign Up
                </button> 
            </div>

            <div className="Copyright">
                <Copyright/>
            </div>
        </div>
    );
}

export default Login;
