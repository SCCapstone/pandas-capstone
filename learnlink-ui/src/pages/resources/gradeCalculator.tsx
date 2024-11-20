import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import ResourcesNavBar from '../../components/ResourcesNavBar';
import './resources.css';
import './gradeCalculator.css';
import CopyrightFooter from '../../components/CopyrightFooter';

const GradeCalculator: React.FC = () => {
  // State for categories and assignments
  const [categories, setCategories] = useState([{ name: '', weight: '' }]);
  const [assignments, setAssignments] = useState([{ name: '', category: '', grade: '' }]);
  const [finalGrade, setFinalGrade] = useState<number | null>(null);

  // Handler to add a new category row
  const addCategory = () => {
    setCategories([...categories, { name: '', weight: '' }]);
  };

  // Handler to add a new assignment row
  const addAssignment = () => {
    setAssignments([...assignments, { name: '', category: '', grade: '' }]);
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
  
    assignments.forEach((assignment) => {
      // Find the corresponding category
      const category = categories.find(cat => cat.name === assignment.category);
      const weight = category ? parseFloat(category.weight) : 0; // Get the weight
      const grade = parseFloat(assignment.grade) || 0;
  
      weightedSum += weight * (grade / 100);
      totalWeight += weight;
    });
  
    // Calculate the final grade as a percentage
    const calculatedGrade = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;
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
          <h1>Grade Calculator</h1>
          <p>Calculate your grade based on the weights of each assignment.</p>
          <div className="final-calculation">
            <button onClick={calculateFinalGrade}>Calculate</button>
            {finalGrade !== null && (
              <div>
                <h3>Your Final Grade: {finalGrade.toFixed(2)}%</h3>
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
                        value={category.weight}
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
                      <input
                        type="text"
                        placeholder="Category"
                        value={assignment.category}
                        onChange={(e) => handleAssignmentChange(index, 'category', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Grade"
                        value={assignment.grade}
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
