import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GradeCalculator from '../../pages/resources/gradeCalculator';

jest.mock('../../components/Navbar', () => () => <div data-testid="navbar" />);
jest.mock('../../components/ResourcesNavBar', () => () => <div data-testid="resources-navbar" />);
jest.mock('../../components/CopyrightFooter', () => () => <div data-testid="footer" />);

describe('GradeCalculator Page', () => {
  beforeEach(() => {
    render(<GradeCalculator />);
  });

  it('renders the main layout components', () => {
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('resources-navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Grade Calculator/i })).toBeInTheDocument();
  });

  it('allows user to add a category and assignment', () => {
    fireEvent.click(screen.getByText(/Add Category/i));
    fireEvent.click(screen.getByText(/Add Assignment/i));

    const categoryInputs = screen.getAllByPlaceholderText(/Category Name/i);
    const weightInputs = screen.getAllByPlaceholderText(/Weight/i);
    const assignmentInputs = screen.getAllByPlaceholderText(/Assignment Name/i);
    const gradeInputs = screen.getAllByPlaceholderText(/Grade/i);

    expect(categoryInputs.length).toBeGreaterThan(1);
    expect(weightInputs.length).toBeGreaterThan(1);
    expect(assignmentInputs.length).toBeGreaterThan(1);
    expect(gradeInputs.length).toBeGreaterThan(1);
  });

  it('calculates and displays the final grade', () => {
    // Fill in a category
    fireEvent.change(screen.getByPlaceholderText(/Category Name/i), {
      target: { value: 'Homework' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Weight/i), {
      target: { value: '50' },
    });

    // Fill in an assignment
    fireEvent.change(screen.getByPlaceholderText(/Assignment Name/i), {
      target: { value: 'HW1' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Grade/i), {
      target: { value: '90' },
    });

    // Select the category for the assignment
    fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'Homework' },
      });

    // Calculate final grade
    fireEvent.click(screen.getByRole('button', { name: /Calculate/i }));

    expect(screen.getByText(/Your Final Grade:/i)).toBeInTheDocument();
  });

  it('shows error if data is missing', () => {
    fireEvent.click(screen.getByRole('button', { name: /Calculate/i }));

    expect(screen.getByText(/Please ensure all weights and grades/i)).toBeInTheDocument();
  });

  test('updates category name and weight using handleCategoryChange', () => {
    render(<GradeCalculator />);
  
    const categoryNameInputs = screen.getAllByPlaceholderText('Category Name') as HTMLInputElement[];
    const categoryWeightInputs = screen.getAllByPlaceholderText('Weight') as HTMLInputElement[];
  
    fireEvent.change(categoryNameInputs[0], { target: { value: 'Homework' } });
    fireEvent.change(categoryWeightInputs[0], { target: { value: '40' } });
  
    expect(categoryNameInputs[0].value).toBe('Homework');
    expect(categoryWeightInputs[0].value).toBe('40');
  });

  test('updates assignment name, category, and grade using handleAssignmentChange', () => {
    render(<GradeCalculator />);
  
    const assignmentNameInputs = screen.getAllByPlaceholderText('Assignment Name') as HTMLInputElement[];
    const gradeInputs = screen.getAllByPlaceholderText('Grade') as HTMLInputElement[];
    const categorySelects = screen.getAllByRole('combobox') as HTMLSelectElement[];
  
    // First, make sure a category exists for the assignment to choose
    const categoryNameInputs = screen.getAllByPlaceholderText('Category Name') as HTMLInputElement[];
    fireEvent.change(categoryNameInputs[0], { target: { value: 'Homework' } });
  
    // Select 'Homework' for the assignment category
    fireEvent.change(categorySelects[0], { target: { value: 'Homework' } });
  
    // Change assignment name and grade
    fireEvent.change(assignmentNameInputs[0], { target: { value: 'HW1' } });
    fireEvent.change(gradeInputs[0], { target: { value: '95' } });
  
    expect(assignmentNameInputs[0].value).toBe('HW1');
    expect(categorySelects[0].value).toBe('Homework');
    expect(gradeInputs[0].value).toBe('95');
  });

  test('adds a new category when Add Category button is clicked', () => {
    
    const addCategoryButton = screen.getByTestId('add-category-button');
    fireEvent.click(addCategoryButton);
  
    const categoryInputs = screen.getAllByPlaceholderText('Category Name');
    expect(categoryInputs.length).toBeGreaterThan(1); // Ensures a new category row is added
  });

  test('adds a new assignment when Add Assignment button is clicked', () => {  
    const addAssignmentButton = screen.getByText('Add Assignment');
    fireEvent.click(addAssignmentButton);
  
    const assignmentInputs = screen.getAllByPlaceholderText('Assignment Name');
    expect(assignmentInputs.length).toBeGreaterThan(1); // Ensures a new assignment row is added
  });

  test('calculates and displays the final grade correctly', () => {
  
    // Fill in category name and weight
    const categoryInputs = screen.getAllByPlaceholderText('Category Name');
    const weightInputs = screen.getAllByPlaceholderText('Weight');
  
    fireEvent.change(categoryInputs[0], { target: { value: 'Homework' } });
    fireEvent.change(weightInputs[0], { target: { value: '100' } });
  
    // Fill in assignment details
    const assignmentNameInputs = screen.getAllByPlaceholderText('Assignment Name');
    const gradeInputs = screen.getAllByPlaceholderText('Grade');
    const categorySelects = screen.getAllByRole('combobox');
  
    fireEvent.change(assignmentNameInputs[0], { target: { value: 'HW1' } });
    fireEvent.change(categorySelects[0], { target: { value: 'Homework' } });
    fireEvent.change(gradeInputs[0], { target: { value: '90' } });
  
    // Click Calculate
    const calculateButton = screen.getByRole('button', { name: /Calculate/i });
    fireEvent.click(calculateButton);
  
    // Assert final grade
    expect(screen.getByText(/Your Final Grade: 90.00%/)).toBeInTheDocument();
  });

  test('displays validation message if weights or grades are missing', () => {
    const calculateButton = screen.getByRole('button', { name: /Calculate/i });
  
    fireEvent.click(calculateButton);
  
    expect(screen.getByText(/Please ensure all weights and grades/i)).toBeInTheDocument();
  });

  test('updates category name and weight when inputs are changed', () => {
    
    // Get the first category input fields
    const categoryNameInput = screen.getAllByPlaceholderText('Category Name')[0] as HTMLInputElement;
    const categoryWeightInput = screen.getAllByPlaceholderText('Weight')[0] as HTMLInputElement;
    
    // Change category name and weight
    fireEvent.change(categoryNameInput, { target: { value: 'Homework' } });
    fireEvent.change(categoryWeightInput, { target: { value: '40' } });
  
    // Check if the values are updated in the state
    expect(categoryNameInput.value).toBe('Homework');
    expect(categoryWeightInput.value).toBe('40');
  });

  test('calculates final grade correctly based on assignments and categories', () => {
    
    // Add a category
    const addCategoryButton = screen.getByTestId('add-category-button');
    fireEvent.click(addCategoryButton);
    
    const categoryNameInput = screen.getAllByPlaceholderText('Category Name')[1] as HTMLInputElement;
    const categoryWeightInput = screen.getAllByPlaceholderText('Weight')[1] as HTMLInputElement;
    
    // Set values for category
    fireEvent.change(categoryNameInput, { target: { value: 'Homework' } });
    fireEvent.change(categoryWeightInput, { target: { value: '40' } });
  
    // Add assignment
    const addAssignmentButton = screen.getByText('Add Assignment');
    fireEvent.click(addAssignmentButton);
  
    const assignmentNameInput = screen.getAllByPlaceholderText('Assignment Name')[0] as HTMLInputElement;
    const assignmentCategorySelect = screen.getAllByRole('combobox')[0] as HTMLSelectElement; // Querying the select element
    const assignmentGradeInput = screen.getAllByPlaceholderText('Grade')[0] as HTMLInputElement;
  
    // Set values for assignment
    fireEvent.change(assignmentNameInput, { target: { value: 'Math Homework 1' } });
    fireEvent.change(assignmentCategorySelect, { target: { value: 'Homework' } }); // Select the category
    fireEvent.change(assignmentGradeInput, { target: { value: '90' } });
  
    // Trigger the calculation
    const calculateButton = screen.getByText('Calculate');
    fireEvent.click(calculateButton);
  
    // Expect the final grade to be calculated
    const finalGradeText = screen.getByText(/Your Final Grade/i);
    expect(finalGradeText).toBeInTheDocument();
  });

  test('calculates final grade based on categories and assignments', () => {
    
    // Add a category
    const addCategoryButton = screen.getByTestId('add-category-button');
    fireEvent.click(addCategoryButton);
    
    const categoryNameInput = screen.getAllByPlaceholderText('Category Name')[1] as HTMLInputElement;
    const categoryWeightInput = screen.getAllByPlaceholderText('Weight')[1] as HTMLInputElement;
    
    // Set values for category
    fireEvent.change(categoryNameInput, { target: { value: 'Homework' } });
    fireEvent.change(categoryWeightInput, { target: { value: '40' } });
  
    // Add assignment
    const addAssignmentButton = screen.getByText('Add Assignment');
    fireEvent.click(addAssignmentButton);
  
    const assignmentNameInput = screen.getAllByPlaceholderText('Assignment Name')[0] as HTMLInputElement;
    const assignmentCategorySelect = screen.getAllByRole('combobox')[0] as HTMLSelectElement; // Querying the select element
    const assignmentGradeInput = screen.getAllByPlaceholderText('Grade')[0] as HTMLInputElement;
  
    // Set values for assignment
    fireEvent.change(assignmentNameInput, { target: { value: 'Math Homework 1' } });
    
    // Select the category (ensure it matches 'Homework')
    fireEvent.change(assignmentCategorySelect, { target: { value: 'Homework' } });
  
    fireEvent.change(assignmentGradeInput, { target: { value: '90' } });
  
    // Trigger the calculation
    const calculateButton = screen.getByText('Calculate');
    fireEvent.click(calculateButton);
  
    // Expect the final grade to be calculated
    const finalGradeText = screen.getByText(/Your Final Grade/i);
    expect(finalGradeText).toBeInTheDocument();
  });
  
  
  
});
