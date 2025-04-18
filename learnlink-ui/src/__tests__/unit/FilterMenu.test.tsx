import React from 'react';
import FilterMenu from '../../components/FilterMenu';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mock ResizeObserver to prevent errors
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock dependencies
jest.mock('../../utils/format', () => ({
  useEnums: () => ({
    grade: ['Freshman', 'Sophomore'],
    gender: ['male', 'female'],
    studyHabitTags: [],
  }),
  useColleges: () => ({
    isLoading: false,
    colleges: [
      { label: 'The University of Alabama', value: 'The University of Alabama' },
    ],
  }),
  useCourses: () => ({ // Add this mock
    isLoadingCourses: false,
    courses: ['Biology 101', 'Chemistry 101', 'Physics 101'],
  }),
  formatEnum: (value: string) => value.charAt(0).toUpperCase() + value.slice(1),
  useUserAgeRange: () => ({
    minAge: 18,
    maxAge: 30,
  }),
}));

describe('FilterMenu Component', () => {
  it('renders all filters and interacts with college and course fields', async () => {
    render(
      <MemoryRouter>
        <FilterMenu />
      </MemoryRouter>
    );

    // Labels/text content are present
    expect(screen.getByText('Search Filters')).toBeInTheDocument();
    expect(screen.getByText((text) => text.includes('College'))).toBeInTheDocument();
    expect(screen.getByText((text) => text.includes('Course'))).toBeInTheDocument();
    expect(screen.getByText((text) => text.includes('Age Range'))).toBeInTheDocument();
    expect(screen.getByText((text) => text.includes('Gender'))).toBeInTheDocument();

    // College selection
    const collegeDropdown = screen.getByText('College:').closest('div')?.querySelector('input') as HTMLElement;
    await userEvent.click(collegeDropdown);
    await userEvent.type(collegeDropdown, 'The University of Alabama');

    // Wait for and select the college option
    const collegeOption = await screen.findByText('The University of Alabama', {}, { timeout: 2000 });
    await userEvent.click(collegeOption);

     // Course selection
    const courseDropdown = screen.getByText('Courses:').closest('div')?.querySelector('input') as HTMLElement;
    await userEvent.click(courseDropdown);
    await userEvent.type(courseDropdown, 'Biology 101');
    
    // Wait for and select the course option
    const courseOption = await screen.findByText('Biology 101', {}, { timeout: 2000 });
    await userEvent.click(courseOption);

    
    // Apply and clear filters
    await userEvent.click(screen.getByText('Apply Filters'));
    const clearBtn = screen.getByText('Clear');
    await userEvent.click(clearBtn);
    
    // Verify options are cleared
    await waitFor(() => {
      // Check selected values are cleared
      expect(screen.queryByText('The University of Alabama', { selector: '.select__multi-value__label' }))
        .not.toBeInTheDocument();
      expect(screen.queryByText('Biology 101', { selector: '.select__multi-value__label' }))
        .not.toBeInTheDocument();
      
      // Also verify the inputs are cleared
      const collegeInput = screen.getByText('College:').closest('div')?.querySelector('input') as HTMLInputElement;
      expect(collegeInput.value).toBe('');
    });
  });
});


