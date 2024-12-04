import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import CopyrightFooter from '../components/CopyrightFooter';
import './LandingPage.css';
import './publicProfile.css';
import { formatEnum } from '../utils/format';

const PublicProfile = () => {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    
    const handleMessage = () => {
        navigate('/messaging');
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`http://localhost:2020/api/users/profile/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }
                const data = await response.json();
                setUser(data);
                console.log(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred');
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
                                        <button onClick={handleMessage}>
                                            Message
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
        </div>
    );
};

export default PublicProfile;
