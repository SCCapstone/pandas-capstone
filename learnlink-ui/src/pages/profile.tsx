import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useEnums, formatEnum, useColleges, normalizeCourseInput } from '../utils/format';
import './profile.css';
import CopyrightFooter from '../components/CopyrightFooter';
import makeAnimated from 'react-select/animated';
import Select from 'react-select';
import { profile } from 'console';
import { set } from 'react-hook-form';
import CustomAlert from '../components/CustomAlert';
import ProfilePictureModal from '../components/ProfilePictureModal';
import CreatableSelect from "react-select/creatable";
import { MultiValue } from "react-select";


// Animated components for select dropdowns
const animatedComponents = makeAnimated();

// Define types for options in select dropdown
type OptionType = {
  label: string;
  value: string;
};

// Initial courses list
const initialOptions: string[] = [
  "CSCE 145",
  "MATH 221",
  "BIO 101L",
];

// Profile component
const Profile: React.FC = () => {
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';
  const { isLoading, colleges } = useColleges();
  const [options, setOptions] = useState<string[]>(initialOptions);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

    // Handle course creation (for user input that doesn't exist in the options)
  const handleCreate = (inputValue: string) => {
    const normalized = normalizeCourseInput(inputValue);
    const newOption = normalized;
    setOptions((prev) => [...prev, newOption]);
    setSelectedCourses((prev) => [...prev, newOption]);
  };
  
    // Form data to store user input
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    age: '',
    college: '',
    major: '',
    grade: '',
    relevant_courses: [] as string[],
    study_method: '',
    gender: '',
    bio: '',
    studyHabitTags: [] as string[],
    ideal_match_factor: '',
    profilePic: '',
  });


  // State to store enum options
  const [enumOptions, setEnumOptions] = useState({ grade: [], gender: [], studyHabitTags: [] });
  const [courseOptions, setCourseOptions] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [selectedEmojiURL, setSelectedEmojiURL] = useState<string | null>(null);
  const [isLoadingProfilePage, setIsLoadingProfilePage] = useState(true)


  // Fetch enum values on component mount
  useEffect(() => {
    const fetchData = async () => {

      try {
        setIsLoadingProfilePage(true);
        // Fetch enum options
        const enumsResponse = await fetch(`${REACT_APP_API_URL}/api/enums`);
        const enumsData = await enumsResponse.json();
        setEnumOptions({
          grade: enumsData.grade,
          gender: enumsData.gender,
          studyHabitTags: enumsData.studyHabitTags,
        });
        const courseOptionsResponse = await fetch(`${REACT_APP_API_URL}/api/users/courses`);
        const courseOptionsdata = await courseOptionsResponse.json()

        setCourseOptions(courseOptionsdata)

        // Fetch the current user profile data
        const token = localStorage.getItem('token');
        if (token) {
          const userResponse = await fetch(`${REACT_APP_API_URL}/api/users/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const userData = await userResponse.json();
          console.log('Fetched user data:', userData); // Debug log

                    // Update form data with user profile data
          setFormData({
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            username: userData.username || '',
            age: userData.age || '',
            college: userData.college || '',
            major: userData.major || '',
            grade: userData.grade || '',
            relevant_courses: userData.relevant_courses || [],
            study_method: userData.study_method || '',
            gender: userData.gender || '',
            bio: userData.bio || '',
            studyHabitTags: userData.studyHabitTags || [],
            ideal_match_factor: userData.ideal_match_factor || '',
            profilePic: userData.profilePic || '',
          });
        }
        setIsLoadingProfilePage(false);
        console.log('Form Data after set:', formData); // Debug log

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, multiple } = e.target as HTMLSelectElement;
    const selectedOptions = multiple ? (e.target as HTMLSelectElement).selectedOptions : undefined;
  
    if (e.target instanceof HTMLSelectElement && multiple) {
      // If the field is a multi-select, capture the selected options as an array
      const selectedValues = selectedOptions ? Array.from(selectedOptions, (option) => option.value) : [];
      setFormData((prevData) => ({
        ...prevData,
        [name]: selectedValues, // Store the selected values as an array
      }));
    } else {
      // For regular inputs (non-multi-selects), store the single value
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  // Handle image upload
  const handleUpload = async () => {
    console.log('Uploading image...'); // Debug log
    if (!image) return;

    const formData = new FormData();
    formData.append('profilePic', image);
    const token = localStorage.getItem('token');
    if (token) {
      const res = await fetch(`${REACT_APP_API_URL}/api/users/save-emoji-pfp`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Upload error:", data.error || "Unknown error");
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          { id: Date.now(), alertText: data.error || "Failed to save image", alertSeverity: "error", visible: true },
        ]);
        // alert(`Error: ${data.error || "Failed to upload image"}`);
        return;
      }
      if (res.ok) setImageUrl(data.profilePic);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // handleUpload();
    setImageUrl(imagePreview)

    // Convert age to a number if provided
    const dataToSend = {
      ...formData,
      age: formData.age ? parseInt(formData.age) : undefined,
      relevant_courses: formData.relevant_courses
        ? Array.isArray(formData.relevant_courses)
          ? formData.relevant_courses // If it's already an array, use it
          : [formData.relevant_courses] // If it's a single string, make it an array
        : [], // If no courses are provided, use an empty array
      studyHabitTags: formData.studyHabitTags ? formData.studyHabitTags : [],


    };

    try {
      const token = localStorage.getItem('token'); // Assuming JWT token is stored in localStorage

      if (!token) {
        setAlerts((prevAlerts) => [
          ...prevAlerts,
          { id: Date.now(), alertText: 'You must be logged in to update your profile.', alertSeverity: 'error', visible: true },
        ]);
        return;
      }

      const response = await fetch(`${REACT_APP_API_URL}/api/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Attach JWT token to the request
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setAlerts((prevAlerts) => [
        ...prevAlerts,
        { id: Date.now(), alertText: 'Profile updated successfully', alertSeverity: 'success', visible: true },
      ]);

    } catch (error) {
      console.error(error);
      // alert('Error updating profile');
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        { id: Date.now(), alertText: 'Error updating profile', alertSeverity: 'error', visible: true },
      ]);
    }
  };

  const [image, setImage] = useState<File | null>(null);

  // Handle emoji selection for profile picture
  const handleEmojiSelect = (emoji: string, URL:string) => {
    setSelectedEmoji(emoji);
    setImagePreview(URL)
    setFormData((prevData) => ({
      ...prevData,
      profilePic: URL, // Update profilePic with the URL from the upload
    }));
    setSelectedEmojiURL(URL)
    setIsModalOpen(false); // Close modal after selection
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {

    setIsModalOpen(true)
  }


  // Handle multi-select changes
  const handleSelectChange = (selectedOptions: any) => {
    setFormData((prevData) => ({
      ...prevData,
      studyHabitTags: selectedOptions ? selectedOptions.map((option: any) => option.value) : [],
    }));
  };

  const handleMatchSelectChange = (selectedOption: { value: string; label: string }) => {
    setFormData((prevData) => ({
      ...prevData,
      ideal_match_factor: selectedOption ? selectedOption.value : '',
    }));
  };


  const alertVisible = alerts.some(alert => alert.visible);

  return (
    <div className="profile-page">
      <header>
        <Navbar />
      </header>
      {alertVisible && (
        <div className='alert-container'>
          {alerts.map(alert => (
            <CustomAlert
              key={alert.id}
              text={alert.alertText || ''}
              severity={alert.alertSeverity || 'info' as "error" | "warning" | "info" | "success"}
              onClose={() => setAlerts(prevAlerts => prevAlerts.filter(a => a.id !== alert.id))}
            />
          ))}
        </div>
      )}
      {isLoadingProfilePage ? (
        <div className='main-loading-container'>
          Loading... <span className="loading-spinner"></span>
        </div>
      ) : (
      <div className='main-container'>

        <header className="profile-page-header">
          <h1 className="profile-page-title">Update Profile</h1>
        </header>
        <main className="profile-page-content">
          <form className='profile-page-form' onSubmit={handleSubmit} onReset={() => window.location.reload()}>
            <div className="profile-page-details">
              <div className="profile-page-side">
                <label>
                  Age: <input type="number" name="age" value={formData.age} onChange={handleChange} min={0} max={100}/>
                </label>
                <div className="college-select">
              <label>College: <br />
              <Select
                    name="college-select"
                    components={animatedComponents}
                    options={isLoading ? [] : colleges.map(college => ({ label: college.label, value: college.label }))}
                    value={formData.college ? { label: formData.college, value: formData.college } : null}
                    onChange={(selectedOption) => {
                      setFormData((prevData) => ({
                        ...prevData,
                        college: selectedOption && !Array.isArray(selectedOption) && 'label' in selectedOption ? selectedOption.label : '',
                      }));
                    }}
                    isClearable
                    isSearchable
                    placeholder="Type or select colleges..."
                    className="basic-multi-select"
                    classNamePrefix="select"
                noOptionsMessage={() => "Type to add a new college"}
            
              />
              </label>
            </div>
                <label>
                  Major: <input type="text" name="major" value={formData.major} onChange={handleChange} />
                </label>
                <label>
                  Grade:<br />
                  <select name="grade" value={formData.grade} onChange={handleChange}>
                    <option value="">Select Grade</option>
                    {enumOptions.grade.map((option) => (
                      <option key={option} value={option}>
                        {formatEnum(option)}
                      </option>
                    ))}
                  </select>
                    </label>
                    <div className="course-select">
                      <label className="block text-sm font-medium mb-1">
                        Relevant Course(s) (e.g., BIO 101, CSCE 145)
                      </label>
                      <CreatableSelect
                        isMulti
                        options={
                          courseOptions && courseOptions.length > 0
                            ? courseOptions.map((course) => ({
                                label: course,
                                value: course,
                              }))
                            : []
                        }
                        value={formData.relevant_courses.map((course) => ({
                          label: course,
                          value: course,
                        }))}
                        onChange={(selected: MultiValue<OptionType>) => {
                          const selectedValues = selected.map((option) => option.value); // Still readonly

                          setFormData((prevData) => ({
                            ...prevData,
                            relevant_courses: [...selectedValues], // Convert to mutable array
                          }));
                        }}
                        onCreateOption={(input) => {
                          const normalized = normalizeCourseInput(input);

                          // Prevent duplicates
                          if (!options.includes(normalized)) {
                            setOptions((prev) => [...prev, normalized]);
                          }

                          setFormData((prevData) => ({
                            ...prevData,
                            relevant_courses: [...prevData.relevant_courses, normalized],
                          }));
                        }}
                        placeholder="Start typing a course..."
                        formatCreateLabel={(inputValue) =>
                          `Add "${normalizeCourseInput(inputValue)}"`
                        }
                      />
                      </div>
                      {/* <label>
                        Relevant Course:
                        <input
                          type="text"
                          maxLength={10}
                          name="relevant_courses"
                          value={formData.relevant_courses.join(', ')} // Convert array to string for display
                          onChange={(e) => {
                          const coursesArray = e.target.value
                            .split(',')
                            .map((course) => {
                              const trimmed = course.trim().toUpperCase();
                              // Add space between letters and numbers
                              const formatted = trimmed.replace(/^([A-Z]+)\s*([0-9]+[A-Z]*)$/, '$1 $2');
                          return formatted;
                        });
                      // setFormData((prevData) => ({
                      //   ...prevData,
                      //   relevant_courses: coursesArray,
                      // }));
                    }}
                  />
                </label> */}
                <label>
                  Fav Study Method: <input type="text" name="study_method" value={formData.study_method} onChange={handleChange} />
                </label>
                <label>
                  Gender:<br />
                  <select name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">Select Gender</option>
                    {enumOptions.gender.map((option) => (
                      <option key={option} value={option}>
                        {formatEnum(option)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="profile-page-side">
                <div className="profile-page-picture">

                  <div className="profile-page-picture">
                    {/* If an image is selected, display it; otherwise, show the button */}
                    {imagePreview ? (
                      <img
                      className='upload-button'
                        src={imagePreview}  // Display the preview returned by the backend
                        alt="Selected Profile"
                        onClick={() => setIsModalOpen(true)} // Allow re-selecting an image
                      />
                    ) : (
                      <div>
                      <img
                      className='upload-button'
                        src={formData?.profilePic || 'https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-page-pictures/circle_bust-in-silhouette.png'}
                        alt="Profile"
                        width="100"
                        height={100}
                        onClick={() => setIsModalOpen(true)}

                      />
                      </div>
                    )}

                    {/* Hidden file input */}
                    <input
                      id="emoji-upload"
                      type="button"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                    />
                    <ProfilePictureModal
                      isOpen={isModalOpen}
                      onRequestClose={() => setIsModalOpen(false)}
                      onSelect={handleEmojiSelect}
                    />
                    {/* <button onClick={handleUpload}>Upload</button> */}

                  </div>
                  {/* <div className="emoji-selector">
                    <button type="button" onClick={() => setIsModalOpen(true)}>
                      {selectedEmoji ? (
                        <span style={{ fontSize: '2rem' }}>{selectedEmoji}</span>
                      ) : (
                        'Choose Emoji'
                      )}
                    </button>
                    {selectedEmoji && <input type="hidden" name="profilePic" value={selectedEmoji} />}
                  </div> */}



                </div>
                <div className="update-profile-page-name">
                  <label>
                    First Name <input type="text" name="first_name"  maxLength={25} value={formData.first_name} onChange={handleChange} />
                  </label>
                  <label>
                    Last Name <input type="text" name="last_name" maxLength={25} value={formData.last_name} onChange={handleChange} />
                  </label>
                </div>
                
                <label>
                  Bio:<br /><textarea name="bio" maxLength={250} value={formData.bio} onChange={handleChange} />
                </label>
                <label>
                  Study Habit Tags:<br />
                  <Select
                    isMulti
                    name="studyHabitTags"
                    options={enumOptions.studyHabitTags.map((tag) => ({
                      value: tag,
                      label: formatEnum(tag), // Assuming formatEnum formats the tag as a readable label
                    }))}
                    value={formData.studyHabitTags.map((tag) => ({
                      value: tag,
                      label: formatEnum(tag),
                    }))}
                    onChange={handleSelectChange}
                    closeMenuOnSelect={false}
                    components={animatedComponents}
                    className="basic-multi-select"
                    classNamePrefix="select"
                  />
                </label>
                <label>
                  Ideal Match Factor:<br />
                  <Select
                    name="ideal_match_factor"
                    options={enumOptions.studyHabitTags.map((tag) => ({
                      value: tag,
                      label: formatEnum(tag), // Formats the tag into a readable label
                    }))}
                    value={
                      formData.ideal_match_factor
                        ? { value: formData.ideal_match_factor, label: formatEnum(formData.ideal_match_factor) }
                        : null
                    }
                    onChange={(newValue) => {
                      // Type assertion for SingleValue
                      const selectedOption = newValue as { value: string; label: string } | null;
                      setFormData((prevData) => ({
                        ...prevData,
                        ideal_match_factor: selectedOption ? selectedOption.value : '', // Store only the value, not the object
                      }));
                    }}
                    closeMenuOnSelect={true} // Close menu on select since it's single-select
                    components={animatedComponents}
                    className="basic-single-select"
                    classNamePrefix="select"
                    isMulti={false}
                  />
                </label>

                <div className="profile-page-buttons">
                  <button type="reset" className="back-button">CANCEL</button>
                  <button type="submit" className="save-button">SAVE</button>
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
    )}
      <footer>
        <CopyrightFooter />
      </footer>
    </div>
  );
};

export default Profile;

