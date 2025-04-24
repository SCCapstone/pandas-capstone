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
    Link: ({ children, to }: any) => <a href={to}>{children}</a> // Better mock
  }));


// Add this at the top of your test file
global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ studyHabitTags: ['LOW', 'MEDIUM', 'HIGH'] }),
    })
  ) as jest.Mock;

  describe('StudyGroupInfo Component Behavioral Tests', () => {
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
  

      it('should show default profile picture when profilePic is null', async () => {
        const noPicGroup = {
          ...mockStudyGroup,
          profilePic: null
        };
      
        (axios.get as jest.Mock).mockImplementationOnce((url: string) => 
          url.includes('/api/study-groups/chat') 
            ? Promise.resolve({ data: noPicGroup }) 
            : Promise.reject(new Error('Unexpected URL'))
        );
      
        await act(async () => {
          renderComponent();
        });
      
        await waitFor(() => {
          const img = screen.getByAltText('Profile');
          expect(img).toHaveAttribute('src', expect.stringContaining('circle_busts-in-silhouette.png'));
        });
      });
      
      it('should show provided profile picture when available', async () => {
        await act(async () => {
          renderComponent();
        });
      
        await waitFor(() => {
          const img = screen.getByAltText('Profile');
          expect(img).toHaveAttribute('src', 'math-group.jpg');
        });
      });


      it('should log error to console when API fails', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        (axios.get as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      
        await act(async () => {
          renderComponent();
        });
      
        await waitFor(() => {
          expect(consoleSpy).toHaveBeenCalledWith('Error fetching study group:', expect.any(Error));
        });
      
        consoleSpy.mockRestore();
      });
      
    


      
    it('should allow user to toggle between view and edit modes', async () => {
      await act(async () => {
        renderComponent();
      });
  
      // Initial view mode
      expect(screen.getByText('Chat')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.queryByTestId('edit-study-group')).not.toBeInTheDocument();
  
      // Click edit button
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);
  
      // Now in edit mode
      await waitFor(() => {
        expect(screen.getByTestId('edit-study-group')).toBeInTheDocument();
        expect(screen.getByText('Close Edit')).toBeInTheDocument();
      });
  
      // Click close button
      const closeButton = screen.getByText('Close Edit');
      fireEvent.click(closeButton);
  
      // Back to view mode
      await waitFor(() => {
        expect(screen.queryByTestId('edit-study-group')).not.toBeInTheDocument();
        expect(screen.getByText('Edit')).toBeInTheDocument();
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
  
    it('should render Availability button that links to the group schedule page', async () => {
        // Render the component with test props
        await act(async () => {
          render(
            <MemoryRouter>
              <StudyGroupInfo {...defaultProps} groupId={123} />
            </MemoryRouter>
          );
        });
      
        // Wait for content to load
        await waitFor(() => {
          // Find the button by test ID
          const availabilityButton = screen.getByTestId('avail-button');
          
          // Verify button text
          expect(availabilityButton).toHaveTextContent('Availability');
          
          // Verify the button is wrapped in a Link component
          const linkElement = availabilityButton.closest('a');
          expect(linkElement).toBeInTheDocument();
          
          // Verify the Link points to the correct URL
          expect(linkElement).toHaveAttribute('href', '/studyGroup/123/schedule');
        });
      });
  
    it('should display loading state while fetching data', async () => {
      // Delay the API response
      (axios.get as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));
  
      renderComponent();
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      
      // Clean up by resolving the promise
      await act(async () => {
        (axios.get as jest.Mock).mockImplementationOnce(() => Promise.resolve({ data: mockStudyGroup }));
      });
    });
  
  
    it('should display group information correctly after loading', async () => {
      await act(async () => {
        renderComponent();
      });
  
      await waitFor(() => {
        expect(screen.getByText('Math Study Group')).toBeInTheDocument();
        expect(screen.getByText('Group for advanced calculus')).toBeInTheDocument();
        expect(screen.getByText('Mathematics')).toBeInTheDocument();
        expect(screen.getByText('High')).toBeInTheDocument();
        expect(screen.getByText('Members:')).toBeInTheDocument();
      });
  
      // Verify profile picture
      const img = screen.getByAltText('Profile');
      expect(img).toHaveAttribute('src', 'math-group.jpg');
    });
  
    it('should display default profile picture when none is provided', async () => {
      const noPicGroup = {
        ...mockStudyGroup,
        profilePic: null
      };
      
      (axios.get as jest.Mock).mockImplementationOnce((url: string) => {
        if (url.includes('/api/study-groups/chat')) {
          return Promise.resolve({ data: noPicGroup });
        }
        return Promise.reject(new Error('Unexpected URL'));
      });
  
      await act(async () => {
        renderComponent();
      });
  
      await waitFor(() => {
        const img = screen.getByAltText('Profile');
        expect(img).toHaveAttribute('src', 
          'https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_busts-in-silhouette.png');
      });
    });
  
    it('should display N/A when ideal match factor is missing', async () => {
      const noFactorGroup = {
        ...mockStudyGroup,
        ideal_match_factor: null
      };
      
      (axios.get as jest.Mock).mockImplementationOnce((url: string) => {
        if (url.includes('/api/study-groups/chat')) {
          return Promise.resolve({ data: noFactorGroup });
        }
        return Promise.reject(new Error('Unexpected URL'));
      });
  
      await act(async () => {
        renderComponent();
      });
  
      await waitFor(() => {
        expect(screen.getByText('N/A')).toBeInTheDocument();
      });
    });

  
    it('should start in edit mode when isItEdit prop is true', async () => {
      await act(async () => {
        renderComponent({ isItEdit: true });
      });
  
      expect(screen.getByTestId('edit-study-group')).toBeInTheDocument();
    });
  
    it('should render user container with correct props', async () => {
      await act(async () => {
        renderComponent();
      });
  
      await waitFor(() => {
        expect(screen.getByTestId('group-user-container')).toBeInTheDocument();
        expect(screen.getByText('Group User Container')).toBeInTheDocument();
      });
    });
  });