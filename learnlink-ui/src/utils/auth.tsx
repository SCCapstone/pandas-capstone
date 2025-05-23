import { jwtDecode } from 'jwt-decode';
import { Navigate, useNavigate, Route, useLocation } from 'react-router-dom';
import { JSX } from 'react/jsx-runtime';

export const logout = () => {
    localStorage.removeItem('token'); // Remove the JWT from localStorage
    // If you have other user data stored, clear it as well
    localStorage.removeItem('user');
    window.location.href = '/login'; // Redirect to login page
  };

// retrieve the JWT token from localStorage
export const getLoggedInUserId = (): number | null => {
  const token = localStorage.getItem('token'); // Retrieve token from localStorage

  if (!token) {
    console.warn('No token found');
    return null;
  }
  try {
    // Decode the token
    const decodedToken: { userId: string; username: string; iat: number; exp: number } = jwtDecode(token);

    // Extract the userId
    return parseInt(decodedToken.userId) || null;

  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

// retrieve the JWT token from localStorage
export const getLoggedInUserIdString = (): string | null => {
  const token = localStorage.getItem('token'); // Retrieve token from localStorage

  if (!token) {
    console.warn('No token found');
    return null;
  }
  try {
    // Decode the token
    const decodedToken: { userId: string; username: string; iat: number; exp: number } = jwtDecode(token);

    // Extract the userId
    return decodedToken.userId || null;

  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};


export const isTokenExpired = (): boolean => {
  const token = localStorage.getItem('token');

  // If there's no token, return true (indicating that the token is expired or invalid)
  if (!token) {
    console.log('No token found in localStorage');
    return true;
  }

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds

    // Check if the token has expired
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      console.log('Token expired');
      localStorage.removeItem('token'); // Optional: remove the expired token
      return true;
    }

    // If token is valid
    return false;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // If there's an error decoding, treat the token as invalid
  }
};
