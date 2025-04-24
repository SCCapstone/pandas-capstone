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
      post: jest.fn().mockResolvedValue({ data: {} }),
      delete: jest.fn()
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
describe('Groups Component Behavioral Tests', () => {
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
  
    it('should display "No groups found" message when there are no groups', async () => {
      require('axios').default.get.mockImplementation((url:string) => {
        if (url.includes('/api/study-groups')) {
          return Promise.resolve({ data: [] });
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
        expect(screen.getByText(/No groups found. Go to the Match page to join one or chat with someone to create one./i)).toBeInTheDocument();
      });
    });
  
    it('should highlight selected group in the list', async () => {
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
        const mathGroupItem = screen.getByText('Math Group');
      });
    });
  
    it('should show loading spinner while fetching groups', async () => {
      // Delay the API response to test loading state
      require('axios').default.get.mockImplementationOnce(() => new Promise(() => {}));
      
      renderGroups();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  
    it('should display group information when a group is selected', async () => {
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
        expect(screen.getByTestId('study-group-panel')).toBeInTheDocument();
        expect(screen.queryByText('Please select a group')).not.toBeInTheDocument();
      });
    });


    describe('Groups Component Initialization and Core Functionality', () => {
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
            new URLSearchParams('groupId=1'),
            jest.fn()
          ]);
          
          // Mock console.log to track calls
          jest.spyOn(console, 'log').mockImplementation(() => {});
          jest.spyOn(console, 'error').mockImplementation(() => {});
          
          // Clear all mocks
          jest.clearAllMocks();
        });
      
        afterEach(() => {
          jest.restoreAllMocks();
        });
      
        const renderGroups = (initialEntries = ['/groups?groupId=1']) => {
          return render(
            <MemoryRouter initialEntries={initialEntries}>
              <Groups />
            </MemoryRouter>
          );
        };
      
        describe('Initial Render and Data Fetching', () => {
        
      
          it('should set initial states correctly when data is fetched', async () => {
            jest.spyOn(axios, 'get').mockImplementation((url: string) => {
              if (url.includes('/api/study-groups/1')) {
                return Promise.resolve({ data: { studyGroup: mockSelectedGroup } });
              }
              if (url.includes('/api/currentUser')) {
                return Promise.resolve({ data: mockCurrentUser });
              }
              if (url.includes('/api/study-groups')) {
                return Promise.resolve({ data: mockGroups });
              }
              return Promise.reject(new Error('Unexpected URL'));
            });
      
            await act(async () => {
              renderGroups();
            });
      
            await waitFor(() => {
              expect(screen.getByTestId('study-group-info')).toBeInTheDocument();
              expect(screen.getAllByRole('listitem')).toHaveLength(2); // Two groups in list
            });
          });
      
          it('should handle missing selectedGroupId gracefully', async () => {
            (useSearchParams as jest.Mock).mockReturnValue([
              new URLSearchParams(''),
              jest.fn()
            ]);
      
            jest.spyOn(axios, 'get').mockImplementation((url: string) => {
              if (url.includes('/api/currentUser')) {
                return Promise.resolve({ data: mockCurrentUser });
              }
              if (url.includes('/api/study-groups')) {
                return Promise.resolve({ data: mockGroups });
              }
              return Promise.reject(new Error('Unexpected URL'));
            });
      
            await act(async () => {
              renderGroups(['/groups']);
            });
      
            await waitFor(() => {
              expect(screen.getByText('Please select a group')).toBeInTheDocument();
              expect(screen.getAllByRole('listitem')).toHaveLength(2); // Groups still loaded
            });
          });
      
          it('should set edit mode when tab param is "true"', async () => {
            (useSearchParams as jest.Mock).mockReturnValue([
              new URLSearchParams('groupId=1&tab=true'),
              jest.fn()
            ]);
      
            jest.spyOn(axios, 'get').mockImplementation((url: string) => {
              if (url.includes('/api/study-groups/1')) {
                return Promise.resolve({ data: { studyGroup: mockSelectedGroup } });
              }
              if (url.includes('/api/currentUser')) {
                return Promise.resolve({ data: mockCurrentUser });
              }
              if (url.includes('/api/study-groups')) {
                return Promise.resolve({ data: mockGroups });
              }
              return Promise.reject(new Error('Unexpected URL'));
            });
      
            await act(async () => {
              renderGroups(['/groups?groupId=1&tab=true']);
            });
      
            await waitFor(() => {
              expect(console.log).toHaveBeenCalledWith('PRINT EDIT', true);
            });
          });
      
          it('should clear search params after loading', async () => {
            const mockNavigate = jest.fn();
            jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);
      
            jest.spyOn(axios, 'get').mockImplementation((url: string) => {
              if (url.includes('/api/study-groups/1')) {
                return Promise.resolve({ data: { studyGroup: mockSelectedGroup } });
              }
              if (url.includes('/api/currentUser')) {
                return Promise.resolve({ data: mockCurrentUser });
              }
              if (url.includes('/api/study-groups')) {
                return Promise.resolve({ data: mockGroups });
              }
              return Promise.reject(new Error('Unexpected URL'));
            });
      
            await act(async () => {
              renderGroups(['/groups?groupId=1']);
            });
      
            expect(mockNavigate).toHaveBeenCalledWith('/groups', { replace: true });
          });
        });
        /*
      
        describe('State Management Functions', () => {
          beforeEach(async () => {
            jest.spyOn(axios, 'get').mockImplementation((url: string) => {
              if (url.includes('/api/study-groups/1')) {
                return Promise.resolve({ data: { studyGroup: mockSelectedGroup } });
              }
              if (url.includes('/api/currentUser')) {
                return Promise.resolve({ data: mockCurrentUser });
              }
              if (url.includes('/api/study-groups')) {
                return Promise.resolve({ data: mockGroups });
              }
              return Promise.reject(new Error('Unexpected URL'));
            });
      
            await act(async () => {
              renderGroups();
            });
          });
      
          it('should update users list when updateUsers is called', async () => {
            await waitFor(() => {
              expect(screen.getByText('Math Group')).toBeInTheDocument();
            });
      
            const initialUsersCount = mockSelectedGroup.users.length;
            
            // Simulate updating users by removing one
            act(() => {
              // This would normally be called from a child component
              // For test purposes, we call it directly
              const groupsInstance = screen.getByTestId('groups-component');
              if (groupsInstance) {
                // @ts-ignore - accessing component internals for test
                groupsInstance.updateUsers(2); // Remove user with ID 2
              }
            });
      
            await waitFor(() => {
              expect(console.log).toHaveBeenCalledWith(
                'Updated selected group users:', 
                expect.arrayContaining([expect.objectContaining({ id: 1 })])
              );
              expect(console.log).not.toHaveBeenCalledWith(
                'Updated selected group users:', 
                expect.arrayContaining([expect.objectContaining({ id: 2 })])
              );
            });
          });
      
          it('should update group profile picture when updatePFP is called', async () => {
            const newProfilePic = 'new-math-pic.jpg';
            
            act(() => {
              // This would normally be called from a child component
              // For test purposes, we call it directly
              const groupsInstance = screen.getByTestId('groups-component');
              if (groupsInstance) {
                // @ts-ignore - accessing component internals for test
                groupsInstance.updatePFP(1, newProfilePic); // Update chatID 1
              }
            });
      
            await waitFor(() => {
              const images = screen.getAllByRole('img');
              expect(images[0]).toHaveAttribute('src', newProfilePic);
            });
          });
      
          it('should update group name when updateChatName is called', async () => {
            const newGroupName = 'Advanced Math Group';
            
            act(() => {
              // This would normally be called from a child component
              // For test purposes, we call it directly
              const groupsInstance = screen.getByTestId('groups-component');
              if (groupsInstance) {
                // @ts-ignore - accessing component internals for test
                groupsInstance.updateChatName(1, newGroupName); // Update chatID 1
              }
            });
      
            await waitFor(() => {
              expect(screen.getByText(newGroupName)).toBeInTheDocument();
            });
          });
        });
      
        describe('removeUser Functionality', () => {
          beforeEach(async () => {
            jest.spyOn(axios, 'get').mockImplementation((url: string) => {
              if (url.includes('/api/study-groups/1')) {
                return Promise.resolve({ data: { studyGroup: mockSelectedGroup } });
              }
              if (url.includes('/api/currentUser')) {
                return Promise.resolve({ data: mockCurrentUser });
              }
              if (url.includes('/api/study-groups')) {
                return Promise.resolve({ data: mockGroups });
              }
              return Promise.reject(new Error('Unexpected URL'));
            });
      
            await act(async () => {
              renderGroups();
            });
          });
      
          it('should remove user from UI when removeUser succeeds', async () => {
            jest.spyOn(axios, 'delete').mockResolvedValue({ status: 200 });
            jest.spyOn(axios, 'get').mockResolvedValueOnce({ status: 200, data: { studyGroup: mockSelectedGroup } });
      
            await act(async () => {
              // Simulate removing a user
              const groupsInstance = screen.getByTestId('groups-component');
              if (groupsInstance) {
                // @ts-ignore - accessing component internals for test
                groupsInstance.removeUser(2, 1); // Remove user 2 from group 1
              }
            });
      
            await waitFor(() => {
              expect(console.log).toHaveBeenCalledWith(
                'Updated selected group users:', 
                expect.arrayContaining([expect.objectContaining({ id: 1 })])
              );
              expect(console.log).not.toHaveBeenCalledWith(
                'Updated selected group users:', 
                expect.arrayContaining([expect.objectContaining({ id: 2 })])
              );
            });
          });
      
          it('should remove group from list if current user is removed', async () => {
            jest.spyOn(axios, 'delete').mockResolvedValue({ status: 200 });
            // Simulate group no longer exists after removal
            jest.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Not found'));
      
            await act(async () => {
              // Simulate current user removing themselves
              const groupsInstance = screen.getByTestId('groups-component');
              if (groupsInstance) {
                // @ts-ignore - accessing component internals for test
                groupsInstance.removeUser(1, 1); // Remove current user (id 1) from group 1
              }
            });
      
            await waitFor(() => {
              expect(screen.queryByText('Math Group')).not.toBeInTheDocument();
              expect(screen.getByText('Please select a group')).toBeInTheDocument();
            });
          });
      
          it('should handle errors when removing a user fails', async () => {
            jest.spyOn(axios, 'delete').mockRejectedValue(new Error('Failed to remove user'));
      
            await act(async () => {
              const groupsInstance = screen.getByTestId('groups-component');
              if (groupsInstance) {
                // @ts-ignore - accessing component internals for test
                groupsInstance.removeUser(2, 1);
              }
            });
      
            await waitFor(() => {
              expect(console.error).toHaveBeenCalledWith('Error deleting user:', expect.any(Error));
              // Verify UI wasn't changed
              expect(screen.getByText('Math Group')).toBeInTheDocument();
            });
          });
      
          it('should not proceed with removal if groupId or userId is missing', async () => {
            const deleteSpy = jest.spyOn(axios, 'delete');
      
            await act(async () => {
              const groupsInstance = screen.getByTestId('groups-component');
              if (groupsInstance) {
                // @ts-ignore - accessing component internals for test
                groupsInstance.removeUser(null, 1);
                // @ts-ignore - accessing component internals for test
                groupsInstance.removeUser(2, null);
              }
            });
      
            expect(deleteSpy).not.toHaveBeenCalled();
            expect(console.error).toHaveBeenCalledWith('User ID is missing.');
            expect(console.error).toHaveBeenCalledWith('Group ID is missing.');
          });
        });
      });
        */
  });
});