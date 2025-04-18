import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PopupProfile from '../../components/PopupProfile';
import axios from 'axios';

// Mock axios with proper ESM handling
jest.mock('axios', () => ({
    __esModule: true,
    default: {
      get: jest.fn(),
      put: jest.fn(),
    },
  }));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('PopupProfile Component', () => {
  const mockUser = {
    first_name: 'John',
    last_name: 'Doe',
    username: 'johndoe',
    profilePic: 'profile.jpg',
    bio: 'Software developer',
    age: 25,
    college: 'Harvard',
    major: 'Computer Science',
    gender: 'MALE',
    grade: 'SENIOR',
    relevant_courses: ['CS101', 'CS202'],
    study_method: 'Pomodoro',
    studyHabitTags: ['MORNING_PERSON', 'QUIET_ENVIRONMENT']
  };

  const mockProps = {
    id: 1,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('mock-token');
  });

  it('should render loading state initially', () => {
    render(<PopupProfile {...mockProps} />);
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('should fetch and display user data', async () => {
    require('axios').default.get.mockResolvedValueOnce({ data: mockUser });

    render(<PopupProfile {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText(`${mockUser.first_name} ${mockUser.last_name}`)).toBeInTheDocument();
      expect(screen.getByText(`@${mockUser.username}`)).toBeInTheDocument();
      expect(screen.getByText(mockUser.bio)).toBeInTheDocument();
    });

    expect(require('axios').default.get).toHaveBeenCalledWith(
      expect.stringContaining(`/api/users/profile/${mockProps.id}`),
      {
        headers: {
          Authorization: 'Bearer mock-token',
        },
      }
    );
  });

  it('should display error message when fetch fails', async () => {
    require('axios').default.get.mockRejectedValueOnce(new Error('Network error'));

    render(<PopupProfile {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch user data.')).toBeInTheDocument();
    });
  });

  it('should close when clicking outside', async () => {
    // Mock the axios response
    require('axios').default.get.mockResolvedValueOnce({ data: mockUser });
  
    // Render the component
    const { container } = render(<PopupProfile {...mockProps} />);
  
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText(`${mockUser.first_name} ${mockUser.last_name}`)).toBeInTheDocument();
    });
  
    // Create a DOM element that's outside the popup
    const outsideElement = document.createElement('div');
    document.body.appendChild(outsideElement);
  
    // Trigger mousedown on the outside element
    fireEvent.mouseDown(outsideElement);
  
    // Verify onClose was called
    expect(mockProps.onClose).toHaveBeenCalled();
  
    // Clean up
    document.body.removeChild(outsideElement);
  });

  it('should close when clicking close button', async () => {
    require('axios').default.get.mockResolvedValueOnce({ data: mockUser });

    render(<PopupProfile {...mockProps} />);

    await waitFor(() => {
      const closeButton = screen.getByText('X');
      fireEvent.click(closeButton);
    });

    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should format enum values correctly', async () => {
    require('axios').default.get.mockResolvedValueOnce({ data: mockUser });

    render(<PopupProfile {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Male')).toBeInTheDocument();
      expect(screen.getByText('Senior')).toBeInTheDocument();
      expect(screen.getByText('Morning Person')).toBeInTheDocument();
      expect(screen.getByText('Quiet Environment')).toBeInTheDocument();
    });
  });

  it('should handle missing optional fields', async () => {
    const minimalUser = {
      ...mockUser,
      bio: '',
      studyHabitTags: [],
      relevant_courses: [],
    };
    require('axios').default.get.mockResolvedValueOnce({ data: minimalUser });

    render(<PopupProfile {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText(/No study tags specified/i)).toBeInTheDocument();
    });
  });
});