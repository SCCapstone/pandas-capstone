import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import FullScreenAlert from '../components/FullScreenAlert';


const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';


export const MatchRoute = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        age: '',
        college: '',
        major: '',
        grade: '',
        relevant_courses: [],
        study_method: '',
        gender: '',
        bio: '',
        studyHabitTags: [],
        ideal_match_factor: null, // Initially null to differentiate "unfetched" from "empty"
    });

    const [isLoading, setIsLoading] = useState(true); // Track loading state
    const alertShown = useRef(false); // Track whether alert has been displayed

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const userResponse = await fetch(`${REACT_APP_API_URL}/api/users/profile`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    const userData = await userResponse.json();
                    console.log('Fetched user data:', userData);

                    setFormData({
                        first_name: userData.first_name || '',
                        last_name: userData.last_name || '',
                        username: userData.username || '',
                        age: userData.age || '',
                        college: userData.college || '',
                        major: userData.major || '',
                        grade: userData.grade || '',
                        relevant_courses: userData.relevant_courses || [],
                        study_method: userData.study_method || '',
                        gender: userData.gender || '',
                        bio: userData.bio || '',
                        studyHabitTags: userData.studyHabitTags || [],
                        ideal_match_factor: userData.ideal_match_factor ?? '', // Default to empty string
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false); // Mark loading as complete
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        console.log('Updated formData:', formData);
    }, [formData]); // Debugging state updates

    if (isLoading) return null; // Prevent UI rendering before data loads

    console.log('Ideal match factor:', formData.ideal_match_factor);

    const matchReady = !formData.ideal_match_factor; // Empty or null means not ready

    console.log('Match ready:', matchReady);
    if (matchReady) {
        alertShown.current = true; // Set flag to prevent multiple alerts
        // alert('Please update your ideal match factor to start matching!');
        // return (
        //     <FullScreenAlert
        //         message="Please update your ideal match factor to start matching!"
        //         HeaderText="Incomplete Profile"
        //         buttonText="Okay"
        //         OnCancel={() => window.location.href = '/profile'}
        //     />
        // );

        return <Navigate to="/landingpage" />;
    }

    return <Outlet />;
};

