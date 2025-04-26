import './welcome.css';
import '../index.css';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Copyright from '../components/CopyrightFooter';
import WelcomeComponent from '../components/WelcomeComponent';

// Function component for the welcome page
function Welcome() {
    const navigate = useNavigate();

        // Function to handle the "Get Started" button click and navigate to the login page
    const handleGetStarted = () => {
        navigate('/login'); // Navigates to the login page when clicked
    };

    return (
        <div>
            <div className="welcome">
                <div className="Logo2">
                    <Logo />
                </div>

                <div className="WelcomePage">
                    <div className="titleContainer">
                        <h1 className="well">Welcome to LearnLink!</h1>
                        <p>The best way to find study groups!</p>
                        <button className="getStarted" onClick={handleGetStarted}>Get Started</button>
                    </div>
                </div>

                <WelcomeComponent />
                

                <div>
                    <Copyright />
                </div>

            </div>
        </div>
    );
}

export default Welcome;

