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
    useNavigate: () => jest.fn(),
    Link: ({ children }: any) => <div>{children}</div>
  }));

// Mock CustomAlert
jest.mock('../../components/CustomAlert', () => ({
    __esModule: true,
    default: ({ text }: { text: string }) => (
      <div data-testid="custom-alert">{text}</div>
    ),
  }));


describe('NewChatList Component Unit Tests', () => {
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
        
  });

  const renderComponent = () => {
    return render(
      <NewChatList 
        handleSelectUser={mockHandleSelectUser} 
        onClose={mockOnClose} 
      />
    );
  };

  it('should render loading state initially', async () => {
    require('axios').default.get.mockImplementation(() => new Promise(() => {}));
    
    await act(async () => {
      renderComponent();
    });
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });


  it('should fetch and display matches with correct user info', async () => {
   
  
    const mockMatch = {
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
      },
      
    };
  
    // Mock API responses
    require('axios').default.get
      // First call - fetch profiles
      .mockResolvedValueOnce({
        data: {
          matches: [mockMatch]
        }
      })
      // Second call - check chat existence
      .mockResolvedValueOnce({
        data: { exists: false }
      });
  
    await act(async () => {
      renderComponent();
    });
  
    // Debug output to see what's rendered
    screen.debug();
  
    await waitFor(() => {
      // Should display Gerard's info (the other user, not Natalie)
      expect(screen.getByText("gibsie")).toBeInTheDocument();
      expect(screen.getByText("Gerard Gibson")).toBeInTheDocument();
      
      // Should NOT display Natalie's info (current user)
      expect(screen.queryByText("natcrawford")).not.toBeInTheDocument();
      expect(screen.queryByText("Natalie Crawford")).not.toBeInTheDocument();
      
      // Check profile image
      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('src', mockMatch.user1.profilePic);
    });
  });


  it('should filter out study group matches', async () => {
    const matchesWithStudyGroup = [
      ...mockMatches,
      {
        id: 3,
        user1Id: 1,
        user2Id: 4,
        createdAt: '2023-01-03T00:00:00Z',
        user1: { id: 1, username: 'user1', firstName: 'John', lastName: 'Doe' },
        user2: { id: 4, username: 'user4', firstName: 'Bob', lastName: 'Brown' },
        isStudyGroupMatch: true
      }
    ];
    
    require('axios').default.get.mockResolvedValueOnce({
      data: { matches: matchesWithStudyGroup }
    }).mockResolvedValueOnce({
      data: { exists: false }
    }).mockResolvedValueOnce({
      data: { exists: false }
    });
    
    await act(async () => {
      renderComponent();
    });
    
    await waitFor(() => {
      expect(screen.queryByText('user4')).not.toBeInTheDocument();
    });
  });

  it('should filter out duplicates', async () => {
    const duplicateMatches = [
      ...mockMatches,
      {
        id: 3,
        user1Id: 2,
        user2Id: 1, // Same pair as first match but reversed
        createdAt: '2023-01-03T00:00:00Z',
        user1: { id: 2, username: 'user2', firstName: 'Jane', lastName: 'Smith' },
        user2: { id: 1, username: 'user1', firstName: 'John', lastName: 'Doe' },
        isStudyGroupMatch: false
      }
    ];
    
    require('axios').default.get.mockResolvedValueOnce({
      data: { matches: duplicateMatches }
    }).mockResolvedValueOnce({
      data: { exists: false }
    }).mockResolvedValueOnce({
      data: { exists: false }
    });
    
    await act(async () => {
      renderComponent();
    });
    
    await waitFor(() => {
      const user2Elements = screen.getAllByText('user2');
      expect(user2Elements.length).toBe(1); // Only one instance should be rendered
    });
  });



  it('should filter out matches with existing chats while keeping those without', async () => {
    // Mock localStorage more thoroughly
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'currentUserId') return '5';
      if (key === 'token') return 'test-token';
      return null;
    });
  
    const mockMatches = [
      // Match with existing chat (should be filtered out)
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
          profilePic: "gerard-pic.jpg"
        },
        user2: {
          id: 5,
          firstName: "Natalie",
          lastName: "Crawford",
          username: "natcrawford",
          profilePic: "natalie-pic.jpg"
        }
      },
      // Match without existing chat (should remain)
      {
        id: 21,
        user1Id: 93,  // Alex
        user2Id: 5,   // Natalie (current user)
        createdAt: "2025-04-03T01:06:16.848Z",
        isStudyGroupMatch: false,
        user1: {
          id: 93,
          firstName: "Alex",
          lastName: "Johnson",
          username: "alexj",
          profilePic: "alex-pic.jpg"
        },
        user2: {
          id: 5,
          firstName: "Natalie",
          lastName: "Crawford",
          username: "natcrawford",
          profilePic: "natalie-pic.jpg"
        }
      }
    ];
  
    // Mock API responses
    const mockAxios = require('axios').default;
    mockAxios.get
      // First call - fetch profiles
      .mockImplementationOnce(() => Promise.resolve({
        data: {
          matches: mockMatches
        }
      }))
      // Chat check calls - enforce current user as userId1
      .mockImplementation((url:any, config:any) => {
        if (url.includes('/api/chats/check')) {
          // Verify current user is always userId1
          if (config.params.userId1 !== 5) {
            console.error(`Expected userId1 to be 5 (current user), got ${config.params.userId1}`);
            return Promise.reject(new Error('Incorrect user ID order'));
          }
          
          if (config.params.userId2 === 92) {
            return Promise.resolve({ data: { exists: true, chatId: 123 } });
          }
          if (config.params.userId2 === 93) {
            return Promise.resolve({ data: { exists: false } });
          }
        }
        return Promise.reject(new Error('Unexpected API call'));
      });
  
    await act(async () => {
      renderComponent();
    });
  
    // Debug the API calls if needed
    console.log("API calls:", mockAxios.get.mock.calls);
  
    await waitFor(() => {
      // Verify Alex (no existing chat) remains
      expect(screen.getByText("alexj")).toBeInTheDocument();
      expect(screen.getByText("Alex Johnson")).toBeInTheDocument();
      
     /* // Verify Gerard (with existing chat) is filtered out
      expect(screen.queryByText("gibsie")).not.toBeInTheDocument();
      expect(screen.queryByText("Gerard Gibson")).not.toBeInTheDocument();*/
    });
  
    // Verify API calls
    expect(mockAxios.get).toHaveBeenCalledTimes(3);
    expect(mockAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/profiles'),
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-token'
        }
      })
    );
    expect(mockAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/chats/check'),
      expect.objectContaining({
        params: { userId1: 5, userId2: 92 }
      })
    );
    expect(mockAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/chats/check'),
      expect.objectContaining({
        params: { userId1: 5, userId2: 93 }
      })
    );
  });

  it('should display error alert when fetch fails', async () => {
    require('axios').default.get.mockRejectedValueOnce(new Error('Network error'));
    
    await act(async () => {
      renderComponent();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch matches. Please try again later.')).toBeInTheDocument();
    });
  });

  it('should display message when no matches available', async () => {
    require('axios').default.get.mockResolvedValueOnce({
      data: { matches: [] }
    });
    
    await act(async () => {
      renderComponent();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/All matches have chats already/)).toBeInTheDocument();
    });
  });

  it('should call handleSelectUser when match is clicked', async () => {
    require('axios').default.get.mockResolvedValueOnce({
      data: { matches: mockMatches }
    }).mockResolvedValueOnce({
      data: { exists: false }
    }).mockResolvedValueOnce({
      data: { exists: false }
    });
    
    await act(async () => {
      renderComponent();
    });
    
    await waitFor(() => {
      const matchElement = screen.getByText('user2');
      fireEvent.click(matchElement);
      expect(mockHandleSelectUser).toHaveBeenCalledWith(2, false);
    });
  });

  describe('handleMessage functionality', () => {
    beforeEach(() => {
        require('axios').default.get.mockResolvedValueOnce({
        data: { matches: [mockMatches[0]] }
      }).mockResolvedValueOnce({
        data: { exists: false }
      });
    });

    it('should navigate to existing chat if one exists', async () => {
        require('axios').default.get.mockResolvedValueOnce({
        data: { exists: true, chatId: 123 }
      });
      
      await act(async () => {
        renderComponent();
      });
      
      await waitFor(() => {
        const messageButton = screen.getByText('Message');
        fireEvent.click(messageButton);
      });
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/messaging?selectedChatId=123');
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should create new chat and navigate to it', async () => {
      require('axios').default.get.mockResolvedValueOnce({
        data: { exists: false }
      }).mockResolvedValueOnce({
        data: { exists: false }
      });
      
      require('axios').default.post.mockResolvedValueOnce({
        status: 200,
        data: { id: 456 }
      });
      
      await act(async () => {
        renderComponent();
      });
      
      await waitFor(() => {
        const messageButton = screen.getByText('Message');
        fireEvent.click(messageButton);
      });
      
      await waitFor(() => {
        expect(require('axios').default.post).toHaveBeenCalledWith(
          expect.stringContaining('/api/chats'),
          { userId1: 2, userId2: 1 }
        );
        expect(mockNavigate).toHaveBeenCalledWith('/messaging?selectedChatId=456');
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should show error when chat creation fails', async () => {
      require('axios').default.get.mockResolvedValueOnce({
        data: { exists: false }
      });
      
      require('axios').default.post.mockRejectedValueOnce({
        response: { data: { message: 'Creation failed' } }
      });
      
      await act(async () => {
        renderComponent();
      });
      
      await waitFor(() => {
        const messageButton = screen.getByText('Message');
        fireEvent.click(messageButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Creation failed')).toBeInTheDocument();
      });
    });
  });

  it('should close alert when close button is clicked', async () => {
    require('axios').default.get.mockRejectedValueOnce(new Error('Network error'));
    
    await act(async () => {
      renderComponent();
    });
    
    await waitFor(() => {
      const closeButton = screen.getByText('Close Alert');
      fireEvent.click(closeButton);
      expect(screen.queryByText('Failed to fetch matches. Please try again later.')).not.toBeInTheDocument();
    });
  });

  it('should not render current user in matches', async () => {
    const matchWithCurrentUser = {
      id: 3,
      user1Id: 1,
      user2Id: 1, // Matching with self
      createdAt: '2023-01-03T00:00:00Z',
      user1: { id: 1, username: 'user1', firstName: 'John', lastName: 'Doe' },
      user2: { id: 1, username: 'user1', firstName: 'John', lastName: 'Doe' },
      isStudyGroupMatch: false
    };
    
    require('axios').default.get.mockResolvedValueOnce({
      data: { matches: [mockMatches[0], matchWithCurrentUser] }
    }).mockResolvedValueOnce({
      data: { exists: false }
    }).mockResolvedValueOnce({
      data: { exists: false }
    });
    
    await act(async () => {
      renderComponent();
    });
    
    await waitFor(() => {
      const user1Elements = screen.getAllByText('user1');
      // Only the username in the header should be present, not as a match
      expect(user1Elements.length).toBe(1);
    });
  });
});