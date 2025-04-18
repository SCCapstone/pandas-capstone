import e from 'express';
import { useState } from 'react';
import { StylesConfig, ControlProps, CSSObjectWithLabel } from 'react-select';
import { useEffect } from 'react';
const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';
const REACT_APP_API_KEY_DEPT_EDU = process.env.REACT_APP_API_KEY_DEPT_EDU;
// ADD TO AMPLIFY

export const formatEnum = (value: string): string => {
  if (!value || typeof value !== 'string') return String(value ?? '');
  
    return value
        .toLowerCase() // Convert all characters to lowercase
        .replace(/_/g, ' ') // Replace underscores with spaces
        .replace(/\b\w/g, (char: string) => char.toUpperCase()); // Capitalize the first letter of each word
};

// export const getEnums = async (): Promise<{ grade: string[], gender: string[], studyHabitTags: string[] }> => {
//     const [enumOptions, setEnumOptions] = useState({ grade: [], gender: [], studyHabitTags: [] });
    
//     // Check if the input is an objectconst enumsResponse = await fetch(`${REACT_APP_API_URL}/api/enums`);
//     const enumsResponse = await fetch(`${REACT_APP_API_URL}/api/enums`);
//     const enumsData = await enumsResponse.json();
//     setEnumOptions({
//       grade: enumsData.grade,
//       gender: enumsData.gender,
//       studyHabitTags: enumsData.studyHabitTags,
//     });
//     return enumOptions;
//   };

export const useEnums = () => {
  const [enumOptions, setEnumOptions] = useState<{ grade: string[], gender: string[], studyHabitTags: string[] }>({
    grade: [],
    gender: [],
    studyHabitTags: [],
  });

  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const response = await fetch(`${REACT_APP_API_URL}/api/enums`);
        const data = await response.json();
        setEnumOptions({
          grade: data.grade,
          gender: data.gender,
          studyHabitTags: data.studyHabitTags,
        });
      } catch (error) {
        console.error('Error fetching enums:', error);
      }
    };

    fetchEnums();
  }, []);

  return enumOptions;
};

export const useColleges = () => {
  const [colleges, setColleges] = useState<{ label: string; value: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Fetch the preloaded colleges data from the public directory
    const fetchColleges = async () => {
      try {
        const response = await fetch('/colleges.json');
        const data = await response.json();

        if (data) {
          setColleges(data);
          setIsLoading(false);
        } else {
          console.error("No college data available.");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching colleges:", error);
        setIsLoading(false);
      }
    };

    fetchColleges();
  }, []);
  return { colleges, isLoading };
};

export const useCourses = () => {
  const [courses, setCourses] = useState<string[]>([]);
  const [isLoadingCourses, setIsLoading] = useState(true);
  useEffect(() => {
    // Fetch the preloaded colleges data from the public directory
    const fetchColleges = async () => {
      try {
        const courseOptionsResponse = await fetch(`${REACT_APP_API_URL}/api/users/courses`);
        const data = await courseOptionsResponse.json()

        if (data) {
          setCourses(data);
          setIsLoading(false);
        } else {
          console.error("No course data available.");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setIsLoading(false);
      }
    };

    fetchColleges();
  }, []);
  return { courses, isLoadingCourses };
};

export const useUserAgeRange = () => {
  const [userAgeRange, setUserAgeRange] = useState<{ maxAge: number, minAge: number } | null>(null);

  useEffect(() => {
    const fetchUserAgeRange = async () => {
      try {
        const response = await fetch(`${REACT_APP_API_URL}/api/users/ages`);
        const data = await response.json();
        setUserAgeRange(data); // Set the fetched data in the state
      } catch (error) {
        console.error('Error fetching user age range:', error);
      }
    };

    fetchUserAgeRange();
  }, []);

  // Ensure that the data is available before trying to access maxAge and minAge
  if (userAgeRange) {
    const { maxAge, minAge } = userAgeRange;
    return { maxAge, minAge };
  }

  // Return null or default values if data is not yet available
  return { maxAge: 0, minAge: 100 };
};
 interface SelectStyles extends StylesConfig<{ value: string; label: string }, false> {
    control: (base: CSSObjectWithLabel, props: ControlProps<{ value: string; label: string }, false>) => CSSObjectWithLabel;
    menu: (provided: CSSObjectWithLabel) => CSSObjectWithLabel;
  }

export const selectStyles: SelectStyles = {
  control: (styles, state) => ({
    ...styles,
    marginBottom: "20px !important", // Add margin below the select
    height: "40px", // Adjust height
    border: state.isFocused ? "2px solid #4A90E2" : ".7px solid #3B3C3D", // Border color when focused vs normal
    borderRadius: "5px", // Rounded corners
    boxShadow: state.isFocused ? "0 0 5px rgba(74, 144, 226, 0.5)" : "none", // Add shadow when focused
  }),
  valueContainer: (styles) => ({
  ...styles,
  padding: "0 8px", // Adjust padding inside the select
  height: "100%", // Ensure it fills the control height
  fontSize: "small", // Adjust font size
}),
input: (styles) => ({
  ...styles,
  margin: "0px", // Remove extra margins
  padding: "0px", // Adjust input padding
}),
singleValue: (styles) => ({
  ...styles,
  padding: "0px", // Remove padding around the selected value
}),
  menu: (provided) => ({
    ...provided,
    borderRadius: "0 !important", // Border radius for dropdown
    marginTop: "0 !important", // Border radius for dropdown
    fontSize: "small", // Adjust font size

  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: "150px", // limit dropdown height
    overflowY: "auto",  // scroll when too many options
  }),
};


export function normalizeCourseInput(input: string): string {
  const trimmed = input.trim().toUpperCase();
  const match = trimmed.match(/^([A-Z]+)\s*0*([0-9]+[A-Z]?)$/);

  if (!match) return trimmed;
  const [, letters, numbers] = match;
  return `${letters} ${numbers}`;
};