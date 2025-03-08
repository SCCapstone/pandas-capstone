import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import CopyrightFooter from '../components/CopyrightFooter';
import './LandingPage.css';
import './publicProfile.css';
import { formatEnum } from '../utils/format';
import InviteMessagePanel from '../components/InviteMessagePanel';
import { getLoggedInUserId } from '../utils/auth';
import CustomAlert from '../components/CustomAlert';



const PublicProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [showInvitePanel, setShowInvitePanel] = useState(false);
    const loggedInUserId = getLoggedInUserId();
    const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
    const alertVisible = alerts.some(alert => alert.visible);



    const navigate = useNavigate();
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';
    
    const handleMessage = () => {
        navigate('/messaging');
    };
    const handleSwipe = async (direction: 'Yes' | 'No', targetId: number, isStudyGroup: boolean, message:string | undefined) => {
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

    const handleSendMessage = async (message: string) => {
        handleSwipe("Yes", user.id, !!user.studyGroupId, message);
      };
      const handleInvite = () => {
        // navigate(`/messaging?user=${currentProfile.id}`);
        setShowInvitePanel(true);
        
      };

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
                console.log(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                    setAlerts((prevAlerts) => [
                        ...prevAlerts,
                        { id: Date.now(), alertText: err.message, alertSeverity: "error", visible: true },
                      ]);
                } else {
                    setError('An unknown error occurred');
                    setAlerts((prevAlerts) => [
                        ...prevAlerts,
                        { id: Date.now(), alertText: 'An unknown error occurred', alertSeverity: "error", visible: true },
                      ]);
                }
            }
        };

        fetchUser();
    }, [id]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="public-profile-page">
            <header>
                <Navbar />
            </header>
            <div className="public-profile-container">
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
                        {user ? (
                            <>
                                <div className='public-main-container'>
                                    <div className='public-left-side'>
                                        <img src={user.profilePic} alt={`${user.first_name} ${user.last_name}`} className='profile-pic' />
                                        <div className='bio'>
                                            <h3>Bio:</h3>
                                            <p>{user.bio}</p>
                                        </div>

                                    </div>
                                    <div className='public-right-side'>
                                        <h1>{user.first_name} {user.last_name}</h1>
                                        <h3>@{user.username}</h3>
                                        <div className='profile-details-container'>
                                            <div className='public-profile-details'>
                                                <p><span className="bold-first-word">Age: </span>{user.age}</p>
                                                <p><span className="bold-first-word">College: </span>{user.college}</p>
                                                <p><span className="bold-first-word">Major: </span>{user.major}</p>
                                                <p><span className="bold-first-word">Gender: </span>{user.gender}</p>
                                            </div>
                                            <div className='public-profile-details'>
                                                <p><span className="bold-first-word">Grade: </span>{user.grade}</p>
                                                <p><span className="bold-first-word">Relevant Coursework: </span>{user.relevant_courses}</p>
                                                <p><span className="bold-first-word">Fav Study Method: </span>{user.study_method}</p>
                                                <p><span className="bold-first-word">Study Tags: </span>
                                                    {user.studyHabitTags.length > 0 ? (
                                                        user.studyHabitTags.map((tag: string, index: number) => (
                                                            <span key={index} className="tag">
                                                                {formatEnum(tag)}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        "No study tags specified."
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Render more profile details as needed */}
                                </div>


                                    <div className="public-action-buttons">
                                        <button onClick={handleInvite}>
                                            Match
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
            </div>
            <footer>
                <CopyrightFooter />
            </footer>
            <InviteMessagePanel
                open={showInvitePanel}
                onClose={() => setShowInvitePanel(false)}
                onConfirm={handleSendMessage}
            />
        </div>
    );
};

export default PublicProfile;
