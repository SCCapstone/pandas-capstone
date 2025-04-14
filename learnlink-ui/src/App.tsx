import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/welcome';
import Login from './pages/login';
import Signup from './pages/signup';
import LandingPage from './pages/LandingPage';
import Settings from './pages/settings';
import Messaging from './pages/messaging';
import Profile from './pages/profile';
import WebsiteMilestone from './pages/WebsiteMilestone';
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
import {MatchRoute} from './utils/matchRoute';
import ResetPasswordFromEmail from './pages/resetPasswordFromEmail';
import AdvancedSearch from './pages/advancedSearch';
import Network from './pages/Network/Network';
import Groups from './pages/groups'
import Scheduler from './pages/resources/Scheduler'
import JoinRequestNotifs from './components/JoinRequestsContext';
import JoinRequestsNotificationBadge from './components/JoinRequestsNotificationBadge';
import { getLoggedInUserId } from './utils/auth';
import PublicGroupProfile from './pages/publicGroupProfile';
import Navbar from './components/Navbar';
import React, { useState, useEffect } from 'react';



const App: React.FC = () => {
  const [notifCurrentUserId, setNotifCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const userIdFromToken = getLoggedInUserId();
    if (userIdFromToken) {
      setNotifCurrentUserId(userIdFromToken);
    }
  }, []);

  const handleLogin = (userId: number) => {
    setNotifCurrentUserId(userId);
  };


  return (
    <Router>

      <div className="App">
        {notifCurrentUserId !== undefined && (
          <JoinRequestNotifs notifCurrentUserId={notifCurrentUserId}>
            <Routes>

              {/* Public Routes */}
              <Route path="/" element={<Welcome />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/websitemilestone" element={<WebsiteMilestone/>}/>
              <Route path="/forgotpassword" element={<ForgotPassword />} />
              <Route path="/resetpassword/:token" element={<ResetPasswordFromEmail />} />


              {/* Private Routes */}
              <Route element={<PrivateRoutes />}>
                <Route path="/landingpage" element={<LandingPage />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/messaging" element={<Messaging />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/resources/studyTips" element={<StudyTips />} />
                <Route path="/resources/externalResources" element={<ExternalResources />} />
                <Route path="/resources/gradeCalculator" element={<GradeCalculator />} />
                <Route
                  path="/studyGroup/:studyGroupId/schedule"
                  element={<Scheduler />}
                />            <Route path="/resetpassword" element={<ResetPassword />} />
                <Route element={<MatchRoute />}>
                  <Route path="/swiping" element={<Swiping />} />
                </Route>
                <Route path="/network" element={<Network />} />
                <Route path="/updateEmail" element={<UpdateEmail />} />
                <Route path="/changepassword" element={<ChangePassword />} />
                <Route path="/accountDetails" element={<AccountDetails />} />
                <Route path="/user-profile/:id" element={<PublicProfile />} />
                <Route path="/group-profile/:id" element={<PublicGroupProfile />} />
                <Route path="/advancedsearch" element={<AdvancedSearch />} />
              </Route>
            </Routes>
          </JoinRequestNotifs>
        )}

      </div>

    </Router>
  );
}

export default App;