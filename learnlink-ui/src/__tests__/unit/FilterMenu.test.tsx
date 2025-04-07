import React from 'react';
import FilterMenu from '../../components/FilterMenu';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mock dependiences {Ill come back to this fail test}
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

    // Check all visible labels
    expect(screen.getByText('Search Filters')).toBeInTheDocument();
    expect(screen.getByLabelText('College:')).toBeInTheDocument();
    expect(screen.getByLabelText('Course:')).toBeInTheDocument();
    expect(screen.getByLabelText('Age Range:')).toBeInTheDocument();
    expect(screen.getByLabelText('Gender:')).toBeInTheDocument();

    // Interact with College input
    const collegeInput = screen.getByPlaceholderText('Type or select colleges...');
    await userEvent.type(collegeInput, 'Arts');
    await waitFor(() => expect(screen.getByText('Arts')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Arts'));

    // Interact with Course input
    const courseInput = screen.getByPlaceholderText('Type or select courses...');
    await userEvent.type(courseInput, 'Biology 101');
    await waitFor(() => expect(screen.getByText('Biology 101')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Biology 101'));

    // Click Apply
    await userEvent.click(screen.getByText('Apply Filters'));

    // Click Clear
    await userEvent.click(screen.getByText('Clear'));

    await waitFor(() => {
      expect(screen.queryByText('Arts')).not.toBeInTheDocument();
      expect(screen.queryByText('Biology 101')).not.toBeInTheDocument();
    });
  });
});
