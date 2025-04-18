import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudyGroupInfo from '../../components/StudyGroupInfo';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';

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
        if (url.includes('/api/study-groups/chat')) {
          return Promise.resolve({
            data: {
              name: 'Math Study Group',
              description: 'Group for advanced calculus',
              subject: 'Mathematics',
              chatID: 1,
              ideal_match_factor: 'HIGH',
              profilePic: 'math-group.jpg'
            }
          });
        }
        return Promise.reject(new Error('Unexpected URL'));
      }),
      post: jest.fn().mockResolvedValue({ data: {} })
    }
  }));

// Mock EditStudyGroup component
jest.mock('../../components/EditStudyGroup', () => ({
  __esModule: true,
  default: ({ onClose }: any) => (
    <div data-testid="edit-study-group">
      <button onClick={onClose}>Close Edit</button>
    </div>
  )
}));

// Mock CustomAlert
jest.mock('../../components/CustomAlert', () => ({
    __esModule: true,
    default: ({ text }: { text: string }) => (
      <div data-testid="custom-alert">{text}</div>
    ),
  }));

// Mock GroupUserContainer component
jest.mock('../../components/GroupUserContainer', () => ({
  __esModule: true,
  default: () => <div data-testid="group-user-container">Group User Container</div>
}));


// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  Link: ({ children }: any) => <div>{children}</div>
}));

// Add this at the top of your test file
global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ studyHabitTags: ['LOW', 'MEDIUM', 'HIGH'] }),
    })
  ) as jest.Mock;

describe('StudyGroupInfo Component Unit Tests', () => {
  const mockStudyGroup = {
    name: 'Math Study Group',
    description: 'Group for advanced calculus',
    subject: 'Mathematics',
    chatID: 1,
    ideal_match_factor: 'HIGH',
    profilePic: 'math-group.jpg'
  };

  const mockUsers = [
    { id: 1, username: 'user1', firstName: 'John', lastName: 'Doe' },
    { id: 2, username: 'user2', firstName: 'Jane', lastName: 'Smith' }
  ];

  const mockUpdateChatName = jest.fn();
  const mockUpdatePFP = jest.fn();
  const mockOnRemoveUser = jest.fn();
  const mockUpdateUsers = jest.fn();

  const defaultProps = {
    chatID: 1,
    updateChatName: mockUpdateChatName,
    updatePFP: mockUpdatePFP,
    groupId: 123,
    currentId: 1,
    users: mockUsers,
    onRemoveUser: mockOnRemoveUser,
    updateUsers: mockUpdateUsers,
    isItEdit: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    Storage.prototype.getItem = jest.fn(() => 'test-token');
    // Mock successful API responses
    require('axios').default.get.mockImplementation((url:string) => {
      if (url.includes('/api/enums')) {
        return Promise.resolve({
          data: {
            studyHabitTags: ['LOW', 'MEDIUM', 'HIGH']
          }
        });
      }
      if (url.includes('/api/study-groups/chat/1')) {
        return Promise.resolve({
          data: mockStudyGroup
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

     // Mock fetch for enums
     global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ studyHabitTags: ['LOW', 'MEDIUM', 'HIGH'] }),
        })
      ) as jest.Mock;
    
      // Mock axios for study group
      (axios.get as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/study-groups/chat')) {
          return Promise.resolve({
            data: mockStudyGroup
          });
        }
        return Promise.reject(new Error('Unexpected URL'));
      });
    
      // Mock localStorage
      Storage.prototype.getItem = jest.fn(() => 'test-token');
  });


  afterEach(async () => {
    // Clear all timers
    jest.clearAllTimers();
  
  });
  
  
  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <StudyGroupInfo {...defaultProps} {...props} />
      </MemoryRouter>
    );
  };

  it('should render loading state initially', async () => {
    // Delay the API response to test loading state
    require('axios').default.get.mockImplementationOnce(() => new Promise(() => {}));
    
    renderComponent();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  
  it('should fetch and display study group info', async () => {
    await act(async () => {
      renderComponent();
    });
    
    await waitFor(() => {
      expect(screen.getByText(mockStudyGroup.name)).toBeInTheDocument();
      expect(screen.getByText(mockStudyGroup.description)).toBeInTheDocument();
      expect(screen.getByText(mockStudyGroup.subject)).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument(); // Formatted enum
    });
  });

  it('should display profile picture', async () => {
    await act(async () => {
      renderComponent();
    });
    
    await waitFor(() => {
      const img = screen.getByAltText('Profile');
      expect(img).toHaveAttribute('src', mockStudyGroup.profilePic);
    });
  });

  it('should show default profile picture when none is provided', async () => {
    const noPicGroup = {
      ...mockStudyGroup,
      profilePic: null
    };
    
    require('axios').default.get.mockImplementationOnce((url:string) => {
      if (url.includes('/api/study-groups/chat')) {
        return Promise.resolve({
          data: noPicGroup
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });
    
    await act(async () => {
      renderComponent();
    });
    
    await waitFor(() => {
      const img = screen.getByAltText('Profile');
      expect(img).toHaveAttribute('src', 'https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_busts-in-silhouette.png');
    });
  });

  

  it('should show edit component when edit button is clicked', async () => {
    await act(async () => {
      renderComponent();
    });
    
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('edit-study-group')).toBeInTheDocument();
    });
  });

  it('should render GroupUserContainer with correct props', async () => {
    await act(async () => {
      renderComponent();
    });
    
    await waitFor(() => {
      const userContainer = screen.getByTestId('group-user-container');
      expect(userContainer).toBeInTheDocument();
    });
  });

  it('should navigate to chat when Chat button is clicked', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);
    
    await act(async () => {
      renderComponent();
    });
    
    const chatButton = screen.getByText('Chat');
    fireEvent.click(chatButton);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/messaging?selectedChatId=1');
    });
  });





it('should show availability button linked to schedule page', async () => {
    // Mock fetch for enums
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ studyHabitTags: ['LOW', 'MEDIUM', 'HIGH'] }),
      })
    ) as jest.Mock;
  
    // Mock axios for study group
    (axios.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/study-groups/chat')) {
        return Promise.resolve({
          data: mockStudyGroup
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });
  
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => 'test-token');
  
    // Render
    await act(async () => {
      renderComponent();
    });
  
    // Debug to see what's rendered
    screen.debug();
  
    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('Math Study Group')).toBeInTheDocument();
    }, { timeout: 3000 });
  
    // Verify button
    const availabilityButton = screen.getByTestId('avail-button');
    expect(availabilityButton).toBeInTheDocument();
  });




  
  it('should handle edit mode when isItEdit prop is true', async () => {
    await act(async () => {
      renderComponent({ isItEdit: true });
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('edit-study-group')).toBeInTheDocument();
    });
  });

  it('should close edit mode when EditStudyGroup calls onClose', async () => {
    await act(async () => {
      renderComponent({ isItEdit: true });
    });
    
    const closeButton = screen.getByText('Close Edit');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('edit-study-group')).not.toBeInTheDocument();
    });
  });

  it('should display formatted ideal match factor', async () => {
    await act(async () => {
      renderComponent();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Ideal Match Factor:')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
    });
  });

  it('should render default profile picture when URL is invalid', async () => {
    const invalidPicGroup = {
      ...mockStudyGroup,
      profilePic: 'invalid-url.jpg'
    };
  
    (axios.get as jest.Mock).mockImplementationOnce((url: string) => {
      if (url.includes('/api/study-groups/chat')) {
        return Promise.resolve({ data: invalidPicGroup });
      }
      return Promise.resolve({ data: { studyHabitTags: [] } });
    });
  
    await act(async () => {
      renderComponent();
    });
  
    await waitFor(() => {
      const img = screen.getByAltText('Profile');
      expect(img).toHaveAttribute('src', expect.stringContaining('invalid-url.jpg'));
    });
  });

  it('should transition to edit mode and back correctly', async () => {
    await act(async () => {
      renderComponent();
    });
  
    // Enter edit mode
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('edit-study-group')).toBeInTheDocument();
    });
  
    // Exit edit mode
    const closeButton = screen.getByText('Close Edit');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('edit-study-group')).not.toBeInTheDocument();
    });
  });


  it('should display "N/A" when ideal match factor is missing', async () => {
    const noFactorGroup = {
      ...mockStudyGroup,
      ideal_match_factor: null
    };
  
    (axios.get as jest.Mock).mockImplementationOnce((url: string) => {
      if (url.includes('/api/study-groups/chat')) {
        return Promise.resolve({ data: noFactorGroup });
      }
      return Promise.resolve({ data: { studyHabitTags: [] } });
    });
  
    await act(async () => {
      renderComponent();
    });
  
    await waitFor(() => {
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  it('should correctly use passed props', async () => {
    const customProps = {
      ...defaultProps,
      chatID: 2,
      groupId: 456,
      currentId: 3
    };
  
    await act(async () => {
      renderComponent(customProps);
    });
  
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/study-groups/chat/2'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' }
        })
      );
    });
  });


  it('should use correct API URL from environment', async () => {
    const originalEnv = process.env.REACT_APP_API_URL;
    process.env.REACT_APP_API_URL = 'https://test-api.example.com';
    
    await act(async () => {
      renderComponent();
    });
  
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('https://test-api.example.com/api/study-groups/chat/1'),
        expect.anything()
      );
    });
  
    process.env.REACT_APP_API_URL = originalEnv;
  });

  it('should update state when study group data changes', async () => {
    await act(async () => {
      renderComponent();
    });
  
    // Initial render
    await waitFor(() => {
      expect(screen.getByText('Math Study Group')).toBeInTheDocument();
    });
  
    // Simulate props change
    const updatedProps = {
      ...defaultProps,
      chatID: 2
    };
  
    const updatedStudyGroup = {
      ...mockStudyGroup,
      name: 'Physics Study Group',
      chatID: 2
    };
  
    (axios.get as jest.Mock).mockImplementationOnce((url: string) => {
      if (url.includes('/api/study-groups/chat/2')) {
        return Promise.resolve({ data: updatedStudyGroup });
      }
      return Promise.resolve({ data: { studyHabitTags: [] } });
    });
  
    await act(async () => {
      render(
        <MemoryRouter>
          <StudyGroupInfo {...updatedProps} />
        </MemoryRouter>,
        { container: document.body.firstChild as HTMLElement }
      );
    });
  
    await waitFor(() => {
      expect(screen.getByText('Physics Study Group')).toBeInTheDocument();
    });
  });


  it('should navigate to correct chat URL', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);
  
    await act(async () => {
      renderComponent();
    });
  
    const chatButton = screen.getByText('Chat');
    fireEvent.click(chatButton);
  
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/messaging?selectedChatId=1');
    });
  });
});