import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { formatEnum } from '../utils/format';
import './profile.css';
import CopyrightFooter from '../components/CopyrightFooter';
import makeAnimated from 'react-select/animated';
import Select from 'react-select';

const animatedComponents = makeAnimated();

const Profile: React.FC = () => {
  const REACT_APP_API_URL = process.env.REACT_APP_API_URL;


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
  });


  // State to store enum options
  const [enumOptions, setEnumOptions] = useState({ grade: [], gender: [], studyHabitTags: [] });

  // Fetch enum values on component mount
  useEffect(() => {
    const fetchData = async () => {

      try {
        // Fetch enum options
        const enumsResponse = await fetch(`${REACT_APP_API_URL}/api/enums`);
        const enumsData = await enumsResponse.json();
        setEnumOptions({
          grade: enumsData.grade,
          gender: enumsData.gender,
          studyHabitTags: enumsData.studyHabitTags,
        });

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
          });
        }
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
  
  // const handleSelectChange = (newValue: MultiValue<{ value: string; label: string }>, actionMeta: ActionMeta<{ value: string; label: string }>) => {
  //   // Update the formData state with the selected values
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     studyHabitTags: newValue ? newValue.map((option) => option.value) : [],
  //   }));
  // };

  // // Handle Select component changes
  // const handleSelectChange = (newValue: any, actionMeta: any) => {
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     studyHabitTags: newValue ? newValue.map((option: any) => option.value) : [],
  //   }));
  // };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert age to a number if provided
    const dataToSend = {
      ...formData,
      age: formData.age ? parseInt(formData.age) : undefined,
      relevant_courses: formData.relevant_courses ?
        (Array.isArray(formData.relevant_courses) ? formData.relevant_courses : [formData.relevant_courses]) : [],
      studyHabitTags: formData.studyHabitTags ? formData.studyHabitTags : [],
      

    };

    try {
      const token = localStorage.getItem('token'); // Assuming JWT token is stored in localStorage

      if (!token) {
        alert('You must be logged in to update your profile.');
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

      const updatedUser = await response.json();
      console.log(updatedUser); // Handle the updated user response if needed

      alert('Profile updated successfully');
    } catch (error) {
      console.error(error);
      alert('Error updating profile');
    }
  };

  const [image, setImage] = useState<File | null>(null);

  // Function to handle file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setImage(file); // Store the selected file
    }
  };

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


  return (
    <div className="profile-page">
      <header>
        <Navbar />
      </header>
      <div className='main-container'>
        <header className="profile-header">
          <h1 className="profile-title">Update Profile</h1>
        </header>
        <main className="profile-content">
          <form className='profile-form' onSubmit={handleSubmit}>
            <div className="profile-details">
              <div className="profile-side">
                <label>
                  Age: <input type="number" name="age" value={formData.age} onChange={handleChange} />
                </label>
                <label>
                  College: <input type="text" name="college" value={formData.college} onChange={handleChange} />
                </label>
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
                <label>
                  Relevant Course: <input type="text" name="relevant_courses" value={formData.relevant_courses} onChange={handleChange} />
                </label>
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

              <div className="profile-side">
                <div className="profile-picture">

                  <div className="profile-picture">
                    {/* If an image is selected, display it; otherwise, show the button */}
                    {image ? (
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Selected Profile"
                        onClick={() => document.getElementById("image-upload")?.click()} // Allow re-selecting an image
                        style={{ width: "200px", height: "200px", objectFit: "cover", cursor: "pointer" }}
                      />
                    ) : (
                      <button
                        className="upload-button"
                        onClick={() => document.getElementById("image-upload")?.click()}
                      >
                        CLICK TO ADD PICTURE
                      </button>
                    )}

                    {/* Hidden file input */}
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </div>


                </div>
                <div className="update-profile-name">
                  <label>
                    First Name <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} />
                  </label>
                  <label>
                    Last Name <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} />
                  </label>
                </div>
                
                <label>
                  Bio:<br /><textarea name="bio" value={formData.bio} onChange={handleChange} />
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
                        ideal_match_factor: selectedOption?.value || '', // Save the single selected value
                      }));
                    }}
                    closeMenuOnSelect={true} // Close menu on select since it's single-select
                    components={animatedComponents}
                    className="basic-single-select"
                    classNamePrefix="select"
                    isMulti={false}
                  />
                </label>

                <div className="profile-buttons">
                  <button type="button" className="back-button">BACK</button>
                  <button type="submit" className="save-button">SAVE</button>
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
      <footer>
        <CopyrightFooter />
      </footer>
    </div>
  );
};

export default Profile;

