import { jwtDecode } from 'jwt-decode';

export const logout = () => {
    localStorage.removeItem('token'); // Remove the JWT from localStorage
    // If you have other user data stored, clear it as well
    localStorage.removeItem('user');
    window.location.href =