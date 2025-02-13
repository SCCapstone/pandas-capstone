import './EditStudyGroup.css';
import '../pages/messaging.css';
import React, { use, useEffect, useState } from 'react';
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


const FilterMenu = () => {
const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState<User[]>([]);
//   const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  // Filter Consts
  const [selectedGenders, setSelectedGenders] = useState<{ value: string; label: string }[]>([]);
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 100]); // Default range
  const [selectedColleges, setSelectedColleges] = useState<{ label: string; value: string }[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<{ label: string; value: string }[]>([]);
  const [collegeInputValue, setCollegeInputValue] = useState(""); // State to track the input value
  const [courseInputValue, setCourseInputValue] = useState(""); // State to track the input value
  const [filterCriteria, setFilterCriteria] = useState({ selectedColleges, selectedCourses, selectedGenders, ageRange });   // State to track the filter criteria


  const { grade, gender, studyHabitTags } = useEnums();
  const {isLoading, colleges} = useColleges();

  
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL;
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

  const handleClearFilters = () => {
    setSelectedColleges([]);
    setSelectedCourses([]);
    setAgeRange([0,100]);
    setSelectedGenders([]);
    setFilterCriteria({ selectedColleges: [], selectedCourses: [], selectedGenders: [], ageRange: [0, 100] });
  };


    const handleSetFilterCriteria = () => {
        setFilterCriteria({ selectedColleges, selectedCourses, selectedGenders, ageRange });
      };


  





  return (
    <div className="filter-menu">
    <div className="filters">
            <div className="college-filter">
              <label>College:</label>
              <Select
                isMulti
                name="college-filter"
                components={animatedComponents}
                options={isLoading ? [] : colleges} // Only show colleges when they are loaded
                value={selectedColleges}
                onChange={handleCollegeChange}
                isClearable
                isSearchable
                placeholder="Type or select colleges..."
                className="basic-multi-select"
                classNamePrefix="select"
                noOptionsMessage={() => "Type to add a new college"}
                inputValue={collegeInputValue}
                onInputChange={(newInputValue) => setCollegeInputValue(newInputValue)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && collegeInputValue) {
                    const newCollege = { label: collegeInputValue, value: collegeInputValue };
                    setSelectedColleges([...selectedColleges, newCollege]);
                    // setColleges([...colleges, newCollege]);
                    setCollegeInputValue('');
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
            <div className="filter-buttons">
              <button onClick={handleSetFilterCriteria} className="filter-btn">Apply Filters</button>
              <button onClick={handleClearFilters} className="cancel-btn">Clear</button>
            </div>
          </div>
          </div>
          
        
  );
};

export default FilterMenu;