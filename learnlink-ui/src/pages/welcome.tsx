
import './welcome.css';
import '../index.css';
import {useNavigate} from 'react-router-dom';
import Logo from '../components/Logo';
import Copyright from '../components/CopyrightFooter';

function Welcome() {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/login');
    }

  return (
      <div>
        <div className="welcome">
          <div className="Logo2">
            <Logo />
          </div>
          <div className = "WelcomePage">
            <div className='leftContainer'>
              <div className='titleContainer'>
                <h1 className="well">Welcome!</h1>
                <p>The best way to find your study partner!</p>
              </div>
              <button className="getStarted" onClick={handleGetStarted}>Get<br></br>Started</button>
            </div>
            <div className='menuButtonContainer'>
              <div className="menuButtons">Study Groups</div> <br></br>
              <div className="menuButtons">Study Resources</div> <br></br>
              <div className="menuButtons">Messaging</div> <br></br>
              <div className="menuButtons">Grade Calculator</div> 
            </div>
          </div>
        </div>
        <div>
          <Copyright/>
        </div>
      </div>
  );
}

export default Welcome;