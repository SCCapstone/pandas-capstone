import axios from "axios";
import { Data } from "ws";

const API_URL= process.env.REACT_APP_API_URL|| "http://localhost:5000";

export interface LoginData {
    username: String;
    password: String;
}

export interface SignUpData {
    username: String;
    email: String;
    password: String;
}

//function to handle the login requests
export const login = async (data: LoginData) => {
    try {
        const response = await axios.post(`${API_URL}/login`, data);

        if (response.data && response.data.token) {
            return response.data;
        } else {
            throw new Error('No token found');
        }
    } catch(error: any) {
        console.error("Login error:", error);

        // Return specific error message from server, if available
        const errorMessage = error.response?.data?.message || 'Failed to login. Please try again.';
        throw new Error(errorMessage);
    };
};

//function to handle the sign up requests
export const signUpUser = async (data: SignUpData) => {
    try {
        const response = await axios.post(`${API_URL}/signup`, data);

        if (response.data && response.data.token) {
            return response.data;
        } else {
            throw new Error('No token found');
        }
    } catch(error: any) {
        console.error("Sign-up error:", error);

        // Return specific error message from server, if available
        const errorMessage = error.response?.data?.message || 'Sign Up Failed. Try Again Please.';
        throw new Error(errorMessage);
    };
};
