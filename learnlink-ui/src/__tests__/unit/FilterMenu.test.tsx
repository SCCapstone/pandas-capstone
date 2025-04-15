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
      { label: 'Engineering', value: 'engineering' },
      { label: 'Business', value: 'business' },
      { label: 'Arts', value: 'arts' },
    ],
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


    // Interact with College dropdown using placeholder
    // Use label text matching instead of placeholder
    const collegeInput = screen.getByText('College:').closest('div');
    await userEvent.click(collegeInput!);
    await userEvent.type(collegeInput!, 'Arts');
    await waitFor(() => expect(screen.getByText('Arts')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Arts'));

    const courseInput = screen.getByText('Course:').closest('div');
    await userEvent.click(courseInput!);
    await userEvent.type(courseInput!, 'Biology 101');

    // Simulate a dropdown suggestion appearing (optional mock if needed)
    await waitFor(() => expect(screen.getByText('Biology 101')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Biology 101'));


    // Click Apply Filters
    const applyBtn = screen.getByText('Apply Filters');
    await userEvent.click(applyBtn);

    // Click Clear
    const clearBtn = screen.getByText('Clear');
    await userEvent.click(clearBtn);

    // Verify options are cleared
    await waitFor(() => {
      expect(screen.queryByText('Arts')).not.toBeInTheDocument();
      expect(screen.queryByText('Biology 101')).not.toBeInTheDocument();
    });
  });
});

/* This keeps failing will come back to it*/
