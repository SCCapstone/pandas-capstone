import React, { useState } from "react";
import { NavLink } from "react-router-dom"; 
import "./components.css";

const ResourcesNavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div id="mySidenav" className={`sidenav ${isOpen ? "open" : ""}`}>
        <NavLink to="/resources/studyTips" className={({ isActive }) => (isActive ? "active" : "")}>
          Study Tips
        </NavLink>

        <NavLink to="/resources/externalResources" className={({ isActive }) => (isActive ? "active" : "")}>
          External Resources
        </NavLink>

        <NavLink to="/resources/gradeCalculator" className={({ isActive }) => (isActive ? "active" : "")}>
          Grade Calculator
        </NavLink>
      </div>
    </div>
  );
};

export default ResourcesNavBar;
