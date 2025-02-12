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
  const [colleges, setColleges] = useState<{ label: string, value: string }[]>([]);

  useEffect(() => {

    const fetchColleges = async () => {
      let allColleges: { label: string; value: string }[] = [];
      let page = 0;
      const perPage = 100; // Number of results per page
  
      while (true) {
        try {
          const response = await fetch(
            `https://api.data.gov/ed/collegescorecard/v1/schools?api_key=${REACT_APP_API_KEY_DEPT_EDU}&fields=id,school.name&per_page=${perPage}&page=${page}`
          );
          const data = await response.json();
          console.log("API Response:", data); // Log to inspect the data structure
  
          if (data && data.results && data.results.length > 0) {
            // Collect colleges from the current page
            const collegesList = data.results
              .filter((college: { "school.name": string; id: number }) => college["school.name"]) // Ensure school.name exists
              .map((college: { "school.name": string; id: number }) => ({
                label: college["school.name"], // Access school.name directly as key
                value: college.id, // Use college ID as value
              }));
  
            allColleges = [...allColleges, ...collegesList];
  
            // If fewer than `perPage` results, we've reached the last page
            if (data.results.length < perPage) {
              break;
            }
  
            // Otherwise, go to the next page
            page++;
          } else {
            console.error("No colleges found in the response:", data);
            break;
          }
        } catch (error) {
          console.error("Error fetching colleges:", error);
          break;
        }
      }
  
      // Set all colleges after paginating through all the pages
      setColleges(allColleges);
    };
  
    fetchColleges();
  }, []);

  return colleges;
}