import './login.css';
import Logo from '../components/Logo';
import Copyright from '../components/CopyrightFooter';
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate(); // Initialize the navigate function

    return (
        <div className="login">
            <div className="Logo2">
                <Logo />
            </div>
            <div className="container">
                <h1 className="l1">Login</h1>
                <h2 className="t2">Enter your credentials to login.</h2>
                <label>Email</label>
                <input type="text" placeholder="example@learnlink.com"></input>
                <label>Password</label>
                <input type="password" placeholder="**************"></input>
                <div className="fp">
                    <label>Forgot password?</label>   
                </div>

                <button className="lButton"
                        onClick={() => navigate('/landingpage')}
                >Login</button>

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
