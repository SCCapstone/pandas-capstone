// Navbar.tsx
import React from 'react';
import { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import './components.css';
import Logo from '../components/Logo';
import { FaSearch, FaBell, FaCog, FaUserCircle, FaTimes, FaSlidersH, FaBars } from 'react-icons/fa';
import Select from 'react-select';
import { useEnums, formatEnum, useColleges } from '../utils/format';
import  makeAnimated from 'react-select/animated';
import { set } from 'react-hook-form';
import ReactSlider from 'react-slider'
import { useEffect } from 'react';
import NotificationDropdown from './NotificationDropdown';


const animatedComponents = makeAnimated();
// const location = useLocation(); // ✅ Correct way to use location in React


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
  const location = useLocation().pathname;


  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  // Filter Consts
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({});
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedGenders, setSelectedGenders] = useState<{ value: string; label: string }[]>([]);
  const [ageRange, setAgeRange] = useState<[number, number] | null>(null); // Default range can be null  
  const [selectedColleges, setSelectedColleges] = useState<{ label: string; value: string }[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<{ label: string; value: string }[]>([]);
  const [collegeInputValue, setCollegeInputValue] = useState(""); // State to track the input value
  const [courseInputValue, setCourseInputValue] = useState(""); // State to track the input value
  const [searchParams, setSearchParams] = useSearchParams();
  const [isNotificationDropdownVisible, setIsNotificationDropdownVisible] = useState(false);



  const { grade, gender, studyHabitTags } = useEnums();
  const {isLoading, colleges} = useColleges();

  
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // Sync the search query and filter criteria from URL params whenever the URL changes
    const query = searchParams.get('query') || '';
    const genderParam = searchParams.get('gender') || '';
    const collegeParam = searchParams.get('college') || '';
    const courseParam = searchParams.get('course') || '';
    let ageRangeParam: [number, number] | null = (searchParams.get('ageRange')?.split(',').map(Number) as [number, number]) || '';
  
    if (!(ageRangeParam.length === 2 && ageRangeParam.every(age => !isNaN(age)))) {
      ageRangeParam = null;
    }
    // Convert params into expected format
    const parsedGenders = genderParam ? genderParam.split(',').map(g => ({ value: g, label: formatEnum(g) })) : [];
    const parsedColleges = collegeParam ? collegeParam.split(',').map(c => ({ label: c, value: c })) : [];
    const parsedCourses = courseParam ? courseParam.split(',').map(c => ({ label: c, value: c })) : [];
  
    // Only update state if the values have changed (prevents infinite loops)
    setSelectedGenders(prev => JSON.stringify(prev) !== JSON.stringify(parsedGenders) ? parsedGenders : prev);
    setSelectedColleges(prev => JSON.stringify(prev) !== JSON.stringify(parsedColleges) ? parsedColleges : prev);
    setSelectedCourses(prev => JSON.stringify(prev) !== JSON.stringify(parsedCourses) ? parsedCourses : prev);
    setAgeRange(prev => JSON.stringify(prev) !== JSON.stringify(ageRangeParam) ? ageRangeParam : prev);

    //handleSearchFromAdvanced(query); // Trigger search whenever the URL query parameters change
  }, [searchParams]);

  // Function to handle search and display results
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    console.log("Searching for:", query);
    // const query = e.target.value;
    // setSearchQuery(query);
  
    if (location !== "/advancedsearch") {

    if (query.trim() === '') {
      setSearchResults([]);
      setIsDropdownVisible(false);
      return;
    }
  }
  
    const token = localStorage.getItem('token');

    const queryParams = new URLSearchParams({
      query: query,
      gender: selectedGenders.map(gender => gender.label).join(','),
      college: selectedColleges.map(college => college.label).join(','),
      course: selectedCourses.map(course => course.label).join(','),
      ageRange: ageRange ? ageRange.join(',') : '',
    });

    console.log("Query Params:", queryParams.toString());
  
    try {
      if (token) {
        const response = await fetch(`${REACT_APP_API_URL}/api/users/search?${queryParams.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
  
        const data = await response.json();
        
        if (response.ok) {
          setSearchResults(data.users);

          if (location === "/advancedsearch") {
            // If on Advanced Search page, fetch and update results without dropdown
            setIsDropdownVisible(false);
            navigate(`/advancedsearch?${queryParams.toString()}`, { replace: true });

          } else {
            // Otherwise, show dropdown results
            setIsDropdownVisible(true);
          }
        } else {
          setSearchResults([]);
          setIsDropdownVisible(false);
        }
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setSearchResults([]);
      setIsDropdownVisible(false);
    }
  };

  const updateFiltersInURL = () => {
    const queryParams = new URLSearchParams();
    queryParams.set('query', searchQuery);
    queryParams.set('gender', selectedGenders.map(gender => gender.label).join(','));
    queryParams.set('college', selectedColleges.map(college => college.label).join(','));
    queryParams.set('course', selectedCourses.map(course => course.label).join(','));
    queryParams.set('ageRange', ageRange ? ageRange.join(',') : '',
  );

    setSearchParams(queryParams);
  };

    // Function to handle search and display results
    const handleSearchFromAdvanced = async (query:string) => {
      setSearchQuery(query);
  
      console.log("Searching for:", query);
      // const query = e.target.value;
      // setSearchQuery(query);
    
      if (query.trim() === '') {
        setSearchResults([]);
        setIsDropdownVisible(false);
        return;
      }
    
      const token = localStorage.getItem('token');
  
      const queryParams = new URLSearchParams({
        query: query,
        gender: selectedGenders.map(gender => gender.label).join(','),
        college: selectedColleges.map(college => college.label).join(','),
        course: selectedCourses.map(course => course.label).join(','),
        ageRange: ageRange ? ageRange.join(',') : '',
      });
  
      console.log("Query Params:", queryParams.toString());
    
      try {
        if (token) {
          const response = await fetch(`${REACT_APP_API_URL}/api/users/search?${queryParams.toString()}`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
    
          const data = await response.json();
          
          if (response.ok) {
            setSearchResults(data.users);
  
            if (location === "/advancedsearch") {
              // If on Advanced Search page, fetch and update results without dropdown
              setIsDropdownVisible(false);
              navigate(`/advancedsearch?${queryParams.toString()}`, { replace: true });
  
            } else {
              // Otherwise, show dropdown results
              setIsDropdownVisible(true);
            }
          } else {
            setSearchResults([]);
            setIsDropdownVisible(false);
          }
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setSearchResults([]);
        setIsDropdownVisible(false);
      }
    };


  const handleApplyFilters = () => {
    console.log("Filters applied:", {
      selectedColleges,
      selectedCourses,
      ageRange,
      selectedGenders,
    });
  
    // You can call an API or perform any action based on the selected filters here
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
  const handleFilter = () => {
    navigate('/advancedsearch');
  };

  const handleNotifs = () => {
    setIsNotificationDropdownVisible(!isNotificationDropdownVisible);
  };

  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleClearFilters = () => {
    setSelectedColleges([]);
    setSelectedCourses([]);
    setAgeRange(null);
    setSelectedGenders([]);
    setFilterCriteria({});
  };

  return (
    <header className="navbar">
      <div className="nav-logo"><Logo /></div>
      <FaBars className="hamburger" onClick={() => setIsNavOpen(true)} />

      {/* Normal Navigation Links*/}
      <nav className="nav-links">
        <a href="/swiping">Match</a>
        <a href="/profile">Profile</a>
        <a href="/messaging" onClick={handleMessaging}>Messaging</a>
        <a href="/resources/studyTips">Resources</a>
      </nav>

      <div className="search-bar">
        <FaSlidersH className='hamburger-icon' onClick={handleFilter} />
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
        <FaBell className="icon" onClick={handleNotifs}/>
        {isNotificationDropdownVisible && <NotificationDropdown />}
        <FaCog className="icon" onClick={handleSettings} />
        <FaUserCircle className="icon profile-icon" onClick={handleAccountDetails} />
      </div>
    </header>
  );
};

export default Navbar;