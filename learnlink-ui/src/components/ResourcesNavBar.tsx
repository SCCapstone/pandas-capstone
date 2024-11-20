import React from 'react';
import { NavLink } from 'react-router-dom'; // Use NavLink for React Router
import './components.css';

const ResourcesNavBar: React.FC = () => {
  return (
    <div id="mySidenav" className="sidenav">
      <NavLink
        to="/resources/studyTips" // Use a real path here
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        Study Tips
      </NavLink>

      <NavLink
        to="/resources/externalResources" // Use a real path here
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        External Resources
      </NavLink>

      <NavLink
        to="/resources/gradeCalculator" // Use a real path here
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        Grade Calculator
      </NavLink>
    </div>
  );
};

export default ResourcesNavBar;
