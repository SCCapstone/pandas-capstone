import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/welcome';
import Login from './pages/login';
import Signup from './pages/signup';
import LandingPage from './pages/LandingPage';
import Settings from './pages/settings';
import Messaging from './pages/messaging';
import Profile from './pages/profile';
import Resources from './pages/resources/resources';
import StudyTips from './pages/resources/studyTips';
import ExternalResources from './pages/resources/externalResources';
import GradeCalculator from './pages/resources/gradeCalculator';
import ForgotPassword from './pages/forgotPassword';
import Swiping from './pages/swiping';
import UpdateEmail from './pages/updateEmail';
import ResetPassword from './pages/resetPassword';
import ChangePassword from './pages/changePassword';
import AccountDetails from './pages/accountDetails';
import PublicProfile from './pages/publicProfile';
import {PrivateRoutes} from './utils/privateRoutes';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Welcome />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          
          {/* Private Routes */}
          <Route element={<PrivateRoutes/>}>
            <Route path="/landingpage" element={<LandingPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/messaging" element = {<Messaging/> }/>
            <Route path="/profile" element = {<Profile/> }/>
            <Route path="/resources" element = {<Resources/> }/>
            <Route path="/resources/studyTips" element = {<StudyTips/> }/>
            <Route path="/resources/externalResources" element = {<ExternalResources/> }/>
            <Route path="/resources/gradeCalculator" element = {<GradeCalculator/> }/>
            <Route path="/resetpassword" element={<ResetPassword />} />
            <Route path="/swiping" element={<Swiping />} />
            <Route path="/updateEmail" element={<UpdateEmail />} />
            <Route path="/changepassword" element={<ChangePassword />} />
            <Route path="/accountDetails" element={<AccountDetails />} />
            <Route path="/user-profile/:id" element={<PublicProfile />} />
          </Route>
        </Routes> 
      </div>
    </Router>
  );
}

export default App;