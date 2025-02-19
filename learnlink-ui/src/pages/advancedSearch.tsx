import React from 'react';
import Navbar from '../components/Navbar';
import ResourcesNavBar from '../components/ResourcesNavBar';
import FilterMenu from '../components/FilterMenu';
import './advancedSearch.css';
import CopyrightFooter from '../components/CopyrightFooter';
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { query } from 'express';

const AdvancedSearch: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();


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
    const[userQuery, setUserQuery] = useState<string>('');
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL;


    useEffect(() => {
        console.log("Fetching search results for:", location.search);

        const fetchResults = async () => {
            try {
                const token = localStorage.getItem('token'); // Retrieve token from storage
                const queryParams = new URLSearchParams(location.search);
                // const gender = queryParams.get("gender") || "";
                // const college = queryParams.get("college") || "";
                // const ageRange = queryParams.get("ageRange") || "";
                // const course = queryParams.get("course") || "";
                const searchQuery = queryParams.get("query") || "";
                setUserQuery(searchQuery);
                if (!searchQuery) return;



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

    const handleSelectUser = (userId: number) => {
        navigate(`/user-profile/${userId}`); // Navigate to the user's profile page
        // setSearchQuery('');
        setSearchResults([]);
      };


    return (
        <div className="advanced-search-page">
            <header>
                <Navbar />
            </header>


            <div className='advanced-search-content'>
                <main className="main-content">
                    {/* <h1>Advanced Search</h1> */}
                    {userQuery !== '' && <h2>Results for "{userQuery}"</h2>}
                    {userQuery == '' && <h2>Filtered User List</h2>}
                    {searchResults.length === 0 && <p>No results found.</p>}
                    <ul className="search-result-list">
                        {searchResults.map((user) => (
                            <p key={user.id} onClick={() => handleSelectUser(user.id)}>
                                {user.firstName} {user.lastName} (@{user.username})
                            </p>
                        ))}
                    </ul>
                </main>
                <FilterMenu />

            </div>
            <div>
                <CopyrightFooter />
            </div>
        </div>
    );
};

export default AdvancedSearch;