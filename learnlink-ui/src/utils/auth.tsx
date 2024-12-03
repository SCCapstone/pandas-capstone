import { jwtDecode } from 'jwt-decode';

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