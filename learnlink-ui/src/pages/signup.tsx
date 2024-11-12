import React from 'react';
import { useNavigate } from 'react-router-dom';
import './signup.css';
import Logo from '../components/Logo';
import Copyright from '../components/CopyrightFooter';

const Signup: React.FC = () => {
    const navigate = useNavigate();

    const handleSignup = () => {
        navigate('/LandingPage');
    };

    return (
        <div className="signup">
            <div className="Logo2">
                <Logo />
            </div>
            <div className="container">
                <h1 className="l1">Sign Up</h1>
                <h2 className="t2">Enter your credentials to join LearnLink.</h2>
                
                <div className="nameFields">
                    <label>First Name</label>
                    <input type="text" placeholder="John" />
                </div>
                <div className="nameFields">
                    <label>Last Name</label>
                    <input type="text" placeholder="Doe" />
                </div>
                
                <label>Username</label>
                <input type="text" placeholder="john_doe123" />
                
                <label>Email</label>
                <input type="text" placeholder="example@learnlink.com" />
                
                <label>Password</label>
                <input type="password" placeholder="**************" />
                
                <label>Confirm Password</label>
                <input type="password" placeholder="**************" />
                
                <button className="signUpButton" onClick={handleSignup}>Sign Up</button>
                
                <div className="loginRedirect">
                    <label>Already have an account? <a href="/login">Log in</a></label>
                </div>
            </div>

            <div className="Copyright2">
                <Copyright />
            </div>
        </div>
    );
}

export default Signup;
