import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import CopyrightFooter from '../components/CopyrightFooter';
import './LandingPage.css';
import './publicProfile.css';
import { formatEnum } from '../utils/format';
import InviteMessagePanel from '../components/InviteMessagePanel';
import { getLoggedInUserId } from '../utils/auth';
import { useMatchButtonStatusGroup, sendMatchRequestNotification } from '../utils/userServices'
import CustomAlert from '../components/CustomAlert';
import { StudyGroup } from '../utils/types'
import { RiFontSize } from 'react-icons/ri';
import "./publicGroupProfile.css"
import PopupProfile from '../components/PopupProfile';



const PublicGroupProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [studyGroup, setStudyGroup] = useState<StudyGroup | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showInvitePanel, setShowInvitePanel] = useState(false);
    const loggedInUserId = getLoggedInUserId();
    const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
    const alertVisible = alerts.some(alert => alert.visible);
    const numericId = useMemo(() => Number(id), [id]);
    const [selectedMember, setSelectedMember] = useState<{ id: number } | null>(null);
    const [isLoading, setLoading] = useState<boolean>(true)
    const [notFound, setNotFound] = useState<boolean>(false)


    const genericUserPfp = "https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_bust-in-silhouette.png";
    const genericStudyGroupPfp = "https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_busts-in-silhouette.png";


    const matchButton = useMatchButtonStatusGroup(numericId);



    const navigate = useNavigate();
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';

    const handleMessage = () => {
        navigate('/messaging');
    };
    useEffect(() => {
        console.log("ID CHAGING")
        matchButton.refreshStatus();
        console.log(matchButton)
    }, [id]);

    useEffect(() => {
        console.log("PublicProfile re-render:", matchButton);
    }, [matchButton]);

    // Example: after performing a match-related action, refresh the status
    const handleMatchButtonClick = async () => {
        if (!matchButton.isButtonDisabled) {
            console.log("Match button clicked!");

            // Send match notification
            await handleMatchNotification();

            // Refresh button status after the action
            matchButton.refreshStatus();
        }
    };

    const handleSwipe = async (direction: 'Yes' | 'No', targetId: number, isStudyGroup: boolean, message: string | undefined) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // alert('You need to be logged in to swipe.');
                setAlerts((prevAlerts) => [
                    ...prevAlerts,
                    { id: Date.now(), alertText: 'Log in to swipe.', alertSeverity: "error", visible: true },
                ]);
                return;
            }

            const currentStudyGroup = studyGroup;

            await fetch(`${REACT_APP_API_URL}/api/swipe`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: loggedInUserId,
                    targetId: currentStudyGroup?.id,
                    direction,
                    isStudyGroup: true,
                    message: message
                }),
            });

            setShowInvitePanel(false);

        } catch (error) {
            console.error('Error swiping:', error);
            setAlerts((prevAlerts) => [
                ...prevAlerts,
                { id: Date.now(), alertText: 'Error swiping. Please try again later. ', alertSeverity: "error", visible: true },
            ]);

        }
    };

    const handleMatchNotification = async () => {
        await sendMatchRequestNotification(studyGroup)
    };

    const handleSendMessage = async (message: string) => {
        if (studyGroup)
            handleSwipe("Yes", studyGroup.id, true, message);
        handleMatchButtonClick()

    };

    const handleInvite = () => {
        // navigate(`/messaging?user=${studyGroup.id}`);
        setShowInvitePanel(true);

    };
    // useEffect(() => {
    //     const fetchButtonStatus = async () => {
    //         console.log(user);
    //         setMatchButton(UseMatchButtonStatus(15));

    //         if (MatchButton.matchButtonError) {
    //             setAlerts((prevAlerts) => [
    //                 ...prevAlerts,
    //                 { id: Date.now(), alertText: 'Failed to fetch match button status', alertSeverity: "error", visible: true },
    //               ]);
    //               throw new Error('Failed to fetch match button status');

    //         }
    //     }

    //     fetchButtonStatus();
    // }, [id]);

    useEffect(() => {
        const fetchStudyGroup = async () => {
            try {
                const response = await fetch(`${REACT_APP_API_URL}/api/study-groups/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (!response.ok) {
                    setAlerts((prevAlerts) => [
                        ...prevAlerts,
                        { id: Date.now(), alertText: 'Failed to fetch study Group', alertSeverity: "error", visible: true },
                    ]);
                    throw new Error('Failed to fetch Study Group');
                }
                const data = await response.json();
                setStudyGroup(data.studyGroup);
                console.log('studygroup', data);
                setLoading(false)

            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                    setAlerts((prevAlerts) => [
                        ...prevAlerts,
                        { id: Date.now(), alertText: err instanceof Error ? err.message : 'An unknown error occurred', alertSeverity: "error", visible: true },
                    ]);
                    setNotFound(true)

                } else {
                    setError('An unknown error occurred');
                    setAlerts((prevAlerts) => [
                        ...prevAlerts,
                        { id: Date.now(), alertText: 'An unknown error occurred', alertSeverity: "error", visible: true },
                    ]);
                    setNotFound(true)
                }
            }
        };

        fetchStudyGroup();
    }, [id]);

    // if (error) {
    //     return <div>Error: {error}</div>;
    // }

    // if (!studyGroup) {
    //     return <div>Loading...</div>;
    // }

    return (
        <div className="public-profile-page">
            <header>
                <Navbar />
            </header>
            <div className="public-profile-container">
                {notFound ? (
                    <div className="loading-container">
                        <h1>404</h1>
                        <p>Group Profile not found</p>
                    </div>
                ) : (<>
                    {isLoading ? (
                        <div className="loading-container">
                            Loading... <span className="loading-spinner"></span>
                        </div>
                    ) : (<>
                        {alertVisible && (
                            <div className='alert-container'>
                                {alerts.map(alert => (
                                    <CustomAlert
                                        key={alert.id}
                                        text={alert.alertText || ''}
                                        severity={alert.alertSeverity || 'info' as "error" | "warning" | "info" | "success"}
                                        onClose={() => setAlerts(prevAlerts => prevAlerts.filter(a => a.id !== alert.id))}
                                    />
                                ))}
                            </div>
                        )}
                        <div className='whole-public-component'>
                            <div className="profile-card">
                                {studyGroup ? (
                                    <>            
                                        <div className="public-group-container">
                                            <div className="profile-header">
                                                <div className="profile-avatar">
                                                    <img src={studyGroup.profilePic} alt={`${studyGroup.name}`} />

                                                </div>
                                                <div className="profile-info">
                                                    <h2>{`${studyGroup.name}`}</h2>
                                                    <p className="username">Study Group</p>
                                                </div>
                                            </div>
                                            {studyGroup.description ? (
                                                <><div className="bio-section">
                                                    <div className="bio-header">
                                                        <span className="bio-icon">📚</span>
                                                        <span>About {studyGroup.name}</span>
                                                    </div>
                                                            <p className="bio-text">
                                                                {studyGroup.description}
                                                            </p>
                                                        </div>
                                                        </>
                                                    ) : null}

                                                    {studyGroup.subject ? (
                                                        <><div className="bio-section">
                                                            <div className="bio-header">
                                                                <span className="bio-icon">📓</span>
                                                                <span>Subject</span>
                                                            </div>
                                                            <p className="bio-text">
                                                                {studyGroup.subject}
                                                            </p>
                                                        </div>
                                                        </>
                                                    ) : null}



                                                    <div className="public-group-info">
                                                        <h3>Members</h3>

                                                        <div className="public-member-cards">
                                                            {studyGroup.users && studyGroup.users.length > 0 ? (
                                                                studyGroup.users.map((member: any, index: number) => (
                                                                    <div key={index} className="public-member-card" onClick={() => setSelectedMember({ id: member.id })}>
                                                                        <div className="public-member-card-top">
                                                                            <h1>{member.name}</h1>
                                                                        <div className="public-member-card-top-left" >
                                                                            <img
                                                                                src={member.profilePic || genericUserPfp}
                                                                                alt={`${member.firstName} ${member.lastName}`}
                                                                                className="public-member-pic"
                                                                            />
                                                                        </div>
                                                                        <div className="public-member-card-top-right">
                                                                            <h1>{member.firstName} {member.lastName} </h1>
                                                                            <h2>@{member.username}</h2>
                                                                        </div>
                                                                    </div>
                                                                    <>
                                                                        {/* <p><span className="bold-first-word">Study Tags: <br></br></span></p> */}
                                                                        <p>
                                                                            {member.studyHabitTags.length > 0 ? (
                                                                                member.studyHabitTags.map((tag: string, index: number) => (
                                                                                    <span key={index} className={`member tag ${tag}`}>
                                                                                        {formatEnum(tag)}
                                                                                    </span>
                                                                                ))
                                                                            ) : (
                                                                                "No study tags specified."
                                                                            )}
                                                                        </p>
                                                                    </>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p>No members yet.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        <div className="public-action-buttons" >
                                            <button className={`match-button-status-${matchButton.buttonText.toLowerCase()}`}
                                                disabled={matchButton.isButtonDisabled}
                                                onClick={handleInvite}
                                            >

                                                {matchButton.buttonText}
                                            </button>

                                        </div>
                                    </>
                                ) : (
                                    <div className='public-info'>
                                        <p>No more profiles to public on!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>)}
                </>)}
            </div>
            <footer>
                <CopyrightFooter />
            </footer>
            <InviteMessagePanel
                open={showInvitePanel}
                onClose={() => setShowInvitePanel(false)}
                onConfirm={handleSendMessage}
                targetName={
                    studyGroup ?
                        studyGroup.name
                        : ""
                }
            />
            {selectedMember && (
                <PopupProfile
                    id={selectedMember.id}
                    onClose={() => setSelectedMember(null)}
                />
            )}
        </div>
    );
};

export default PublicGroupProfile;
