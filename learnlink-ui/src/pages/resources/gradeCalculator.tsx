import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import ResourcesNavBar from '../../components/ResourcesNavBar';
import './resources.css';
import './gradeCalculator.css';
import CopyrightFooter from '../../components/CopyrightFooter';
import CustomAlert from '../../components/CustomAlert';
import { FaXmark } from 'react-icons/fa6';

const GradeCalculator: React.FC = () => {
  // State for categories and assignments
  const [categories, setCategories] = useState([{ name: '', weight: undefined as number | undefined }]);
  const [assignments, setAssignments] = useState([{ name: '', category: '', grade: undefined as number | undefined }]);
  const [finalGrade, setFinalGrade] = useState<number | string | null>(null);
  const [alerts, setAlerts] = useState<{ id: number; alertText: string; alertSeverity: "error" | "warning" | "info" | "success"; visible: boolean }[]>([]);
  const alertVisible = alerts.some(alert => alert.visible);

  // Helper func for alerts
  const createAlert = (text: string, severity: "error" | "warning" | "info" | "success" = "error") => {
    setAlerts((prevAlerts) => [
      ...prevAlerts,
      {
        id: Date.now(),
        alertText: text,
        alertSeverity: severity,
        visible: true,
      },
    ]);
  };

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

  const getCategoryAverage = (categoryName: string): number | null => {
    const categoryAssignments = assignments.filter(
      (assignment) => assignment.category === categoryName && assignment.grade !== undefined
    );
  
    if (categoryAssignments.length === 0) return null;
  
    const average =
      categoryAssignments.reduce((sum, a) => sum + Number(a.grade), 0) / categoryAssignments.length;
  
    return average;
  };
  

  // Function to calculate the final grade
  const calculateFinalGrade = () => {
    let valid = true;
    const filteredCategories = categories.filter((category) => {
      const hasName = category.name.trim() !== '';
      const hasWeight = category.weight !== undefined && category.weight !== null && Number(category.weight) !== 0;
      return hasName || hasWeight;
    });

    if (filteredCategories.length == 0) {
      createAlert(`Must have at least one category.`);
    }
    for (const category of filteredCategories) {
      if (!category.name && ( category.weight === undefined || category.weight === null || category.weight == 0)) {
        createAlert(`All categories must have a name and a weight.`);
        valid = false;
        continue;
      }
      if (!category.name) {
        createAlert(`All categories must have a name.`);
        valid = false;
        continue;
      }
      if (category.weight === undefined || category.weight === null || category.weight == 0) {
        createAlert(`All categories must have weight.`);
        valid = false;
        continue;
      }
      if (isNaN(Number(category.weight))) {
        createAlert(`Weight for category "${category.name}" must be a number.`);
        valid = false;
      } else if (Number(category.weight) < 0) {
        createAlert(`Weight for category "${category.name}" cannot be negative.`);
        valid = false;
      }
    }
    const filteredAssignments = assignments.filter((assignment) => {
      const hasName = assignment.name.trim() !== '';
      const hasGrade = assignment.grade !== undefined && assignment.grade !== null && Number(assignment.grade) !== 0;
      const hasCategory = assignment.category.trim() !== '';
      return hasName || hasGrade || hasCategory;
    });

    if (filteredAssignments.length == 0) {
      createAlert(`Must have at least one assignment.`);
    }
  
    // Check for invalid grades
    for (const assignment of filteredAssignments) {
      if (!assignment.name) {
        createAlert(`All assignments must have a name.`);
        valid = false;
        continue;
      }
      if (!assignment.category) {
        createAlert(`Category for assignment "${assignment.name}" is missing.`);
        valid = false;
        continue;
      }
      if (assignment.grade === undefined || assignment.grade === null) {
        createAlert(`Grade for assignment "${assignment.name}" is missing or invalid.`);
        valid = false;
      } else if (isNaN(Number(assignment.grade))) {
        createAlert(`Grade for assignment "${assignment.name}" must be a number.`);
        valid = false;
      } else if (Number(assignment.grade) < 0) {
        createAlert(`Grade for assignment "${assignment.name}" cannot be negative.`);
        valid = false;
      }
    }
  
    if (!valid) {
      setFinalGrade("null");
      return;
    }
  
    // Proceed with calculation if inputs are valid
    let totalWeight = 0;
    let weightedSum = 0;
  
    filteredCategories.forEach((category) => {
      if (category.weight !== undefined) {
        totalWeight += Number(category.weight);
        console.log(Number(category.weight))
  
        const categoryAssignments = filteredAssignments.filter(
          (assignment) => assignment.category === category.name && assignment.grade !== undefined
        );
  
        if (categoryAssignments.length > 0) {
          const averageGrade = categoryAssignments.reduce((sum, assignment) => {
            return sum + Number(assignment.grade);
          }, 0) / categoryAssignments.length;
  
          weightedSum += (averageGrade / 100) * Number(category.weight);
        }
      }
    });
  
    const calculatedGrade = (totalWeight > 0 || weightedSum > 0) ? (weightedSum / totalWeight) * 100 : "null";
    setFinalGrade(calculatedGrade);
  };

  const removeCategory = (index: number) => {
    if(categories.length - 1 <= 0) {
      createAlert(`Cannot remove. Must have at least one category`,"warning");
      return;

    }
    setCategories(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeAssignment = (index: number) => {
    if(assignments.length - 1 <= 0) {
      createAlert(`Cannot remove. Must have at least one assignment`,"warning");
      return;

    }
    setAssignments(prev => prev.filter((_, i) => i !== index));
  };
  
  

  return (
    <div className="resources-page">
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
                  <th className='gc-avg-header'>Average</th>
                  <th className='gc-remove-header'></th>

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
                        type="number"
                        placeholder="Weight"
                        value={category.weight !== null ? category.weight : ''}
                        onChange={(e) => handleCategoryChange(index, 'weight', e.target.value)}
                      /> %
                    </td>
                    <td className='average'>
                      {category.name.trim() !== '' ? (
                        getCategoryAverage(category.name) !== null
                          ? `${getCategoryAverage(category.name)?.toFixed(2)}%`
                          : '—'
                      ) : '—'}
                    </td>
                    <td className='remove'>
                      <button className="grade-calc-remove-button" onClick={() => removeCategory(index)}><FaXmark /></button>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>

              <button data-testid="add-category-button" onClick={addCategory}>Add Category</button>
            </div>
            <div className="table-region">
              <h2>Assignments</h2>
              <table>
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Category</th>
                    <th className='gc-avg-header'>Grade</th>
                  <th className='gc-remove-header'></th>
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
                      <td className='average'>
                        <input
                          type="number"
                          placeholder="Grade"
                          value={assignment.grade !== null ? assignment.grade : ''}
                          onChange={(e) => handleAssignmentChange(index, 'grade', e.target.value)}
                        />
                      </td>
                      <td className='remove'>
                      <button className="grade-calc-remove-button" onClick={() => removeAssignment(index)}><FaXmark /></button>
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
