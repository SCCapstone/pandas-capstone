import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import ResourcesNavBar from '../../components/ResourcesNavBar';
import './resources.css';
import './gradeCalculator.css';
import CopyrightFooter from '../../components/CopyrightFooter';

const GradeCalculator: React.FC = () => {
  // State for categories and assignments
  const [categories, setCategories] = useState([{ name: '', weight: undefined as number | undefined }]);
  const [assignments, setAssignments] = useState([{ name: '', category: '', grade: undefined as number | undefined }]);
  const [finalGrade, setFinalGrade] = useState<number | string | null>(null);

  // Handler to add a new category row
  const addCategory = () => {
    setCategories([...categories, { name: '', weight: undefined }]);
  };

  // Handler to add a new assignment row
  const addAssignment = () => {
    setAssignments([...assignments, { name: '', category: '', grade: undefined }]);
  };

  // Handler to update category values
  const handleCategoryChange = (index: number, field: string, value: string) => {
    const updatedCategories = categories.map((category, i) =>
      i === index ? { ...category, [field]: value } : category
    );
    setCategories(updatedCategories);
  };

  // Handler to update assignment values
  const handleAssignmentChange = (index: number, field: string, value: string) => {
    const updatedAssignments = assignments.map((assignment, i) =>
      i === index ? { ...assignment, [field]: value } : assignment
    );
    setAssignments(updatedAssignments);
  };

  // Function to calculate the final grade
  const calculateFinalGrade = () => {
    let totalWeight = 0;
    let weightedSum = 0;

    categories.forEach((category) => {
      if (category.weight !== undefined) {
        totalWeight += Number(category.weight); // Add category weight to total weight
  
        // Filter assignments for the current category
        const categoryAssignments = assignments.filter(
          (assignment) => assignment.category === category.name && assignment.grade !== undefined
        );
  
        if (categoryAssignments.length > 0) {
          // Calculate the average grade for the category
          const averageGrade = categoryAssignments.reduce((sum, assignment) => {
            return sum + Number(assignment.grade);
          }, 0) / categoryAssignments.length;
  
          // Add the weighted grade for the category
          weightedSum += (averageGrade / 100) * Number(category.weight);
        }
      }
    });
  
    // Calculate the final grade as a percentage
    const calculatedGrade = (totalWeight > 0 || weightedSum > 0) ? (weightedSum / totalWeight) * 100 : "null";
    setFinalGrade(calculatedGrade);
  };

  return (
    <div className="resources-page">
      <header>
        <Navbar />
      </header>
      <div className="resources-content">
        <ResourcesNavBar />
        <main className="main-content">
          <h1 id="title">Grade Calculator</h1>
          <p>Calculate your grade based on the weights of each assignment.</p>
          <div className="final-calculation">
            <button onClick={calculateFinalGrade}>Calculate</button>
            {finalGrade !== null && typeof finalGrade !== 'string' &&(
              <div>
                <h3>Your Final Grade: {finalGrade.toFixed(2)}%</h3>
              </div>
            )}
            {typeof finalGrade === 'string' && (
              <div>
                <h3>Please ensure all weights and grades<br></br>have been entered.</h3>
              </div>
              )}
          </div>
          <div className="grade-calculator">
            <div className="table-region">
            <h2>Categories</h2>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Weight</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        placeholder="Category Name"
                        value={category.name}
                        onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Weight"
                        value={category.weight !== null ? category.weight : ''}
                        onChange={(e) => handleCategoryChange(index, 'weight', e.target.value)}
                      /> %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={addCategory}>Add Category</button>
            </div>
            <div className="table-region">
            <h2>Assignments</h2>
            <table>
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Category</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        placeholder="Assignment Name"
                        value={assignment.name}
                        onChange={(e) => handleAssignmentChange(index, 'name', e.target.value)}
                      />
                    </td>
                    <td>
                    <select
                          value={assignment.category}
                          onChange={(e) => handleAssignmentChange(index, 'category', e.target.value)}
                        >
                          <option value="">Select Category</option>
                          {categories.map((category, idx) => (
                            <option key={idx} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Grade"
                        value={assignment.grade !== null ? assignment.grade : ''}
                        onChange={(e) => handleAssignmentChange(index, 'grade', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={addAssignment}>Add Assignment</button>
            </div>
          </div>
        </main>
      </div>
      <footer>
        <CopyrightFooter />
      </footer>
    </div>
  );
};

export default GradeCalculator;
