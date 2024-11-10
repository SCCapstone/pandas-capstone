import React from 'react';
import logo from './logo.svg';
import './App.css';
import Logo from './components/Logo';
import CopyrightFooter from './components/CopyrightFooter';

function App() {
  return (
    <div className="App">
      <div className = "Logo">
        <Logo />
      </div>
      <div className = "WelcomePage">
        <h1>Welcome!</h1>
        <p>LearnLink is an online platform that<br></br>connects like-minded individuals to <br></br>form study groups!</p>
        <button className="getStarted">Get Started</button> <br></br>
        <button className="studyGroup">Study Groups</button> <br></br>
        <button className="studyResources">Study Resources</button> <br></br>
        <button className="messaging">Messaging</button> <br></br>
        <button className="gradeCalculator">Grade Calculator</button> 
      </div>
      <div className = "Copyright">
        <CopyrightFooter/>
      </div>
    </div>
  );
}

export default App;
