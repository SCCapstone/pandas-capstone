import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewChatList from '../../components/NewChatList';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
import { useNavigate } from 'react-router-dom';

// Mock axios
jest.mock('axios', () => ({
    __esModule: true,
    default: {
      get: jest.fn((url: string) => {
        if (url.includes('/api/enums')) {
          return Promise.resolve({
            data: {
              studyHabitTags: ['LOW', 'MEDIUM', 'HIGH']
            }
          });
        }
        
        
        return Promise.reject(new Error('Unexpected URL'));
      }),
      isAxiosError: jest.fn().mockImplementation((error) => {
        return error && error.isAxiosError === true;
      }),
      post: jest.fn().mockResolvedValue({ data: {} })
    }
  }));

  jest.mock('../../utils/auth', () => ({
    ...jest.requireActual('../../utils/auth'),
    getLoggedInUserId: jest.fn(),
  }));


// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
    Link: ({ children }: any) => <div>{children}</div>
  }));

// Mock CustomAlert since we don't need to test its internals
jest.mock('../../components/CustomAlert', () => ({ text, severity, onClose }: any) => (
    <div data-testid="custom-alert">
      <span>{text}</span>
      <button onClick={onClose}>Close</button>
    </div>
  ));


describe('NewChatList Component Behavioral Tests', () => {
  const mockHandleSelectUser = jest.fn();
  const mockOnClose = jest.fn();
  const mockNavigate = jest.fn();
  const currentUserId = 5;
  const mockMatches = [
    {
      id: 20,
      user1Id: 92,  // Gerard
      user2Id: 5,   // Natalie (current user)
      createdAt: "2025-04-02T01:06:16.848Z",
      isStudyGroupMatch: false,
      user1: {
        id: 92,
        firstName: "Gerard",
        lastName: "Gibson",
        username: "gibsie",
        profilePic: "https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_roller-skate.png"
      },
      user2: {
        id: 5,
        firstName: "Natalie",
        lastName: "Crawford",
        username: "natcrawford",
        profilePic: "https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_mirror-ball.png"
      }
    },
    {
      id: 21,
      user1Id: 93,  // Another user
      user2Id: 5,   // Natalie (current user)
      createdAt: "2025-04-03T01:06:16.848Z",
      isStudyGroupMatch: false,
      user1: {
        id: 93,
        firstName: "Alex",
        lastName: "Johnson",
        username: "alexj",
        profilePic: "https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_default.png"
      },
      user2: {
        id: 5,
        firstName: "Natalie",
        lastName: "Crawford",
        username: "natcrawford",
        profilePic: "https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_mirror-ball.png"
      }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
     // Mock localStorage
     Storage.prototype.getItem = jest.fn(() => 'test-token');
     Storage.prototype.getItem = jest.fn((key) => {
        if (key === 'userId') return '5';
        if (key === 'token') return 'test-token';
        return null;
      });

       // Mock the auth utility
        const auth = require('../../utils/auth');
        auth.getLoggedInUserId.mockImplementation(() => 5);

  });

  const renderComponent = () => {
    return render(
      <NewChatList 
        handleSelectUser={mockHandleSelectUser} 
        onClose={mockOnClose} 
      />
    );
  };

  describe('User Interactions', () => {
    it('should allow clicking on a match to select the user', async () => {
      // Mock API responses
      (axios.get as jest.Mock)
        .mockResolvedValueOnce({ data: { matches: [mockMatches[0]] } })
        .mockResolvedValueOnce({ data: { exists: false } });

      await act(async () => {
        renderComponent();
      });

      await waitFor(() => {
        const matchElement = screen.getByText('gibsie');
        fireEvent.click(matchElement);
        expect(mockHandleSelectUser).toHaveBeenCalledWith(92, false);
      });
    });

     


    it('should prevent event propagation when clicking Message button', async () => {
      // Mock API responses
      (axios.get as jest.Mock)
        .mockResolvedValueOnce({ data: { matches: [mockMatches[0]] } })
        .mockResolvedValueOnce({ data: { exists: false } });

      await act(async () => {
        renderComponent();
      });

      await waitFor(() => {
        const matchElement = screen.getByText('gibsie');
        const messageButton = screen.getByText('Message');
        
        // First click the message button (should not trigger handleSelectUser)
        fireEvent.click(messageButton);
        expect(mockHandleSelectUser).not.toHaveBeenCalled();
        
        // Then click the match element (should trigger handleSelectUser)
        fireEvent.click(matchElement);
        expect(mockHandleSelectUser).toHaveBeenCalled();
      });
    });
  });


  describe('Visual Feedback', () => {
    it('should show loading spinner while fetching data', async () => {
      (axios.get as jest.Mock).mockImplementation(() => new Promise(() => {}));

      await act(async () => {
        renderComponent();
      });
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should display "no matches" message when there are no available matches', async () => {
      (axios.get as jest.Mock).mockResolvedValueOnce({ data: { matches: [] } });

      await act(async () => {
        renderComponent();
      });

      await waitFor(() => {
        expect(screen.getByText(/All matches have chats already/)).toBeInTheDocument();
      });
    });

    it('should display user profile pictures correctly', async () => {
      (axios.get as jest.Mock)
        .mockResolvedValueOnce({ data: { matches: [mockMatches[0]] } })
        .mockResolvedValueOnce({ data: { exists: false } });

      await act(async () => {
        renderComponent();
      });

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images[0]).toHaveAttribute('src', mockMatches[0].user1.profilePic);
      });
    });

    it('should show default profile picture when none is provided', async () => {
      const matchWithNoPic = {
        ...mockMatches[0],
        user1: {
          ...mockMatches[0].user1,
          profilePic: ''
        }
      };

      (axios.get as jest.Mock)
        .mockResolvedValueOnce({ data: { matches: [matchWithNoPic] } })
        .mockResolvedValueOnce({ data: { exists: false } });

      await act(async () => {
        renderComponent();
      });

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images[0]).toHaveAttribute('src', 'https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_bust-in-silhouette.png');
      });
    });
  });

  describe('Data Handling', () => {
    it('should sort matches by createdAt in descending order', async () => {
      const olderMatch = {
        ...mockMatches[0],
        createdAt: "2025-04-01T01:06:16.848Z"
      };
      const newerMatch = {
        ...mockMatches[1],
        createdAt: "2025-04-03T01:06:16.848Z"
      };

      (axios.get as jest.Mock)
        .mockResolvedValueOnce({ data: { matches: [olderMatch, newerMatch] } })
        .mockResolvedValueOnce({ data: { exists: false } })
        .mockResolvedValueOnce({ data: { exists: false } });

      await act(async () => {
        renderComponent();
      });

      await waitFor(() => {
        const usernames = screen.getAllByTestId('username');
        // Newer match should appear first
        expect(usernames[0]).toHaveTextContent('alexj');
        expect(usernames[1]).toHaveTextContent('gibsie');
      });
    });

    it('should filter out matches with the current user', async () => {
      const matchWithSelf = {
        id: 22,
        user1Id: 5,
        user2Id: 5,
        createdAt: "2025-04-04T01:06:16.848Z",
        isStudyGroupMatch: false,
        user1: {
          id: 5,
          firstName: "Natalie",
          lastName: "Crawford",
          username: "natcrawford",
          profilePic: "natalie-pic.jpg"
        },
        user2: {
          id: 5,
          firstName: "Natalie",
          lastName: "Crawford",
          username: "natcrawford",
          profilePic: "natalie-pic.jpg"
        }
      };

      (axios.get as jest.Mock)
        .mockResolvedValueOnce({ data: { matches: [mockMatches[0], matchWithSelf] } })
        .mockResolvedValueOnce({ data: { exists: false } });

      await act(async () => {
        renderComponent();
      });

      await waitFor(() => {
        expect(screen.queryByText('natcrawford')).not.toBeInTheDocument();
        expect(screen.getByText('gibsie')).toBeInTheDocument();
      });
    });
  });
});
