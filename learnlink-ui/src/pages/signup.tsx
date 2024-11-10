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
                <h2 className="t2">Create an account to get started.</h2>
                
                <label>Full Name</label>
                <input type="text" placeholder="John Doe"></input>
                
                <label>Email</label>
                <input type="text" placeholder="example@learnlink.com"></input>
                
                <label>Password</label>
                <input type="password" placeholder="**************"></input>

                <label>Confirm Password</label>
                <input type="password" placeholder="**************"></input>
                
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
