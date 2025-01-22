import { Navigate, Outlet } from 'react-router-dom';
import { isTokenExpired } from './auth';

export const PrivateRoutes = () => {

  if (isTokenExpired()) {
    alert('Please log in to access this page.');
    return <Navigate to="/login" />;
  }
  return <Outlet />;
};