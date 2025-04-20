import './WelcomeComponent.css';
import studyGroupsImage from '../images/study-groups.png';
import calendarImage from '../images/Calendar-invite.png';
import messagingImage from '../images/messaging.png';
import resourcesImage from '../images/resources.png';
import studySmarter from '../images/study-smarter.png';
import stayConnected from '../images/stay-connected.png';
import weeklyScheduler from '../images/weekly-scheduler.png';
import videoPlaceholder from '../images/video-placeholder.png';
import kennedy from '../images/profile pictures/kennedy-profile.png';
import kelly from '../images/profile pictures/kelly-profile.png';
import natalie from '../images/profile pictures/natalie-profile.png';
import rae from '../images/profile pictures/rae-profile.jpeg';
import yesha from '../images/profile pictures/yesha-profile.png';
import studySmarterScreenshot from '../images/screenshots/Study-smarter-screenshot.png';
import stayConnectedScreenshot from '../images/screenshots/Stay-connected-screenshot.png';
import weeklySchedulerScreenshot from '../images/screenshots/weekly-scheduler-screenshot.png';

import { useState } from 'react';

function Welcome() {

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
            <div className="welcomeComponent">

            <div className="menuButtonGroup">
                <div className="menuButtons">
                    <div className="menuHoverOverlay">LearnLink helps you form study groups by matching you with study partners.</div>
                    Study Groups
                    <img src={studyGroupsImage} alt="Study Groups" />
                </div>
                <div className="menuButtons">
                    <div className="menuHoverOverlay">LearnLink provides study tips, external resources, & a grade calculator.</div>
                    Study Resources
                    <img src={resourcesImage} alt="Study Resources" />
                </div>
                <div className="menuButtons">
                    <div className="menuHoverOverlay">LearnLink supports 1/1 and group messaging for easy and convenient collaboration.</div>
                    Messaging
                    <img src={messagingImage} alt="Messaging" />
                </div>
                <div className="menuButtons">
                    <div className="menuHoverOverlay">Schedule study sessions and add them to your calendar.</div>
                    Calendar Invites
                    <img src={calendarImage} alt="Calendar Invite" />
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
                            <div className="whyBox" onClick={() => handleOpenModal(studySmarterScreenshot)}>
                                <div className="hoverOverlay">Click to View Screenshot</div>
                                <h2>Study Smarter</h2>
                                <p>Find peers with similar schedules and goals.</p>
                                <img src={studySmarter} alt="Study Smarter Icon" />
                            </div>
                            <div className="whyBox" onClick={() => handleOpenModal(stayConnectedScreenshot)}>
                                <div className="hoverOverlay">Click to View Screenshot</div>
                                <h2>Stay Connected</h2>
                                <p>Easy messaging and notifications.</p>
                                <img src={stayConnected} alt="Stay Connected Icon" />
                            </div>
                            <div className="whyBox" onClick={() => handleOpenModal(weeklySchedulerScreenshot)}>
                                <div className="hoverOverlay">Click to View Screenshot</div>
                                <h2>Weekly Scheduler</h2>
                                <p>Find the best times for your group to study together.</p>
                                <img src={weeklyScheduler} alt="Weekly Scheduler Icon" />
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
                        <div className="teamMember"><a target="new" href="https://www.linkedin.com/in/yeshappatel/"><img className="profilePic" src={yesha} alt="kennedy-profile" /></a><p>Yesha Patel</p></div>
                    </div>
                </div>

                {/* GitHub Link */}
                <div className="githubSection">
                    <a className="githubLink" href="https://github.com/SCCapstone/pandas-capstone" target="_blank" rel="noopener noreferrer">Check Out Our Code on GitHub</a>
                </div>

            </div>
        </div>
    );
}

export default Welcome;

