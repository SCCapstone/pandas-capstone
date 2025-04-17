import './welcome.css';
import '../index.css';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Copyright from '../components/CopyrightFooter';

import studyGroupsImage from '../images/study-groups.png';
import calculatorImage from '../images/calculator.png';
import messagingImage from '../images/messaging.png';
import resourcesImage from '../images/resources.png';
import videoPlaceholder from '../images/video-placeholder.png';
import kennedy from '../images/profile pictures/kennedy-profile.png';
import kelly from '../images/profile pictures/kelly-profile.png';
import natalie from '../images/profile pictures/natalie-profile.png';

import rae from '../images/profile pictures/rae-profile.jpeg';


function Welcome() {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/login');
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

                {/* Demo Section */}
                <div className="videoSection">
                    <h2>See LearnLink in Action</h2>
                    <p>Watch our short demo to learn how it works!</p>
                    <img src={videoPlaceholder} alt="Demo video placeholder" className="videoPlaceholder"/>
                </div>

                {/* Why LearnLink Section */}
                <div className="infoSection">
                    <h2>Why LearnLink?</h2>
                    <p>
                        Large classes can feel overwhelming. LearnLink makes collaboration easy by helping you connect
                        with the right study partners, keep conversations organized, and track your success.
                    </p>
                    <p>
                        LearnLink helps students in large classes find reliable study partners, organize group chats,
                        share resources, and track their grades. With our user-friendly interface and smart matching,
                        collaboration becomes seamless and effective.
                    </p>

                    <div className="whyBoxes">
                        <div className="whyBox">
                            <h3>Study Smarter</h3>
                            <p>Find peers with similar schedules and goals.</p>
                        </div>
                        <div className="whyBox">
                            <h3>Stay Connected</h3>
                            <p>Easy messaging and notifications.</p>
                        </div>
                        <div className="whyBox">
                            <h3>Track Progress</h3>
                            <p>Use our built-in calculator to stay on track.</p>
                        </div>
                    </div>
                </div>

                {/* Team Section */}
                <div className="aboutSection">
                    <h2>Meet the Team</h2>
                    <div className="teamMembers">
                        <div className="teamMember"><img className="profilePic" src={natalie} alt="kennedy-profile" /><p>Natalie Crawford</p></div>
                        <div className="teamMember"><img className="profilePic" src={kelly} alt="kennedy-profile" /><p>Kelly Finnegan</p></div>
                        <div className="teamMember"><img className="profilePic" src={rae} alt="rae-profile" /><p>Rae Jones</p></div>
                        <div className="teamMember"><img className="profilePic" src={kennedy} alt="kennedy-profile" /><p>Kennedy Houston</p></div>
                        <div className="teamMember"><img className="profilePic" src={kennedy} alt="kennedy-profile" /><p>Yesha Patel</p></div>
                    </div>
                </div>

                {/* GitHub Link */}
                <div className="githubSection">
                    <a className="githubLink" href="https://github.com/SCCapstone/pandas-capstone" target="_blank" rel="noopener noreferrer">Check Out Our Code on GitHub</a>
                </div>

                <div>
                    <Copyright />
                </div>

            </div>
        </div>
    );
}

export default Welcome;

