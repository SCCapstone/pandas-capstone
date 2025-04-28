
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateStudyGroup from '../../components/CreateStudyGroup';
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
      post: jest.fn().mockResolvedValue({ data: {} }),
      put: jest.fn()
    }
  }));

// Mock CustomAlert
jest.mock('../../components/CustomAlert', () => ({
  __esModule: true,
  default: ({ text }: { text: string }) => <div data-testid="custom-alert">{text}</div>
}));

jest.mock('react-select', () => ({
    __esModule: true,
    default: ({ options, value, onChange }: any) => {
      return (
        <select
          data-testid="mock-select"
          value={value?.value}
          onChange={(e) => {
            const selected = options.find(
              (opt: any) => opt.value === e.target.value
            );
            onChange(selected);
          }}
        >
          {options.map(({ value, label }: any) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      );
    }
  }));

// Add with your other mocks
jest.mock('../../components/ProfilePictureModal', () => ({
    __esModule: true,
    default: ({ isOpen, onRequestClose, onSelect }: any) => (
      isOpen ? (
        <div data-testid="profile-picture-modal">
          <button onClick={() => onSelect('😊', 'emoji-url.jpg')}>Select Emoji</button>
          <button onClick={onRequestClose}>Close</button>
        </div>
      ) : null
    )
  }));
// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ studyHabitTags: ['LOW', 'MEDIUM', 'HIGH'] }),
  })
) as jest.Mock;

describe('CreateStudyGroup Component Behavioral Tests', () => {
    const mockStudyGroup = {
      name: 'Math Study Group',
      description: 'Group for advanced calculus',
      subject: 'Mathematics',
      chatID: 1,
      ideal_match_factor: 'HIGH',
      profilePic: 'math-group.jpg',
      studyGroupID: 124
    };
  
    const mockOnClose = jest.fn();
    
  const mockUpdateChatName = jest.fn();
  const mockHandleCreateStudyGroup = jest.fn().mockResolvedValue(123);
  const mockSetCurrentGroupId = jest.fn();
  const mockFetchChatPfps = jest.fn();

  const defaultProps = {
    chatID: 1,
    onClose: mockOnClose,
    updateChatName: mockUpdateChatName,
    handleCreateStudyGroup: mockHandleCreateStudyGroup,
    setCurrentGroupId: mockSetCurrentGroupId,
    fetchChatPfps: mockFetchChatPfps
  }
  
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
          if (url.includes('/api/study-groups/chat')) {
            return Promise.resolve({ data: mockStudyGroup });
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
    
        });
    
        afterEach(() => {
            jest.clearAllMocks();
            jest.useRealTimers();
          });

      const renderComponent = (props = {}) => {
        return render(
          <MemoryRouter>
            <CreateStudyGroup {...defaultProps} {...props} />
          </MemoryRouter>
        );
      };

    
    it('should proceed with API calls when token exists', async () => {
        // Token is already mocked in beforeEach
        await act(async () => {
          renderComponent();
        });
    
        await waitFor(() => {
          // Verify API calls were made
          expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('/api/study-groups/chat/1'),
            expect.objectContaining({
              headers: { Authorization: 'Bearer test-token' }
            })
          );
          
          // Verify no auth error is shown
          expect(screen.queryByText('You need to be logged in')).not.toBeInTheDocument();
        });
    });

    describe('useEffect with chatID dependency', () => {
        it('should fetch study group data when chatID changes', async () => {
          const { rerender } = render(
            <MemoryRouter>
              <CreateStudyGroup {...defaultProps} chatID={1} />
            </MemoryRouter>
          );
      
          await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('/api/study-groups/chat/1'),
                expect.objectContaining({
                  headers: { Authorization: 'Bearer test-token' }
                })
              );
          });
      
          // Clear mocks before testing with new chatID
          (axios.get as jest.Mock).mockClear();
      
          // Change chatID and rerender
          await act(async () => {
            rerender(
              <MemoryRouter>
                <CreateStudyGroup {...defaultProps} chatID={2} />
              </MemoryRouter>
            );
          });
      
          await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('/api/study-groups/chat/2'),
                expect.objectContaining({
                  headers: { Authorization: 'Bearer test-token' }
                })
              );
            expect(axios.get).not.toHaveBeenCalledWith(expect.stringContaining('/api/study-groups/chat/1'));
          });
        });
      });


      


    describe('handleEmojiSelect', () => {
        it('should update image preview and URL, then close modal', async () => {
          await act(async () => {
            renderComponent();
          });
      
          // Open modal first
          fireEvent.click(screen.getByAltText('Profile'));
          
          // Mock emoji selection
          const testEmoji = '😊';
          const testURL = 'emoji-url.jpg';
          
          await act(async () => {
            fireEvent.click(screen.getByText('Select Emoji')); // This triggers handleEmojiSelect
          });
      
          // Verify state updates
          await waitFor(() => {
            expect(screen.getByAltText('Selected Profile')).toHaveAttribute('src', testURL);
            expect(screen.queryByTestId('profile-picture-modal')).not.toBeInTheDocument();
          });
        });
      });


    it('should open profile picture modal when file input is changed', async () => {
        await act(async () => {
          renderComponent();
        });
      
        // Initially, modal should not be open
        expect(screen.queryByTestId('profile-picture-modal')).not.toBeInTheDocument();
      
        // Get the hidden file input
        const fileInput = screen.getByTestId('image-upload-input'); // You'll need to add data-testid="image-upload-input" to your input element
      
        // Create a mock file
        const file = new File(['(⌐□_□)'], 'test.png', { type: 'image/png' });
      
        // Trigger change event
        await act(async () => {
          fireEvent.change(fileInput, { target: { files: [file] } });
        });
      
        // Modal should now be open
        await waitFor(() => {
          expect(screen.getByTestId('profile-picture-modal')).toBeInTheDocument();
        });
      });

      it('should open profile picture modal when default profile image is clicked', async () => {
        await act(async () => {
          renderComponent();
        });
      
        // Find the default profile image by alt text
        const defaultProfileImage = screen.getByAltText('Profile');
        
        // Verify modal is not open initially
        expect(screen.queryByTestId('profile-picture-modal')).not.toBeInTheDocument();
      
        // Click the image
        await act(async () => {
          fireEvent.click(defaultProfileImage);
        });
      
        // Verify modal is now open
        await waitFor(() => {
          expect(screen.getByTestId('profile-picture-modal')).toBeInTheDocument();
        });
      });



    
      it('should close profile picture modal when close button is clicked', async () => {
        await act(async () => {
          renderComponent();
        });
      
        // Open modal
        const profileImage = screen.getByAltText('Profile');
        fireEvent.click(profileImage);
      
        // Verify modal is open
        await waitFor(() => {
          expect(screen.getByTestId('profile-picture-modal')).toBeInTheDocument();
        });
      
        // Close modal
        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);
      
        // Verify modal is closed
        await waitFor(() => {
          expect(screen.queryByTestId('profile-picture-modal')).not.toBeInTheDocument();
        });
      });

    // Behavioral Tests
    it('should allow typing in the study group name field', async () => {
      await act(async () => {
        renderComponent();
      });
  
      const nameInput = screen.getByLabelText('Study Group Name:');
      fireEvent.change(nameInput, { target: { value: 'New Study Group' } });
  
      await waitFor(() => {
        expect(nameInput).toHaveValue('New Study Group');
      });
    });
  
    it('should allow typing in the bio field', async () => {
      await act(async () => {
        renderComponent();
      });
  
      const bioInput = screen.getByLabelText('Bio:');
      fireEvent.change(bioInput, { target: { value: 'New description' } });
  
      await waitFor(() => {
        expect(bioInput).toHaveValue('New description');
      });
    });
  
    it('should allow typing in the course field', async () => {
      await act(async () => {
        renderComponent();
      });
  
      const courseInput = screen.getByLabelText('Relevant Course:');
      fireEvent.change(courseInput, { target: { value: 'CS101' } });
  
      await waitFor(() => {
        expect(courseInput).toHaveValue('CS101');
      });
    });
  
    it('should open profile picture modal when profile image is clicked', async () => {
      await act(async () => {
        renderComponent();
      });
  
      const profileImage = screen.getByAltText('Profile');
      fireEvent.click(profileImage);
  
      await waitFor(() => {
        expect(screen.getByTestId('profile-picture-modal')).toBeInTheDocument();
      });
    });
  
    it('should close profile picture modal when close button is clicked', async () => {
      await act(async () => {
        renderComponent();
      });
  
      // Open modal
      fireEvent.click(screen.getByAltText('Profile'));
      
      // Close modal
      fireEvent.click(screen.getByText('Close'));
  
      await waitFor(() => {
        expect(screen.queryByTestId('profile-picture-modal')).not.toBeInTheDocument();
      });
    });
  
    it('should update profile picture when an emoji is selected', async () => {
      await act(async () => {
        renderComponent();
      });
  
      // Open modal
      fireEvent.click(screen.getByAltText('Profile'));
      
      // Select emoji
      fireEvent.click(screen.getByText('Select Emoji'));
  
      await waitFor(() => {
        expect(screen.getByAltText('Selected Profile')).toHaveAttribute('src', 'emoji-url.jpg');
      });
    });
  
    it('should show validation error when trying to save with empty name', async () => {
      await act(async () => {
        renderComponent();
      });
  
      // Clear name field
      fireEvent.change(screen.getByLabelText('Study Group Name:'), { 
        target: { value: '' } 
      });
  
      // Click save
      fireEvent.click(screen.getByText('Save'));
  
      await waitFor(() => {
        expect(screen.getByText('Study group name is required')).toBeInTheDocument();
      });
    });
  
    it('should close the form when cancel button is clicked', async () => {
      await act(async () => {
        renderComponent();
      });
  
      fireEvent.click(screen.getByText('Cancel'));
  
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  
    it('should show success alert when study group is saved successfully', async () => {
      (axios.put as jest.Mock).mockResolvedValueOnce({ data: {} });
      
      await act(async () => {
        renderComponent();
      });
  
      // Fill out required fields
      fireEvent.change(screen.getByLabelText('Study Group Name:'), {
        target: { value: 'New Group Name' }
      });
      fireEvent.change(screen.getByTestId('mock-select'), {
        target: { value: 'MEDIUM' }
      });
  
      // Click save
      await act(async () => {
        fireEvent.click(screen.getByText('Save'));
      });
  
      await waitFor(() => {
        expect(screen.getByText('Study group updated')).toBeInTheDocument();
      });
    });
  
    it('should show error alert when study group save fails', async () => {
      (axios.put as jest.Mock).mockRejectedValueOnce(new Error('Save failed'));
      
      await act(async () => {
        renderComponent();
      });
  
      // Fill out required fields
      fireEvent.change(screen.getByLabelText('Study Group Name:'), {
        target: { value: 'New Group Name' }
      });
      fireEvent.change(screen.getByTestId('mock-select'), {
        target: { value: 'MEDIUM' }
      });
  
      // Click save
      await act(async () => {
        fireEvent.click(screen.getByText('Save'));
      });
  
      await waitFor(() => {
        expect(screen.getByText('Failed to save study group')).toBeInTheDocument();
      });
    });

  
    it('should update chat name when study group name is changed and saved', async () => {
      (axios.put as jest.Mock).mockResolvedValueOnce({ data: {} });
      
      await act(async () => {
        renderComponent();
      });
  
      const newName = 'Updated Group Name';
      fireEvent.change(screen.getByLabelText('Study Group Name:'), {
        target: { value: newName }
      });
      fireEvent.change(screen.getByTestId('mock-select'), {
        target: { value: 'MEDIUM' }
      });
  
      await act(async () => {
        fireEvent.click(screen.getByText('Save'));
      });
  
      await waitFor(() => {
        expect(mockUpdateChatName).toHaveBeenCalledWith(1, newName);
      });
    });
  });
