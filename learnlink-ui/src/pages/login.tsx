import './login.css';
import Logo from '../components/Logo';
import CopyrightFooter from '../components/CopyrightFooter';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import CustomAlert from '../components/CustomAlert';

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
    const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
    const alertVisible = alerts.some(alert => alert.visible);

    // Handle form inputs
    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value);
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

    // Handle form submission
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            setError("Username and password are required.");
            setAlerts((prevAlerts) => [
                ...prevAlerts,
                { id: Date.now(), alertText: "Username and password are required.", alertSeverity: "error", visible: true },
              ]);
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
                // setAlerts((prevAlerts) => [
                //     ...prevAlerts,
                //     { id: Date.now(), alertText: "Invalid username or password.", alertSeverity: "error", visible: true },
                //   ]);
                throw new Error("Invalid username or password.");
                
            }

            // Get the response body, which should contain a JWT or session data
            const data = await response.json();
            localStorage.setItem('token', data.token); // Store the JWT in localStorage

            // Navigate to landing page after successful login
            navigate('/swiping'); 
        } catch (error) {
            setError((error as Error).message);
            setAlerts((prevAlerts) => [
                ...prevAlerts,
                { id: Date.now(), alertText: (error as Error).message, alertSeverity: "error", visible: true },
              ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='loginPage'>
            <div className="Logo2-login">
                <Logo />
            </div>
            <div className="login">
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
                <div className="login-container">

                    <form onSubmit={handleLogin} className="login-form">
                    <h1 className="login_title">Login</h1>
                    <h2 className="enter_title">Enter your credentials to login.</h2>
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
                            data-testid="testpassword"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                        />
                        {error && <p className="error">{error}</p>}

                        <div className="forgot">
                            <span onClick={() => navigate('/forgotpassword')}>Forgot password?</span>
                        </div>

                        <button type="submit" disabled={loading} data-testid="testbutton" >
                            {loading ? "Logging in..." : "Login"}
                        </button>

                        <div className="or">
                            <label>Or</label>
                        </div>

                        <button
                            type="button" // Prevent form submission
                            onClick={() => navigate('/signup')}>
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
