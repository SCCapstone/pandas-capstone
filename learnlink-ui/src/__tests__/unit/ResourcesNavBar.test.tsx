import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import ResourcesNavBar from "../../components/ResourcesNavBar";

describe("ResourcesNavBar", () => {
  it("renders all navigation links", () => {
    render(
      <MemoryRouter initialEntries={["/resources/studyTips"]}>
        <ResourcesNavBar />
      </MemoryRouter>
    );

    expect(screen.getByText("Study Tips")).toBeInTheDocument();
    expect(screen.getByText("External Resources")).toBeInTheDocument();
    expect(screen.getByText("Grade Calculator")).toBeInTheDocument();
  });

  it("applies the active class to the current route", () => {
    render(
      <MemoryRouter initialEntries={["/resources/gradeCalculator"]}>
        <ResourcesNavBar />
      </MemoryRouter>
    );

    const gradeCalculatorLink = screen.getByText("Grade Calculator");
    expect(gradeCalculatorLink).toHaveClass("active");
  });

  it("does not apply the active class to non-active links", () => {
    render(
      <MemoryRouter initialEntries={["/resources/studyTips"]}>
        <ResourcesNavBar />
      </MemoryRouter>
    );

    const externalResourcesLink = screen.getByText("External Resources");
    expect(externalResourcesLink).not.toHaveClass("active");
  });
});
