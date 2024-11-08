import logo from './logo.svg';
import './welcome.css';
import { ReactComponent as MySvgFile } from './LearnLink.svg';
import {useNavigate} from 'react-router-dom';

function Welcome() {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('login');
    }

  return (
      <div className="welcome">
      <div className = "Logo">
        <MySvgFile />
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
          <footer>&copy; LearnLink</footer>
        </div>
      </div>
  );
}

export default Welcome;