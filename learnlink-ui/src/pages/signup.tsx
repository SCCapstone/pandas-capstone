import React,  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './signup.css';
import Logo from '../components/Logo';
import Copyright from '../components/CopyrightFooter';
import { set } from 'react-hook-form';
import CustomAlert from '../components/CustomAlert';


type User = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string; // Hashing done on backend
    profile_preferences?: {
        // Undecided on what this will look like
    };
    created_at?: string;
    updated_at?: string;
    // Might need to add more later, notifs, matches etc.
};

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<User>({
        id: 0,
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        created_at: '',
        updated_at: '',
    });

    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';
    const alertVisible = alerts.some(alert => alert.visible);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
    };

    // Form submission
    const handleSignup = async (e: React.FormEvent) => {
        setAlerts([]);
        setError(null);
        setEmailError(null);
        setUsernameError(null);
        setPasswordError(null);
        e.preventDefault();

        if (formData.password !== confirmPassword) {
            console.log('Passwords do not match');
            setError('Passwords do not match');
            setPasswordError('Passwords do not match');
            setAlerts((prevAlerts) => [
                ...prevAlerts,
                { id: Date.now(), alertText:'Passwords do not match', alertSeverity: 'error', visible: true },
              ]);
            return;
        }

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.username || !formData.password) {
            console.log('All fields are required');
            setError('All fields are required');
            setAlerts((prevAlerts) => [
                ...prevAlerts,
                { id: Date.now(), alertText:'All fields are required', alertSeverity: 'error', visible: true },
              ]);
            return;
        }

        setLoading(true);

        try {
            // POST request
            const response = await fetch(`${REACT_APP_API_URL}/api/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    username: formData.username,
                    password: formData.password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log(errorData);

                // Handle unique warnings
                if (errorData.error === 'UsernameAlreadyExists') {
                    console.log('Username is already taken');
                    setError('Username is already taken');
                    setUsernameError('Username is already taken');
                    setAlerts((prevAlerts) => [
                        ...prevAlerts,
                        { id: Date.now(), alertText: 'Username is already taken', alertSeverity: 'error', visible: true },
                      ]);
                    // throw new Error('Username is already taken');
                    return;

                }

                if (errorData.error === 'EmailAlreadyExists') {
                    console.log('Email is already registered');
                    setError('Email is already registered');
                    setEmailError('Email is already registered');
                    setAlerts((prevAlerts) => [
                        ...prevAlerts,
                        { id: Date.now(), alertText: 'Email is already registered', alertSeverity: 'error', visible: true },
                      ]);
                    return;
                }

                if (errorData.error === 'NotEdu') {
                    console.log('Please use a .edu email');
                    setError('Please use a .edu email');
                    setEmailError('Please use a .edu email');
                    setAlerts((prevAlerts) => [
                        ...prevAlerts,
                        { id: Date.now(), alertText: 'Must use a .edu email ', alertSeverity: 'error', visible: true },
                      ]);
                    return;
                }
                console.log('Failed to create user');
                setError('Failed to create user');
                return;

            }

            // Clear form
            setFormData({
                id: 0,
                firstName: '',
                lastName: '',
                email: '',
                username: '',
                password: '',
                created_at: '',
                updated_at: '',
            });
            setConfirmPassword('');
            // setError(null);

            const responseData = await response.json();
            const token = responseData.token;
          
            // Store the JWT in localStorage
            localStorage.setItem('token', token);

            const emailResponse = await fetch(`${REACT_APP_API_URL}/api/sign-up-email`, {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: formData.email,
                }),
            });

            console.log(emailResponse);

            if (!emailResponse.ok) {
                const errorData = await emailResponse.json();
                setAlerts((prevAlerts) => [
                    ...prevAlerts,
                    { id: Date.now(), alertText: errorData.error || 'Failed to send sign up email.', alertSeverity: 'error', visible: true },
                  ]);
                throw new Error(errorData.error || 'Failed to send email');
            }

            setAlerts((prevAlerts) => [
                ...prevAlerts,
                { id: Date.now(), alertText: 'Sign up successful!', alertSeverity: 'success', visible: true },
              ]);
            
            // Navigate to landing page after successful signup
            navigate('/LandingPage');
        } catch (error) {
            setError('Failed to sign up. Please try again later.');
            setAlerts((prevAlerts) => [
                ...prevAlerts,
                { id: Date.now(), alertText:'Failed to sign up. Please try again later.', alertSeverity: 'error', visible: true },
              ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signupPage">
            <div className="Logo2-signup" onClick={() => navigate('/welcome')}>
                <Logo />
            </div>
            {/* Display the alert if it's visible */}
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
            
            <div className="signup">
                <div className="signup-container">
                    <h1 className="l1">Sign Up</h1>
                    <h2 className="t2">Enter your credentials to join LearnLink.</h2>

                    {/* Form to collect user data */}
                    <div className="signup-form">
                    <form onSubmit={handleSignup}>
                        <div className="nameFields">
                            <label>First Name</label>
                            <input
                                type="text"
                                placeholder="John"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="nameFields">
                            <label>Last Name</label>
                            <input
                                type="text"
                                placeholder="Doe"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="john_doe123"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                        />
                        <label>&nbsp;
                            {usernameError === 'Username is already taken' && (
                        
                                <span className="alert">* {usernameError}</span>
                            )}
                        </label>


                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="example@learnlink.com"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <label>&nbsp;
                        {(emailError === 'Email is already registered'  || error === "Please use a .edu email") && (
                                <span className="alert">* {emailError}</span>
                            )}
                        </label>
                        {/* <label>&nbsp;
                        {error === 'Please use a .edu email' && (
                                <span className="alert">* {error}</span>
                            )}
                        </label> */}

                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="**************"
                            name="password"
                            data-testid="su-password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        <label>Re-Type Password</label>
                        <input
                            type="password"
                            placeholder="**************"
                            data-testid="su-rt-password"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            required
                        />
                        <label>&nbsp;
                            {passwordError === 'Passwords do not match' && (
                                <span className="alert">* {passwordError}</span>
                            )}
                        </label>

                        {/* Show error if there's any */}
                        {/* {emailError}
                        {usernameError}
                        {passwordError} */}
                        {error && <p className="error">Failed to sign up.</p>}
                        <button className="signUpButton" type="submit" disabled={loading} data-testid="su-button">
                            {loading ? 'Signing Up...' : 'Sign Up'}
                        </button>
                    </form>
                    </div>

                    <div className="loginRedirect">
                        <label>Already have an account? <a href="/login">Log in</a></label>
                    </div>
                </div>
            </div>
            <Copyright />
        </div>
    );
};

export default Signup;