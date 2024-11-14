import React from 'react';
import { useNavigate } from 'react-router-dom';
import './signup.css';
import Logo from '../components/Logo';
import Copyright from '../components/CopyrightFooter';
import { SignUpData, signUpUser } from '../services/authService';
import { SubmitHandler, useForm } from 'react-hook-form';

type SignUpInputs =  {
    userName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const Signup: React.FC = () => {
    const navigate = useNavigate();

    const {register, handleSubmit, formState: {errors}} = useForm<SignUpInputs>();

    const handleSignUp: SubmitHandler<SignUpInputs> = async(data) => {
        if (data.password != data.confirmPassword) {
            alert('Password does not match');
            return;
        }

        try{
            const result = await signUpUser (
                {
                    username: data.userName,
                    password: data.password,
                    email: data.email,

                }
            );

            alert('Account created successfully');
            navigate('/landingpage');
            // or we could navigate the user to login page for succesful registration
            // naviagte('/login')
        } catch (error) { 
            console.error(error);
            alert('Error during signup');
        }
    }

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

                <form onSubmit={handleSubmit(handleSignUp)}>
                    <label>Username</label>
                    <input type="text" placeholder="john_doe123" {...register("userName", {required: "Username is required"})}/>
                    {errors.userName && <p className="error">{errors.userName.message}</p>}
                    
                    <label>Email</label>
                    <input type="text" placeholder="example@learnlink.com" {...register("email", {required: "Email is required"})}/>
                    {errors.email && <p className="error">{errors.email.message}</p>}

                    <label>Password</label>
                    <input type="password" placeholder="**************" {...register("password", {required: "Password is required"})}/>
                    {errors.password && <p className="error">{errors.password.message}</p>}
                    
                    <label>Confirm Password</label>
                    <input type="password" placeholder="**************" {...register("confirmPassword", {required: "Confrim Password is required"})}/>
                    {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}
                    
                    <button className="signUpButton">Sign Up</button>
                </form>
                
                
                
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
