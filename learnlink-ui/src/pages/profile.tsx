import React from 'react';
import Navbar from '../components/Navbar';
import './profile.css';
import CopyrightFooter from '../components/CopyrightFooter';

const Profile: React.FC = () => {
  return (
    <div className="profile-page">
      <Navbar />
        <div className='main-container'>
        <header className="profile-header">
          <h1 className="profile-title">Update Profile</h1>
        </header>
        <main className="profile-content">
          <div className="profile-details">
            <form className="profile-form">
              <label>
                Age: <input type="text" name="age" />
              </label>
              <label>
                College: <input type="text" name="college" />
              </label>
              <label>
                Major: <input type="text" name="major" />
              </label>
              <label>
                Grade (undergrad/grad): <input type="text" name="grade" />
              </label>
              <label>
                Relevant Course: <input type="text" name="course" />
              </label>
              <label>
                Fav Study Method: <input type="text" name="studyMethod" />
              </label>
              <label>
                Gender: <input type="text" name="gender" />
              </label>
            </form>
            
              <form className="profile-form">
                <div className="profile-picture">
                  <button className="upload-button">CLICK TO ADD PICTURE</button>
                </div>
                <label>
                    Bio: <textarea name="bio" />
                </label>          
                <div className="profile-buttons">
                  <button className="back-button">BACK</button>
                  <button className="save-button">SAVE</button>
                </div>
              </form>
          </div>
        </main>
      </div>
      <CopyrightFooter />
    </div>
  );
};

export default Profile;

