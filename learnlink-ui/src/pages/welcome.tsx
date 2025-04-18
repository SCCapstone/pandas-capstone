import './welcome.css';
import '../index.css';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Copyright from '../components/CopyrightFooter';

import studyGroupsImage from '../images/study-groups.png';
import calculatorImage from '../images/calculator.png';
import messagingImage from '../images/messaging.png';
import resourcesImage from '../images/resources.png';
import studySmarter from '../images/study-smarter-cropped.png';
import stayConnected from '../images/stay-connected.png';
import trackProgress from '../images/track-progress.png';
import videoPlaceholder from '../images/video-placeholder.png';
import kennedy from '../images/profile pictures/kennedy-profile.png';
import kelly from '../images/profile pictures/kelly-profile.png';
import natalie from '../images/profile pictures/natalie-profile.png';
import rae from '../images/profile pictures/rae-profile.jpeg';
import studySmarterScreenshot from '../images/screenshots/Study-smarter-screenshot.png';
import stayConnectedScreenshot from '../images/screenshots/Stay-connected-screenshot.png';
import trackProgressScreenshot from '../images/screenshots/track-progress-screenshot.png';

import { useState } from 'react';

function Welcome() {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/login');
    };

    const [modalOpen, setModalOpen] = useState(false);
    const [modalImage, setModalImage] = useState<string | undefined>(undefined);

    const handleOpenModal = (image: string | undefined) => {
        setModalImage(image || videoPlaceholder);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setModalImage(undefined);
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
                    <h1>See LearnLink in Action</h1>
                    <p>Watch our short demo to learn how it works!</p>
                    <img src={videoPlaceholder} alt="Demo video placeholder" className="videoPlaceholder"/>
                </div>

                {/* Why LearnLink Section */}
                <div className="infoSection">
                    <h1>Why LearnLink?</h1>
                    <p> In large classes, it’s easy to feel lost or disconnected. LearnLink simplifies collaboration by connecting you with the right study partners, keeping conversations organized, and helping you track your academic progress.</p>
                    <p> With a user-friendly interface and smart matching tools, LearnLink empowers students to build reliable study groups, share resources effortlessly, and stay on top of their goals throughout the semester.</p>

                    <div className="whyBoxes">
                        <div title = "View Screenshot" className="whyBox" onClick={() => handleOpenModal(studySmarterScreenshot)}>
                            <h2>Study Smarter</h2>
                            <p>Find peers with similar schedules and goals.</p>
                            <img src={studySmarter} alt="Study Smarter Icon" />
                        </div>
                        <div title = "View Screenshot" className="whyBox" onClick={() => handleOpenModal(stayConnectedScreenshot)}>
                            <h2>Stay Connected</h2>
                            <p>Easy messaging and notifications.</p>
                            <img src={stayConnected} alt="Stay Connected Icon" />
                        </div>
                        <div title = "View Screenshot" className="whyBox" onClick={() => handleOpenModal(trackProgressScreenshot)}>
                            <h2>Track Progress</h2>
                            <p>Use our built-in calculator to stay on track.</p>
                            <img src={trackProgress} alt="Track Progress Icon" />
                        </div>
                    </div>
                </div>

                {/* Modal for Enlarged Screenshot */}
                {modalOpen && (
                    <div className="modalOverlay" onClick={handleCloseModal}>
                        <div className="modalContent">
                            <img src={modalImage} alt="Expanded Screenshot" />
                            <button className="closeButton" onClick={handleCloseModal}>X</button>
                        </div>
                    </div>
                )}

                {/* Team Section */}
                <div className="aboutSection">
                    <h1>Meet the Team</h1>
                    <div className="teamMembers">
                        <div className="teamMember"><a target="new" href="https://www.linkedin.com/in/natalie-crawford-b85137221/"><img className="profilePic" src={natalie} alt="kennedy-profile" /></a><p>Natalie Crawford</p></div>
                        <div className="teamMember"><a target="new" href="https://www.linkedin.com/in/kelly-fin/"><img className="profilePic" src={kelly} alt="kennedy-profile" /></a><p>Kelly Finnegan</p></div>
                        <div className="teamMember"><a target="new" href="https://www.linkedin.com/in/rae-j/"><img className="profilePic" src={rae} alt="rae-profile" /></a><p>Rae Jones</p></div>
                        <div className="teamMember"><a target="new" href="https://www.linkedin.com/in/kennedy-houston-883782223/"><img className="profilePic" src={kennedy} alt="kennedy-profile" /></a><p>Kennedy Houston</p></div>
                        <div className="teamMember"><a target="new" href="https://www.linkedin.com/in/yeshappatel/"><img className="profilePic" src={kennedy} alt="kennedy-profile" /></a><p>Yesha Patel</p></div>
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

