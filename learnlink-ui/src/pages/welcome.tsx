import './welcome.css';
import '../index.css';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Copyright from '../components/CopyrightFooter';

import studyGroupsImage from '../images/study-groups.png';
import calculatorImage from '../images/calculator.png';
import messagingImage from '../images/messaging.png';
import resourcesImage from '../images/resources.png';

import placeholderVideo from '../images/video-placeholder.png'; // Add a placeholder image for the video

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

                {/* Embedded Video Section */}
                <div className="videoSection">
                    <h2>See LearnLink in Action</h2>
                    {/* Replace the image below with an <iframe> when your final demo video is ready */}
                    <img src={"https://www.youtube.com/embed/placeholder" } alt="Demo video placeholder" className="videoPlaceholder" />
                    {/* Example for embedding video:
                        <iframe src="https://www.youtube.com/embed/YOUR_VIDEO_ID" title="Final Demo" allowFullScreen /> */}
                </div>

                {/* Explanation Section */}
                <div className="infoSection">
                    <h2>Why LearnLink?</h2>
                    <p>
                        Large classes can feel overwhelming. LearnLink makes collaboration easy by helping you connect with the right study partners, keep conversations organized, and track your success.
                    </p>
                    <p>
                        LearnLink helps students in large classes find reliable study partners, organize group chats,
                        share resources, and track their grades. With our user-friendly interface and smart matching,
                        collaboration becomes seamless and effective.
                    </p>

                </div>

                {/* About Section */}
                <div className="aboutSection">
                    <h2>Meet the Team</h2>
                    <ul>
                        <li><a href="https://linkedin.com/in/your-linkedin" target="_blank" rel="noopener noreferrer">Natalie Crawford</a></li>
                        {/* Add teammates here */}
                    </ul>
                </div>

                {/* GitHub Link */}
                <div className="githubSection">
                    <h2>Check Out the Code</h2>
                    <a href="https://github.com/your-repo-link" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
                </div>
            </div>

            <div>
                <Copyright />
            </div>
        </div>
    );
}

export default Welcome;

