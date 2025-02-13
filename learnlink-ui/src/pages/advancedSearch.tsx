import React from 'react';
import Navbar from '../components/Navbar';
import ResourcesNavBar from '../components/ResourcesNavBar';
import './advancedSearch.css';
import CopyrightFooter from '../components/CopyrightFooter';
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const AdvancedSearch: React.FC = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get("query") || "";
    const gender = queryParams.get("gender") || "";
    const college = queryParams.get("college") || "";
    const ageRange = queryParams.get("ageRange") || "";
    const course = queryParams.get("course") || "";


    interface User {
        id: number;
        username: string;
        firstName: string;
        lastName: string;
        age: number; // Add the age property
        gender: string;
        college: string;
        coursework: string[];
    }

    const [searchResults, setSearchResults] = useState<User[]>([]);
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL;


    useEffect(() => {
        if (!searchQuery) return;
        console.log("Fetching search results for:", location.search);

        const fetchResults = async () => {
            try {
                const token = localStorage.getItem('token'); // Retrieve token from storage

                if (!token) {
                    console.error("🚨 No token found! User might not be logged in.");
                    return;
                }
                //console.log("Fetching search results from:", `${REACT_APP_API_URL}/api/users/search?${queryParams.toString()}`);

                const response = await fetch(`${REACT_APP_API_URL}/api/users/search?${queryParams.toString()}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // Include token
                    },
                });
                const data = await response.json();
                setSearchResults(data.users);
            } catch (error) {
                console.error("Error fetching search results:", error);
            }
        };

        fetchResults();
    }, [location.search]); // 🔹 Re-fetch when URL updates


    return (
        <div className="advanced-search-page">
            <header>
                <Navbar />
            </header>


            <div className='advanced-search-content'>
                <ResourcesNavBar />
                <main className="main-content">
                    <h1>External advanced-search</h1>
                    <h2>External Scheduling Tool</h2>
                    {searchResults.map((user) => (
                        <li key={user.id}>{user.username}</li>
                    ))}
                </main>
            </div>
            <footer>
                <CopyrightFooter />
            </footer>
        </div>
    );
};

export default AdvancedSearch;