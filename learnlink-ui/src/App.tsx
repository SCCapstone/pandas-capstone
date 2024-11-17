import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/welcome';
import Login from './pages/login';
import Signup from './pages/signup';
import LandingPage from './pages/LandingPage';
import Settings from './pages/settings';
import Messaging from './pages/messaging';
import Profile from './pages/profile';
//routes
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/landingpage" element={<LandingPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/messaging" element = {<Messaging/> }/>
          <Route path="/profile" element = {<Profile/> }/>
        </Routes> 
      </div>
    </Router>
  );
}

export default App;