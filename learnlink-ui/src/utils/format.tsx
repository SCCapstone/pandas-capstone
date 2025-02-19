import e from 'express';
import { useState } from 'react';
import { useEffect } from 'react';
const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:2000';
const REACT_APP_API_KEY_DEPT_EDU = process.env.REACT_APP_API_KEY_DEPT_EDU;
// ADD TO AMPLIFY

export const formatEnum = (value: string): string => {
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
          console.error("No colleges data available.");
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