const fs = require('fs');
const fetch = require('node-fetch');
require('dotenv').config();

console.log("API Key from pre-build script:", process.env.REACT_APP_API_KEY_DEPT_EDU);


const REACT_APP_API_KEY_DEPT_EDU = process.env.REACT_APP_API_KEY_DEPT_EDU;

const fetchCollegesData = async () => {

  let allColleges = [];
  let page = 0;
  const perPage = 100; // Number of results per page

  while (true) {
    try {
      const response = await fetch(
        `https://api.data.gov/ed/collegescorecard/v1/schools?api_key=${REACT_APP_API_KEY_DEPT_EDU}&fields=id,school.name&per_page=${perPage}&page=${page}`
      );
      const data = await response.json();
      //console.log("API Response:", data);

      if (data && data.results && data.results.length > 0) {
        // Collect colleges from the current page
        const collegesList = data.results
          .filter((college) => college["school.name"])
          .map((college) => ({
            label: college["school.name"],
            value: college.id,
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

  if (allColleges.length === 0) {
    console.error("No colleges found in the response");
    return;
  }

  // Save the data to a file in the 'public' directory
  fs.writeFileSync('./public/colleges.json', JSON.stringify(allColleges, null, 2));
  console.log("Colleges data has been written to colleges.json");
};

// Execute the function
fetchCollegesData();
