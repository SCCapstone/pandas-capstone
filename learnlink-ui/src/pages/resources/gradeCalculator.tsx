import React from 'react';
import Navbar from '../../components/Navbar';
import ResourcesNavBar from '../../components/ResourcesNavBar';
import './resources.css';
import './gradeCalculator.css';
import CopyrightFooter from '../../components/CopyrightFooter';

const GradeCalculator: React.FC = () => {
  return (
    <div className="resources-page">
      <header>
        <Navbar />
      </header>
      <div className='resources-content'>
        <ResourcesNavBar />
        <main className="main-content">
          {/* main-content is already set up to handle being 
          within the sidebar-header-footer space*/}

          <h1>Grade Calculator</h1>
          <p>Calculate your grade based on the weights of each assignment.</p>
          <div className="grade-calculator">
            <table>
              <tr>
                <th>Category</th>
                <th>Weight</th>
              </tr>
              <tr>
                <td><input type="text" placeholder="Category Name" /></td>
                <td><input type="text" placeholder="Weight" /> %</td>
              </tr>
              <tr>
                <td><input type="text" placeholder="Category Name" /></td>
                <td><input type="text" placeholder="Weight" /> %</td>
              </tr>
              <tr>
                <td><input type="text" placeholder="Category Name" /></td>
                <td><input type="text" placeholder="Weight" /> %</td>
              </tr>
            </table>
            <table>
              <tr>
                <th>Assignment</th>
                <th>Weight</th>
                <th>Grade</th>
              </tr>
              <tr>
              <td><input type="text" placeholder="Assignment Name" /></td>
              <td><input type="text" placeholder="Percentage" /> %</td>
              <td><input type="text" placeholder="Grade" /></td>
              </tr>
              <tr>
                <td><input type="text" placeholder="Assignment Name" /></td>
                <td><input type="text" placeholder="Percentage" /> %</td>
                <td><input type="text" placeholder="Grade" /></td>
              </tr>
              <tr>
                <td><input type="text" placeholder="Assignment Name" /></td>
                <td><input type="text" placeholder="Percentage" /> %</td>
                <td><input type="text" placeholder="Grade" /></td>
              </tr>
            </table>
          </div>
          <div className='final-calculation'>
            <h2>Final Grade:</h2>
            <button>Calculate</button>
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


