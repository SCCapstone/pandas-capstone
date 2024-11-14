import './login.css';
import Logo from '../components/Logo';
import Copyright from '../components/CopyrightFooter';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { login } from '../services/authService';

type LoginInputs = {
    userName: string;
    userPassword: string;
};

const Login: React.FC = () =>  {
    const navigate = useNavigate(); // Initialize the navigate function
    const {register, handleSubmit, formState: {errors}} = useForm<LoginInputs>();

    const handleLogin: SubmitHandler<LoginInputs> = async(data) => {
        try{
            const result = await login (
                {
                    username: data.userName,
                    password: data.userPassword,

                }
            );

            //stores token in the local storage
            localStorage.setItem('token', result.token);
            alert('login completed');
            navigate('/landingpage')
        } catch (error) { 
            console.error(error);
            alert('Invalid username or password');
        }
        // get the API token


    }

    return (
        <div className="login">
            <div className="Logo2">
                <Logo />
            </div>
            <div className="container">
                <h1 className="l1">Login</h1>
                <h2 className="t2">Enter your credentials to login.</h2>
                <form onSubmit={handleSubmit(handleLogin)}>
                     <label>Email</label>
                    <input type="text" placeholder="example@learnlink.com" {...register("userName", {required: "username is required"})}></input>
                    {errors.userName && <p className="error">{errors.userName.message}</p>}
                    <label>Password</label>
                    <input type="password" placeholder="**************" {...register("userPassword", {required: "password is required"})}></input>
                    {errors.userPassword && <p className="error">{errors.userPassword.message}</p>}
                    <div className="fp">
                        <label>Forgot password?</label>   
                    </div>

                    <button className="lButton" type="submit">Login</button>
                </form>
               

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
