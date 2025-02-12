// Navbar.tsx
import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './components.css';
import Logo from '../components/Logo';
import { FaSearch, FaBell, FaCog, FaUserCircle, FaTimes, FaSlidersH } from 'react-icons/fa';
import Select from 'react-select';
import { useEnums, formatEnum, useColleges } from '../utils/format';
import  makeAnimated from 'react-select/animated';
import { set } from 'react-hook-form';
import ReactSlider from 'react-slider'


const animatedComponents = makeAnimated();

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
interface FilterCriteria {
  age?: { min?: number; max?: number };
  gender?: "Male" | "Female" | "Nonbinary" | "Other" | "Prefer not to say";
  college?: string;
  coursework?: string[];
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  // Filter Consts
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({});
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedGenders, setSelectedGenders] = useState<{ value: string; label: string }[]>([]);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 30]); // Default range
  const [selectedColleges, setSelectedColleges] = useState<{ label: string; value: string }[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<{ label: string; value: string }[]>([]);
  const [collegeInputValue, setCollegeInputValue] = useState(""); // State to track the input value
  const [courseInputValue, setCourseInputValue] = useState(""); // State to track the input value

  const { grade, gender, studyHabitTags } = useEnums();
  const colleges = useColleges();

  
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL;
  // Function to handle search and display results
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults([]);
      setIsDropdownVisible(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch(`${REACT_APP_API_URL}/api/users/search?query=${query}`, {
          headers: {
            'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          },
        });
      
      const data = await response.json();

        if (response.ok) {
          let filteredUsers = data.users as User[];

          // Apply filtering based on criteria
          filteredUsers = filteredUsers.filter((user) => {
            if (filterCriteria.age) {
              const { min, max } = filterCriteria.age;
              if ((min !== undefined && user.age < min) || (max !== undefined && user.age > max)) {
                return false;
              }
            }

            if (filterCriteria.gender && user.gender !== filterCriteria.gender) {
              return false;
            }

            if (filterCriteria.college && user.college.toLowerCase() !== filterCriteria.college.toLowerCase()) {
              return false;
            }

            if (filterCriteria.coursework && filterCriteria.coursework.length > 0) {
              if (!filterCriteria.coursework.some((course) => user.coursework.includes(course))) {
                return false;
              }
            }

            return true;
          });

          setSearchResults(filteredUsers);
          setIsDropdownVisible(true);
        } else {
          setSearchResults([]);
          setIsDropdownVisible(false);
        }
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
      setIsDropdownVisible(false);
    }
  };

  const handleFilterChange = (key: keyof FilterCriteria, value: any) => {
    setFilterCriteria((prev) => ({ ...prev, [key]: value }));
  };

  // Handler to update selected options
  const handleCollegeChange = (selected: any) => {
    setSelectedColleges(selected);
  };

  const handleCourseChange = (selected: any) => {
    setSelectedCourses(selected);
  };


  // Function to handle when a user selects a search result
  const handleSelectUser = (userId: number) => {
    navigate(`/user-profile/${userId}`); // Navigate to the user's profile page
    setSearchQuery('');
    setSearchResults([]);
    setIsDropdownVisible(false);
  };
  const handleSettings = () => {
    navigate('/settings');
  };
  const handleMessaging = () => {
    navigate('/messaging');
  };
  const handleAccountDetails = () => {
    navigate('/accountDetails');
  }
  const [isNavOpen, setIsNavOpen] = useState(false);
  return (
    <header className="navbar">
      <div className="nav-logo"><Logo /></div>
      {/* <FaBars className="hamburger" onClick={() => setIsNavOpen(true)} /> */}

      {/* Normal Navigation Links*/}
      <nav className="nav-links">
        <a href="/swiping">Match</a>
        <a href="/profile">Profile</a>
        <a href="/messaging" onClick={handleMessaging}>Messaging</a>
        <a href="/resources/studyTips">Resources</a>
      </nav>

      <div className="search-bar">
        <FaSlidersH className='hamburger-icon' onClick={() => setIsFilterVisible(!isFilterVisible)} />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search for users"
        />
        {isDropdownVisible && searchResults.length > 0 && (
          <ul className="dropdown">
            {searchResults.map((user) => (
              <p key={user.id} onClick={() => handleSelectUser(user.id)}>
                {user.firstName} {user.lastName} (@{user.username})
              </p>
            ))}
          </ul>
        )}

        {isFilterVisible && (
          <div className="filters">
            {/* <select onChange={(e) => handleGetEnums()}>
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select> */}
            <div className="college-filter">
              <label>College:</label>
              <Select
                isMulti
                name="college-filter"
                components={animatedComponents}
                options={colleges} // Can be prefilled with options if needed
                value={selectedColleges}
                onChange={handleCollegeChange}
                isClearable
                isSearchable
                placeholder="Type or select colleges..."
                className="basic-multi-select"
                classNamePrefix="select"
                noOptionsMessage={() => "Type to add a new college"}
                inputValue={collegeInputValue} // Set input value
                onInputChange={(newInputValue) => setCollegeInputValue(newInputValue)} // Update input value on change
                onKeyDown={(e) => {
                  if (e.key === "Enter" && collegeInputValue) {
                    setSelectedColleges([
                      ...selectedColleges,
                      { label: collegeInputValue, value: collegeInputValue }
                    ]);
                    setCollegeInputValue(""); // Clear input
                  }
                }}
              />
            </div>
            <div className="coursework-filter">
              <label>Course:</label>
              <Select
                isMulti
                name="course-filter"
                components={animatedComponents}
                options={[]} // Can be prefilled with options if needed
                value={selectedCourses}
                onChange={handleCourseChange}
                isClearable
                isSearchable
                placeholder="Type or select courses..."
                className="basic-multi-select"
                classNamePrefix="select"
                noOptionsMessage={() => "Type to add a new course"}
                inputValue={courseInputValue} // Set input value
                onInputChange={(newInputValue) => setCourseInputValue(newInputValue)} // Update input value on change
                onKeyDown={(e) => {
                  if (e.key === "Enter" && courseInputValue) {
                    setSelectedCourses([
                      ...selectedCourses,
                      { label: courseInputValue, value: courseInputValue }
                    ]);
                    setCourseInputValue(""); // Clear input
                  }
                }}
              />
            </div>
            <div className="age-slider-container">
              <label>Age Range: {ageRange[0]} - {ageRange[1]}</label>

              <div className="slider-wrapper">
                {/* Min Label */}
                <span className="slider-label min-label">18</span>

                {/* Slider */}
                <ReactSlider
                  className="age-slider"
                  thumbClassName="thumb"
                  trackClassName="track"
                  min={18}
                  max={100}
                  value={ageRange}
                  onChange={(newValue) => setAgeRange(newValue as [number, number])}
                  pearling
                  minDistance={1}
                />

                {/* Max Label */}
                <span className="slider-label max-label">100</span>
              </div>
            </div>
            <div className="gender-filter">
              <label>Gender:</label>
              <Select
                isMulti
                name="gender-filter"
                options={gender.map((tag) => ({
                  value: tag,
                  label: formatEnum(tag), // Assuming formatEnum formats the tag as a readable label
                }))}
                value={selectedGenders} // Controlled state
                onChange={(selectedOptions) => setSelectedGenders(selectedOptions as { value: string; label: string }[] || [])} // Updates state
                closeMenuOnSelect={false}
                components={animatedComponents}
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </div>

            {/* <input type="number" placeholder="Min Age" onChange={(e) => handleFilterChange("age", { ...filterCriteria.age, min: Number(e.target.value) })} />
            <input type="number" placeholder="Max Age" onChange={(e) => handleFilterChange("age", { ...filterCriteria.age, max: Number(e.target.value) })} /> */}

            {/* <input type="text" placeholder="College" onChange={(e) => handleFilterChange("college", e.target.value)} />

            <input type="text" placeholder="Coursework (comma-separated)" onChange={(e) => handleFilterChange("coursework", e.target.value.split(","))} /> */}
          </div>
        )}
        <FaSearch className="search-icon" />
      </div>



      {/* Full-Screen Menu */}
      <div className={`fullscreen-menu ${isNavOpen ? "show" : ""}`}>
        <FaTimes className="close-icon" onClick={() => setIsNavOpen(false)} />
        <a href="/swiping">Match</a>
        <a href="/profile">Profile</a>
        <a href="/messaging" onClick={handleMessaging}>Messaging</a>
        <a href="/resources/studyTips">Resources</a>
      </div>

      <div className="nav-icons">
        <FaBell className="icon" />
        <FaCog className="icon" onClick={handleSettings} />
        <FaUserCircle className="icon profile-icon" onClick={handleAccountDetails} />
      </div>
    </header>
  );
};

export default Navbar;

