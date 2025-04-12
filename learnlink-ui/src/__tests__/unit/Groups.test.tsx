import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Groups from '../../pages/groups';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
import { MemoryRouter, useSearchParams } from 'react-router-dom';

// Mock components
jest.mock('../../components/Navbar', () => () => <div data-testid="navbar">Navbar</div>);
jest.mock('../../components/CopyrightFooter', () => () => <div data-testid="copyright-footer">CopyrightFooter</div>);
jest.mock('../../components/CustomAlert', () => ({ text, severity }: { text: string; severity: string }) => (
  <div data-testid="custom-alert">{text}</div>
));
jest.mock('../../components/StudyGroupInfo', () => () => <div data-testid="study-group-info">StudyGroupInfo</div>);

// Mock hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: jest.fn(),
  useNavigate: () => jest.fn(),
}));


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
// Mock socket.io
jest.mock('socket.io-client', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  })),
}));

describe('Groups Component Unit Tests', () => {
  const mockGroups = [
    {
      id: 1,
      name: 'Math Group',
      subject: 'Mathematics',
      description: 'For math lovers',
      created_by: 1,
      created_at: new Date(),
      creator: { id: 1, username: 'user1', firstName: 'John', lastName: 'Doe' },
      users: [
        { id: 1, username: 'user1', firstName: 'John', lastName: 'Doe' },
        { id: 2, username: 'user2', firstName: 'Jane', lastName: 'Smith' },
      ],
      chatID: 1,
      ideal_factor: 'HIGH',
      profile_pic: 'math-group.jpg',
    },
    {
      id: 2,
      name: 'Physics Group',
      subject: 'Physics',
      description: 'For physics enthusiasts',
      created_by: 2,
      created_at: new Date(),
      creator: { id: 2, username: 'user2', firstName: 'Jane', lastName: 'Smith' },
      users: [
        { id: 2, username: 'user2', firstName: 'Jane', lastName: 'Smith' },
        { id: 3, username: 'user3', firstName: 'Bob', lastName: 'Johnson' },
      ],
      chatID: 2,
      ideal_factor: 'MEDIUM',
      profile_pic: 'physics-group.jpg',
    },
  ];

  const mockSelectedGroup = mockGroups[0];
  const mockCurrentUser = { id: 1, username: 'user1', firstName: 'John', lastName: 'Doe' };

  beforeEach(() => {
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => 'test-token');
    
    // Mock useSearchParams
    (useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams(''),
      jest.fn()
    ]);
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  const renderGroups = (initialEntries = ['/groups']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Groups />
      </MemoryRouter>
    );
  };

  it('should render loading state initially', async () => {
    // Delay the API response to test loading state
    require('axios').default.get.mockImplementationOnce(() => new Promise(() => {}));
    
    renderGroups();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should fetch and display groups list', async () => {
    require('axios').default.get.mockImplementation((url:string) => {
      if (url.includes('/api/study-groups')) {
        return Promise.resolve({ data: mockGroups });
      }
      if (url.includes('/api/currentUser')) {
        return Promise.resolve({ data: mockCurrentUser });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    await act(async () => {
      renderGroups();
    });

    await waitFor(() => {
      expect(screen.getByText('Math Group')).toBeInTheDocument();
      expect(screen.getByText('Physics Group')).toBeInTheDocument();
    });
  });

  it('should display "Please select a group" when no group is selected', async () => {
    require('axios').default.get.mockImplementation((url:string) => {
      if (url.includes('/api/study-groups')) {
        return Promise.resolve({ data: mockGroups });
      }
      if (url.includes('/api/currentUser')) {
        return Promise.resolve({ data: mockCurrentUser });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    await act(async () => {
      renderGroups();
    });

    await waitFor(() => {
      expect(screen.getByText('Please select a group')).toBeInTheDocument();
    });
  });

  it('should select group from URL params if provided', async () => {
    (useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams('groupId=1'),
      jest.fn()
    ]);

    require('axios').default.get.mockImplementation((url:string) => {
      if (url.includes('/api/study-groups/1')) {
        return Promise.resolve({ data: { studyGroup: mockSelectedGroup } });
      }
      if (url.includes('/api/study-groups')) {
        return Promise.resolve({ data: mockGroups });
      }
      if (url.includes('/api/currentUser')) {
        return Promise.resolve({ data: mockCurrentUser });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    await act(async () => {
      renderGroups(['/groups?groupId=1']);
    });

    await waitFor(() => {
      expect(screen.getByTestId('study-group-info')).toBeInTheDocument();
    });
  });

  it('should handle group selection', async () => {
    require('axios').default.get.mockImplementation((url:string) => {
      if (url.includes('/api/study-groups')) {
        return Promise.resolve({ data: mockGroups });
      }
      if (url.includes('/api/currentUser')) {
        return Promise.resolve({ data: mockCurrentUser });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    await act(async () => {
      renderGroups();
    });

    await waitFor(() => {
      const mathGroupItem = screen.getByText('Math Group');
      fireEvent.click(mathGroupItem);
    });

    await waitFor(() => {
      expect(screen.getByTestId('study-group-info')).toBeInTheDocument();
    });
  });

  it('should display group profile pictures', async () => {
    require('axios').default.get.mockImplementation((url:string) => {
      if (url.includes('/api/study-groups')) {
        return Promise.resolve({ data: mockGroups });
      }
      if (url.includes('/api/currentUser')) {
        return Promise.resolve({ data: mockCurrentUser });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    await act(async () => {
      renderGroups();
    });

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('src', 'math-group.jpg');
      expect(images[1]).toHaveAttribute('src', 'physics-group.jpg');
    });
  });

  it('should show default profile picture when none is provided', async () => {
    const groupsWithNoPics = mockGroups.map(group => ({ ...group, profile_pic: null }));
    
    require('axios').default.get.mockImplementation((url:string) => {
      if (url.includes('/api/study-groups')) {
        return Promise.resolve({ data: groupsWithNoPics });
      }
      if (url.includes('/api/currentUser')) {
        return Promise.resolve({ data: mockCurrentUser });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    await act(async () => {
      renderGroups();
    });

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute(
        'src',
        'https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_busts-in-silhouette.png'
      );
    });
  });

  it('should handle API errors gracefully', async () => {
    require('axios').default.get.mockImplementation((url:string) => {
      if (url.includes('/api/study-groups')) {
        return Promise.reject(new Error('Failed to fetch groups'));
      }
      if (url.includes('/api/currentUser')) {
        return Promise.resolve({ data: mockCurrentUser });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    await act(async () => {
      renderGroups();
    });

    await waitFor(() => {
      expect(screen.queryByText('Math Group')).not.toBeInTheDocument();
      expect(screen.queryByText('Physics Group')).not.toBeInTheDocument();
    });
  });

  it('should handle current user fetch error', async () => {
    require('axios').default.get.mockImplementation((url:string) => {
      if (url.includes('/api/study-groups')) {
        return Promise.resolve({ data: mockGroups });
      }
      if (url.includes('/api/currentUser')) {
        return Promise.reject(new Error('Failed to fetch current user'));
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    await act(async () => {
      renderGroups();
    });

    await waitFor(() => {
      // Component should still render groups list
      expect(screen.getByText('Math Group')).toBeInTheDocument();
    });
  });

  it('should clear search params after loading', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);

    require('axios').default.get.mockImplementation((url:string) => {
      if (url.includes('/api/study-groups')) {
        return Promise.resolve({ data: mockGroups });
      }
      if (url.includes('/api/currentUser')) {
        return Promise.resolve({ data: mockCurrentUser });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    await act(async () => {
      renderGroups(['/groups?groupId=1']);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/groups', { replace: true });
    });
  });

  it('should set edit mode when tab param is "true"', async () => {

    const mockNavigate = jest.fn();
  
    // Mock useNavigate
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);
    
    // Mock useSearchParams to return tab=true

    (useSearchParams as jest.Mock).mockReturnValue([
      new URLSearchParams('groupId=1&tab=true'),
      jest.fn()
    ]);

    require('axios').default.get.mockImplementation((url:string) => {
      if (url.includes('/api/study-groups/1')) {
        return Promise.resolve({ data: { studyGroup: mockSelectedGroup } });
      }
      if (url.includes('/api/study-groups')) {
        return Promise.resolve({ data: mockGroups });
      }
      if (url.includes('/api/currentUser')) {
        return Promise.resolve({ data: mockCurrentUser });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    await act(async () => {
      renderGroups(['/groups?groupId=1&tab=true']);
    });

    await waitFor(() => {
      // Since we're mocking StudyGroupInfo, we can't directly test edit mode
      // But we can verify the API call was made with the correct params
      expect(require('axios').default.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/study-groups/1'),
        expect.anything()
      );
    });
  });
});