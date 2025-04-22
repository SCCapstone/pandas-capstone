import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PopupProfile from '../../components/PopupProfile';
import axios from 'axios';
import '@testing-library/jest-dom';

// Mock axios with proper ESM handling
jest.mock('axios', () => ({
    __esModule: true,
    default: {
      get: jest.fn(),
      put: jest.fn(),
    },
  }));


const mockUserData = {
  first_name: 'John',
  last_name: 'Doe',
  username: 'johndoe',
  profilePic: 'http://example.com/profile.jpg',
  bio: 'Software developer and student',
  age: 25,
  grade: 'SENIOR',
  college: 'State University',
  major: 'Computer Science',
  gender: 'MALE',
  study_method: 'Pomodoro Technique',
  relevant_courses: ['CS101', 'CS202', 'MATH301'],
  studyHabitTags: ['MORNING_PERSON', 'VISUAL_LEARNER']
};

describe('PopupProfile Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage token
    Storage.prototype.getItem = jest.fn(() => 'mock-token');
  });

  describe('Initial State and Data Fetching', () => {
    it('shows loading state initially', () => {
      require('axios').default.get.mockResolvedValueOnce({ data: mockUserData });
      
      render(<PopupProfile id={1} onClose={mockOnClose} />);
      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    });

    it('fetches user data on mount with correct parameters', async () => {
        require('axios').default.get.mockResolvedValueOnce({ data: mockUserData });
      
      render(<PopupProfile id={1} onClose={mockOnClose} />);
      
      await waitFor(() => {
        expect(require('axios').default.get).toHaveBeenCalledWith(
          'http://localhost:2000/api/users/profile/1',
          {
            headers: {
              Authorization: 'Bearer mock-token'
            }
          }
        );
      });
    });

    it('displays user data after successful fetch', async () => {
        require('axios').default.get.mockResolvedValueOnce({ data: mockUserData });
      
      render(<PopupProfile id={1} onClose={mockOnClose} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('@johndoe')).toBeInTheDocument();
        expect(screen.getByText('Software developer and student')).toBeInTheDocument();
        expect(screen.getByText('25')).toBeInTheDocument();
        expect(screen.getByText('State University')).toBeInTheDocument();
      });
    });

    it('displays error message when fetch fails', async () => {
        require('axios').default.get.mockRejectedValueOnce(new Error('Network error'));
      
      render(<PopupProfile id={1} onClose={mockOnClose} />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to fetch user data.')).toBeInTheDocument();
      });
    });
  });

  describe('User Interaction', () => {
    it('calls onClose when close button is clicked', async () => {
        require('axios').default.get.mockResolvedValueOnce({ data: mockUserData });
      
      render(<PopupProfile id={1} onClose={mockOnClose} />);
      
      await waitFor(() => {
        const closeButton = screen.getByText('X');
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('calls onClose when clicking outside the panel', async () => {
        require('axios').default.get.mockResolvedValueOnce({ data: mockUserData });
      
      render(
        <div data-testid="outside-element">
          <PopupProfile id={1} onClose={mockOnClose} />
        </div>
      );
      
      await waitFor(() => {
        const outsideElement = screen.getByTestId('outside-element');
        fireEvent.mouseDown(outsideElement);
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('does not call onClose when clicking inside the panel', async () => {
        require('axios').default.get.mockResolvedValueOnce({ data: mockUserData });
      
      render(<PopupProfile id={1} onClose={mockOnClose} />);
      
      await waitFor(() => {
        const profileElement = screen.getByText('John Doe');
        fireEvent.mouseDown(profileElement);
        expect(mockOnClose).not.toHaveBeenCalled();
      });
    });
  });

  describe('Data Display', () => {
    it('displays N/A for missing fields', async () => {
      const partialUserData = {
        ...mockUserData,
        age: null,
        major: '',
        studyHabitTags: []
      };
      require('axios').default.get.mockResolvedValueOnce({ data: partialUserData });
      
      render(<PopupProfile id={1} onClose={mockOnClose} />);
      
      await waitFor(() => {
        expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
        expect(screen.getByText('No study tags specified')).toBeInTheDocument();
      });
    });

    it('formats enum values correctly', async () => {
        require('axios').default.get.mockResolvedValueOnce({ data: mockUserData });
      
      render(<PopupProfile id={1} onClose={mockOnClose} />);
      
      await waitFor(() => {
        expect(screen.getByText('Senior')).toBeInTheDocument();
        expect(screen.getByText('Male')).toBeInTheDocument();
        expect(screen.getByText('Morning Person')).toBeInTheDocument();
        expect(screen.getByText('Visual Learner')).toBeInTheDocument();
      });
    });

    it('displays tags for relevant courses', async () => {
        require('axios').default.get.mockResolvedValueOnce({ data: mockUserData });
      
      render(<PopupProfile id={1} onClose={mockOnClose} />);
      
      await waitFor(() => {
        expect(screen.getByText('CS101')).toBeInTheDocument();
        expect(screen.getByText('CS202')).toBeInTheDocument();
        expect(screen.getByText('MATH301')).toBeInTheDocument();
      });
    });

    it('hides bio section when bio is empty', async () => {
      const noBioUser = {
        ...mockUserData,
        bio: ''
      };
      require('axios').default.get.mockResolvedValueOnce({ data: noBioUser });
      
      render(<PopupProfile id={1} onClose={mockOnClose} />);
      
      await waitFor(() => {
        expect(screen.queryByText('About Me')).not.toBeInTheDocument();
      });
    });
  });

  describe('Cleanup', () => {
    it('removes event listener when unmounted', async () => {
        require('axios').default.get.mockResolvedValueOnce({ data: mockUserData });
      const removeEventListenerMock = jest.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(<PopupProfile id={1} onClose={mockOnClose} />);
      
      await waitFor(() => {
        unmount();
        expect(removeEventListenerMock).toHaveBeenCalledWith(
          'mousedown',
          expect.any(Function)
        );
        removeEventListenerMock.mockRestore();
      });
    });
  });
});