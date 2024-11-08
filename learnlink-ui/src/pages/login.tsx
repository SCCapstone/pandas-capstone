import { ReactComponent as MySvgFile } from './LearnLink.svg';
import logo from './logo.svg';

function Login() {
    return (
        <div className="login">
        <div className = "Logo">
            <MySvgFile />
        </div>
        <div className="container">
           <h1>Login</h1>
            <h2>Enter your credentials to login.</h2>
            <label>
                Email
                <br></br>
                <input type="text" placeholder="example@learnlink.com"></input>
            </label>
            <br></br>
            <label>
                Password
                <br></br>
                <input type="text" placeholder="**************"></input>
                </label>
                <div>
                <label>Forgot password?</label>   
                </div>
                <button className="lButton">Login</button>
                <label>OR</label>
                <button className="sign">Sign Up</button> 
        </div>
        
        

        </div>
    );
}
export default Login;