import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { set } from 'react-hook-form';
import Navbar from '../components/Navbar';
import CopyrightFooter from '../components/CopyrightFooter';
import './LandingPage.css';
import './publicProfile.css';

const PublicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
              {/* <img src={user.profilePic || '/default-avatar.png'} alt={`${user.firstName}'s profile`} /> */}
              <p>{user.first_name} {user.last_name}</p>
              <p>@{user.username}</p>
              <p>{user.bio}</p>
              {/* Add other fields as needed */}
          </div>
          <footer>
              <CopyrightFooter />
          </footer>
      </div>
  );
};

export default PublicProfile;
