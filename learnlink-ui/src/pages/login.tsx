import './login.css';
import Logo from '../components/Logo';
import Copyright from '../components/CopyrightFooter';

function Login() {
    return (
        <div className="login">
        <div className = "Logo2">
            <Logo />
        </div>
        <div className="container">
           <h1 className="l1">Login</h1>
           <h2 className="t2">Enter your credentials to login.</h2>
            <label>
                Email
                </label>
                <input type="text" placeholder="example@learnlink.com"></input>
            <label>
                Password
            </label>
            <input type="text" placeholder="**************"></input>
            <div className="fp">
                <label>Forgot password?</label>   
            </div>

            <button className="lButton">Login</button>

            <div className="or">
                <label>OR</label>
            </div>
                
            <button className="sign">Sign Up</button> 
        </div>

        <div className = "Copyright2">
          <Copyright/>
        </div>

        </div>
    );
}
export default Login;