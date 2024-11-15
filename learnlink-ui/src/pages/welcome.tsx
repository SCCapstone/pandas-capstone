
import './welcome.css';
import {useNavigate} from 'react-router-dom';
import Logo from '../components/Logo';
import Copyright from '../components/CopyrightFooter';

function Welcome() {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('login');
    }

  return (
      <div className="welcome">
      <div className="Logo2">
                <Logo />
      </div>
      <div className = "WelcomePage">
        <div className='leftContainer'>
          <div className='titleContainer'>
            <h1 className="well">Welcome!</h1>
            <p>LearnLink is an online platform that connects like-minded individuals to form study groups!</p>
          </div>
          <button className="getStarted" onClick={handleGetStarted}>Get<br></br>Started</button>
        </div>
        <div className='menuButtonContainer'>
          <button className="menuButtons">Study Groups</button> <br></br>
          <button className="menuButtons">Study Resources</button> <br></br>
          <button className="menuButtons">Messaging</button> <br></br>
          <button className="menuButtons">Grade Calculator</button> 
        </div>
      </div>
        <div className = "Copyright2">
          <Copyright/>
        </div>
      </div>
  );
}

export default Welcome;