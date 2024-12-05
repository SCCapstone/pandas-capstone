import './welcome.css';
import '../index.css';
import {useNavigate} from 'react-router-dom';
import Logo from '../components/Logo';
import Copyright from '../components/CopyrightFooter';

import studyGroupsImage from '../images/study-groups.png';
import calculatorImage from '../images/calculator.png';
import messagingImage from '../images/messaging.png';
import resourcesImage from '../images/resources.png';

function Welcome() {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/login');
    }

    return (
        <div>
            <div className="welcome">
                <div className="Logo2">
                    <Logo />
                </div>
                
                <div className="WelcomePage">
                    <div className="titleContainer">
                        <h1 className="well">Welcome to LearnLink!</h1>
                        <p>The best way to find your study partner!</p>
                        <button className="getStarted" onClick={handleGetStarted}>Get Started</button>
                    </div>
                </div>
                <div className="menuButtonGroup">
                    <div className="menuButtons">Study Groups
                      <img src={studyGroupsImage} alt="Study Groups" />
                    </div>
                    <div className="menuButtons">Study Resources
                      <img src={resourcesImage} alt="Study Resources" />
                    </div>
                    <div className="menuButtons">Messaging
                      <img src={messagingImage} alt="Messaging" />
                    </div>
                    <div className="menuButtons">Grade Calculator
                      <img src={calculatorImage} alt="Grade Calculator" />
                    </div>
                </div>
            </div>
            <div>
                <Copyright />
            </div>
        </div>
    );
}

export default Welcome;
