import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import CopyrightFooter from '../components/CopyrightFooter';
import './LandingPage.css';
import './publicProfile.css';
import { formatEnum } from '../utils/format';
import InviteMessagePanel from '../components/InviteMessagePanel';
import { getLoggedInUserId } from '../utils/auth';
import { useMatchButtonStatus, sendMatchRequestNotification } from '../utils/userServices'
import CustomAlert from '../components/CustomAlert';



const PublicProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [showInvitePanel, setShowInvitePanel] = useState(false);
    const loggedInUserId = getLoggedInUserId();
    const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
    const alertVisible = alerts.some(alert => alert.visible);
    const numericId = useMemo(() => Number(id), [id]);
    const [isLoading, setLoading] = useState<boolean>(true)
    const [notFound, setNotFound] = useState<boolean>(false)

    const matchButton = useMatchButtonStatus(numericId);



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

            const currentProfile = user;

            await fetch(`${REACT_APP_API_URL}/api/swipe`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: loggedInUserId,
                    targetId: currentProfile.id,
                    direction,
                    isStudyGroup: !!currentProfile.chatID, // Check if it's a study group
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
        await sendMatchRequestNotification(user)
    };

    const handleSendMessage = async (message: string) => {
        handleSwipe("Yes", user.id, !!user.studyGroupId, message);
        handleMatchButtonClick()

    };

    const handleInvite = () => {
        // navigate(`/messaging?user=${currentProfile.id}`);
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
        const fetchUser = async () => {
            try {
                const response = await fetch(`${REACT_APP_API_URL}/api/users/profile/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (!response.ok) {
                    setAlerts((prevAlerts) => [
                        ...prevAlerts,
                        { id: Date.now(), alertText: 'Failed to fetch user', alertSeverity: "error", visible: true },
                    ]);
                    throw new Error('Failed to fetch user');
                }
                const data = await response.json();
                setUser(data);
                console.log(user);
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

        fetchUser();
    }, [id]);

    // if (error) {
    //     return <div>Error: {error}</div>;
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
                        <p>Page Not Found</p>
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
                                {user ? (
                                        <div className="profile-card">
                                            <div className="profile-header">
                                                <div className="profile-avatar">
                                                    <img src={user.profilePic} alt={`${user.first_name} ${user.last_name}`} />

                                                </div>
                                                <div className="profile-info">
                                                    <h2>{`${user.first_name} ${user.last_name}`}</h2>
                                                    <p className="username">@{user.username}</p>
                                                </div>
                                            </div>
                                            {user.bio ? (
                                                <><div className="bio-section">
                                                    <div className="bio-header">
                                                        <span className="bio-icon">📚</span>
                                                        <span>About Me</span>
                                                    </div>
                                                    <p className="bio-text">
                                                        {user.bio}
                                                    </p>
                                                </div>
                                                </>
                                            ) : null}



                                            <div className="profile-details">
                                                <div className="detail-item">
                                                    <span className="detail-label">Age</span>
                                                    <span className="detail-value">{user.age? user.age : "N/A"}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Grade</span>
                                                    <span className="detail-value">{formatEnum(user.grade).length ? formatEnum(user.grade) : "N/A"}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">College</span>
                                                    <span className="detail-value">{user.college.length > 0 ? user.college : "N/A"}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Major</span>
                                                    <span className="detail-value">{user.major.length > 0 ? user.major : "N/A"}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Gender</span>
                                                    <span className="detail-value">{formatEnum(user.gender).length > 0 ? formatEnum(user.gender) : "N/A"}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Relevant Coursework</span>
                                                    <span className="detail-value">{user.relevant_courses.length > 0 ? user.relevant_courses : "N/A" }</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="detail-label">Fav Study Method</span>
                                                    <span className="detail-value">{user.study_method}</span>
                                                </div>
                                    </div>
                                    <div className='tags-buttons'>
                                        <div className="profile-tags">
                                            {user.studyHabitTags.length > 0 ? (
                                                user.studyHabitTags.map((tag: string, index: number) => (
                                                    <span key={index} className={`tag ${tag}`}>
                                                        {formatEnum(tag)}
                                                    </span>
                                                ))
                                            ) : (
                                                "No study tags specified."
                                            )}

                                        </div>
                                        <div className="public-action-buttons" >
                                            <button className={`match-button-status-${matchButton.buttonText.toLowerCase()}`}
                                                disabled={matchButton.isButtonDisabled}
                                                onClick={handleInvite}
                                            >

                                                {matchButton.buttonText}
                                            </button>

                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className='public-info'>
                                    <p>No more profiles to public on!</p>
                                </div>
                            )}
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
                    user
                        ? user.name
                        : ""
                }
            />
        </div>
    );
};

export default PublicProfile;
