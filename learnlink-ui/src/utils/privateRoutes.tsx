import { Navigate, Outlet } from 'react-router-dom';
import { isTokenExpired } from './auth';
import FullScreenAlert from '../components/FullScreenAlert';

export const PrivateRoutes = () => {

  if (isTokenExpired()) {
    // alert('Please log in to access this page.');
    return (
      <FullScreenAlert 
      message="Please log in to access this page."
      HeaderText="Session Expired"
      buttonText="Okay"
      OnCancel={() => window.location.href = '/login'}
      />
    );
  }
  return <Outlet />;
};