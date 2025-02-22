import React,  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './signup.css';
import Logo from '../components/Logo';
import Copyright from '../components/CopyrightFooter';
import { set } from 'react-hook-form';

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
    const [loading, setLoading] = useState<boolean>(false);
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

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
        setError(null);
        e.preventDefault();

        if (formData.password !== confirmPassword) {
            console.log('Passwords do not match');
            setError('Passwords do not match');
            return;
        }

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.username || !formData.password) {
            console.log('All fields are required');
            setError('All fields are required');
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
            
            // Handle unique warnings
            if (errorData.error === 'UsernameAlreadyExists') {
                console.log('Username is already taken');
                setError('Username is already taken');
                // throw new Error('Username is already taken');
                return;

            } else if (errorData.error === 'EmailAlreadyExists') {
                console.log('Email is already registered');
                setError('Email is already registered');
                throw new Error('Email is already registered');
            } else if (errorData.error === 'NotEdu') {
                console.log('Please use a .edu email');
                setError('Please use a .edu email');
                throw new Error('Non .edu email');
            } else {
                console.log('Failed to create user');
                throw new Error('Failed to create user');
            }
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
                throw new Error(errorData.error || 'Failed to send email');
            }
            
            // Navigate to landing page after successful signup
            navigate('/LandingPage');
        } catch (error) {
            //setError('Failed to sign up. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signupPage">
            <div className="Logo2-signup">
                <Logo />
            </div>
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
                            {error === 'Username is already taken' && (
                        
                                <span className="alert">* {error}</span>
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
                        {error === 'Email is already registered'  || error === "Please use a .edu email" && (
                                <span className="alert">* {error}</span>
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
                            {error === 'Passwords do not match' && (
                                <span className="alert">* {error}</span>
                            )}
                        </label>

                        {/* Show error if there's any */}
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