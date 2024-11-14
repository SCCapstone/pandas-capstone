
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
      <div className = "WelcomeLogo">
        <Logo/>
      </div>
      <div className = "WelcomePage">
        <h1 className="well">Welcome!</h1>
        <p>LearnLink is an online platform that<br></br>connects like-minded individuals to <br></br>form study groups!</p>
        <button className="getStarted" onClick={handleGetStarted}>Get Started</button> <br></br>
        <button className="studyGroup">Study Groups</button> <br></br>
        <button className="studyResources">Study Resources</button> <br></br>
        <button className="messaging">Messaging</button> <br></br>
        <button className="gradeCalculator">Grade Calculator</button> 
      </div>
        <div className = "Copyright">
          <Copyright/>
        </div>
      </div>
  );
}

export default Welcome;