import './signup.css';
import Logo from '../components/Logo';
import Copyright from '../components/CopyrightFooter';

function Signup() {
    return (
        <div className="signup">
            <div className="Logo2">
                <Logo />
            </div>
            <div className="container">
                <h1 className="l1">Sign Up</h1>
                <h2 className="t2">Enter your credentials to join LearnLink.</h2>
                
                {/* First and Last Name Inputs */}
                <div className="nameFields">
                    <label>First Name</label>
                    <input type="text" placeholder="John" />
                </div>
                <div className="nameFields">
                    <label>Last Name</label>
                    <input type="text" placeholder="Doe" />
                </div>
                
                {/* Username Input */}
                <label>Username</label>
                <input type="text" placeholder="john_doe123" />
                
                {/* Email Input */}
                <label>Email</label>
                <input type="text" placeholder="example@learnlink.com" />
                
                {/* Password Input */}
                <label>Password</label>
                <input type="password" placeholder="**************" />
                
                {/* Confirm Password Input */}
                <label>Confirm Password</label>
                <input type="password" placeholder="**************" />
                
                <button className="signUpButton">Sign Up</button>

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
