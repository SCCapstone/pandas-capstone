import './WelcomeComponent.css';
import studyGroupsImage from '../images/study-groups.png';
import calendarImage from '../images/Calendar-invite.png';
import messagingImage from '../images/messaging.png';
import resourcesImage from '../images/resources.png';
import studySmarter from '../images/study-smarter.png';
import stayConnected from '../images/stay-connected.png';
import weeklyScheduler from '../images/weekly-scheduler.png';
import videoPlaceholder from '../images/video-placeholder.png';
import groupsImage from '../images/study-group.png';
import calculatorImage from '../images/blueCalculator.png';
import profileImage from '../images/profile.png';
import networkImage from '../images/network.png';
import calendarInviteImage from '../images/calendar.png';
import kennedy from '../images/profile pictures/kennedy-profile.png';
import kelly from '../images/profile pictures/kelly-profile.png';
import natalie from '../images/profile pictures/natalie-profile.png';
import rae from '../images/profile pictures/rae-profile.jpeg';
import yesha from '../images/profile pictures/yesha-profile.png';
import studySmarterScreenshot from '../images/screenshots/Study-smarter-screenshot.png';
import stayConnectedScreenshot from '../images/screenshots/Stay-connected-screenshot.png';
import weeklySchedulerScreenshot from '../images/screenshots/weekly-scheduler-screenshot.png';
import groupsPageScreenshot from '../images/screenshots/Groups-page.png';
import resourcesScreenshot from '../images/screenshots/Resources.png';
import profileScreenshot from '../images/screenshots/Profile.png';
import calendarInviteScreenshot from '../images/screenshots/CalendarInvite.png';
import networkScreenshot from '../images/screenshots/Network.png';

// Importing React hooks for managing state
import { useState } from 'react';
import { group } from 'console';


// Main functional component for the Welcome page
function Welcome() {
    // State to handle modal visibility and content
    const [modalOpen, setModalOpen] = useState(false);
    const [modalImage, setModalImage] = useState<string | undefined>(undefined);

        // Function to open modal and display selected screenshot
    const handleOpenModal = (image: string | undefined) => {
        setModalImage(image || videoPlaceholder);
        setModalOpen(true);
    };

        // Function to close the modal
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
                    <h2> Tired of studying alone or struggling to find the right people to prep with? In large classes, it’s easy to feel lost or disconnected. LearnLink is your solution. 
                        Our website makes it easy to find and connect with like-minded students for more productive and collaborative study sessions.</h2>
                    <h2> Whether you're looking for a one-on-one partner or a full-on study squad, you can browse and match with individual users or existing groups. 
                        Once a request is accepted, you can start messaging immediately, share weekly schedules, and send calendar invites to stay on track together.</h2>
                        <div className="whyBoxes" data-testid="whyBoxes">
                            <div className="whyBox" onClick={() => handleOpenModal(studySmarterScreenshot)}>
                                <div className="hoverOverlay">Click to View Screenshot</div>
                                <h2>Match & Connect</h2>
                                <p>Send and receive match or join requests with individuals or groups based on shared classes, study habits, or goals.</p>
                                <img src={studySmarter} alt="Study Smarter Icon" />
                            </div>
                            <div className="whyBox" onClick={() => handleOpenModal(stayConnectedScreenshot)}>
                                <div className="hoverOverlay">Click to View Screenshot</div>
                                <h2>Stay Connected</h2>
                                <p>Easy messaging and notifications. Chat in real time to plan sessions, ask questions, and stay in sync.</p>
                                <img src={stayConnected} alt="Stay Connected Icon" />
                            </div>
                            <div className="whyBox" onClick={() => handleOpenModal(weeklySchedulerScreenshot)}>
                                <div className="hoverOverlay">Click to View Screenshot</div>
                                <h2>Weekly Scheduler</h2>
                                <p>Share availability. Find the best times for your group to study together.</p>
                                <img src={weeklyScheduler} alt="Weekly Scheduler Icon" />
                            </div>
                            <div className="whyBox" onClick={() => handleOpenModal(groupsPageScreenshot)}>
                                <div className="hoverOverlay">Click to View Screenshot</div>
                                <h2>Groups Page</h2>
                                <p>See all your current study groups at a glance. Click into each one to view/edit members and group profile information.</p>
                                <img src={groupsImage} alt="Study Group Icon" />
                            </div>
                            <div className="whyBox" onClick={() => handleOpenModal(resourcesScreenshot)}>
                                <div className="hoverOverlay">Click to View Screenshot</div>
                                <h2>Resources Page</h2>
                                <p>View some helpful studying tips/resources and access the websites grade calculator.</p>
                                <img src={calculatorImage} alt="Resouces Icon" />
                            </div>
                            <div className="whyBox" onClick={() => handleOpenModal(profileScreenshot)}>
                                <div className="hoverOverlay">Click to View Screenshot</div>
                                <h2>Profile Page</h2>
                                <p>Customize your profile with classes you're taking, your study preferences, and your ideal match factor.</p>
                                <img src={profileImage} alt="Profile Icon" />
                            </div>
                            <div className="whyBox" onClick={() => handleOpenModal(calendarInviteScreenshot)}>
                                <div className="hoverOverlay">Click to View Screenshot</div>
                                <h2>Calendar Invites</h2>
                                <p>Schedule upcoming study sessions, and send invites that sync to your calendar.</p>
                                <img src={calendarInviteImage} alt="Calendar Invite Icon" />
                            </div>
                            <div className="whyBox" onClick={() => handleOpenModal(networkScreenshot)}>
                                <div className="hoverOverlay">Click to View Screenshot</div>
                                <h2>Network Page</h2>
                                <p>See your full list of connections, revisit past matches, and start new one-on-one or group conversations with just a tap.</p>
                                <img src={networkImage} alt="Network Icon" />
                            </div>
                    </div>
                    <p></p>
                    <h2> This app was built for students by students who know how challenging it can be to stay on top of coursework in large or fast-paced classes.
                        From finding the right people to study with to coordinating your schedules, this website streamlines the entire process.
                    </h2>
                    <h2> Whether you're cramming for a final, tackling a group project, or just need a motivation boost, your next study buddy—or your entire support squad—is just a few clicks away.</h2>
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
                        <div className="teamMember"><a target="new" href="https://www.linkedin.com/in/natalie-crawford-b85137221/"><img className="profilePic" src={natalie} alt="natalie-profile" /></a><p>Natalie Crawford</p></div>
                        <div className="teamMember"><a target="new" href="https://www.linkedin.com/in/kelly-fin/"><img className="profilePic" src={kelly} alt="kelly-profile" /></a><p>Kelly Finnegan</p></div>
                        <div className="teamMember"><a target="new" href="https://www.linkedin.com/in/rae-j/"><img className="profilePic" src={rae} alt="rae-profile" /></a><p>Rae Jones</p></div>
                        <div className="teamMember"><a target="new" href="https://www.linkedin.com/in/kennedy-houston-883782223/"><img className="profilePic" src={kennedy} alt="kennedy-profile" /></a><p>Kennedy Houston</p></div>
                        <div className="teamMember"><a target="new" href="https://www.linkedin.com/in/yeshappatel/"><img className="profilePic" src={yesha} alt="yesha-profile" /></a><p>Yesha Patel</p></div>
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

