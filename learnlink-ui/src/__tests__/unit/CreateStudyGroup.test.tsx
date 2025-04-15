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

describe('CreateStudyGroup Component Unit Tests', () => {
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

  const defaultProps = {
    chatID: 1,
    onClose: mockOnClose,
    updateChatName: mockUpdateChatName,
    handleCreateStudyGroup: mockHandleCreateStudyGroup,
    setCurrentGroupId: mockSetCurrentGroupId
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

  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <CreateStudyGroup {...defaultProps} {...props} />
      </MemoryRouter>
    );
  };

  it('should render loading state initially', async () => {
    // Delay the API response
    require('axios').default.get.mockImplementationOnce(() => new Promise(() => {}));
    
    renderComponent();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should fetch and display study group info', async () => {
    await act(async () => {
      renderComponent();
    });
    
    await waitFor(() => {
      expect(screen.getByLabelText('Study Group Name:')).toHaveValue();
      expect(screen.getByLabelText('Bio:')).toHaveValue();
      expect(screen.getByLabelText('Relevant Course:')).toHaveValue();
    });
  });


  it('should show error when study group creation fails', async () => {
    mockHandleCreateStudyGroup.mockRejectedValueOnce(new Error('Creation failed'));
    
    await act(async () => {
      renderComponent();
    });
  
    // Fill required fields
    fireEvent.change(screen.getByLabelText('Study Group Name:'), {
      target: { value: 'New Group' }
    });
    fireEvent.change(screen.getByTestId('mock-select'), {
      target: { value: 'MEDIUM' }
    });
  
    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });
  
    await waitFor(() => {
      expect(screen.getByText(/Failed to save study group/)).toBeInTheDocument();
    });
  });

  it('should handle emoji selection from profile picture modal', async () => {
    await act(async () => {
      renderComponent();
    });
  
    // Open modal
    fireEvent.click(screen.getByAltText('Profile'));
    
    // Select emoji from modal
    fireEvent.click(screen.getByText('Select Emoji'));
    
    // Verify the image URL was updated
    await waitFor(() => {
      expect(screen.getByAltText('Selected Profile')).toHaveAttribute('src', 'emoji-url.jpg');
    });
  });

  it('should show loading state while fetching data', async () => {
    // Delay the API response
    require('axios').default.get.mockImplementationOnce(() => new Promise(() => {}));
    
    renderComponent();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
 
  it('should show default profile picture when none is provided', async () => {
    const noPicGroup = {
      ...mockStudyGroup,
      profilePic: null
    };
    
    require('axios').default.get.mockImplementationOnce((url: string) => {
      if (url.includes('/api/study-groups/chat')) {
        return Promise.resolve({ data: noPicGroup });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });
  
    await act(async () => {
      renderComponent();
    });
  
    await waitFor(() => {
      expect(screen.getByAltText('Profile')).toHaveAttribute(
        'src',
        'https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_busts-in-silhouette.png'
      );
    });
  });



  it('should handle form submission successfully', async () => {
    // Mock successful API responses
    (axios.put as jest.Mock).mockResolvedValueOnce({ data: {} });
    mockHandleCreateStudyGroup.mockResolvedValueOnce(123);
  
    await act(async () => {
      renderComponent();
    });
  
    // Fill out required fields
    fireEvent.change(screen.getByLabelText('Study Group Name:'), {
      target: { value: 'New Group Name' }
    });
  
    // Mock the select change
    const select = screen.getByTestId('mock-select');
    fireEvent.change(select, { target: { value: 'MEDIUM' } });
  
    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });
  
    // Verify all expected calls
    await waitFor(() => {
      expect(mockHandleCreateStudyGroup).toHaveBeenCalledWith(1);
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/study-groups/chat/1'),
        expect.objectContaining({
          name: 'New Group Name',
          ideal_match_factor: expect.objectContaining({
            value: 'MEDIUM',
            label: expect.any(String)
          })
        }),
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' }
        })
      );
      expect(mockUpdateChatName).toHaveBeenCalledWith(1, 'New Group Name');
    });
  });

  it('should show validation errors for empty fields', async () => {
    await act(async () => {
      renderComponent();
    });
    
    // Clear required fields
    fireEvent.change(screen.getByLabelText('Study Group Name:'), { 
      target: { value: '' } 
    });
    
    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByText('Save'));
    });
    
    await waitFor(() => {
      expect(screen.getByText('Study group name is required')).toBeInTheDocument();
    });
  });

  it('should open profile picture modal when image is clicked', async () => {
    await act(async () => {
      renderComponent();
    });
    
    await waitFor(() => {
      const profileImage = screen.getByAltText('Profile');
      fireEvent.click(profileImage);
      expect(screen.getByTestId('profile-picture-modal')).toBeInTheDocument();
    });
  });

  it('should handle cancel button click', async () => {
    await act(async () => {
      renderComponent();
    });
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Cancel'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should update state when form fields change', async () => {
    await act(async () => {
      renderComponent();
    });
  
    // Option 1: Using getByRole with name (most reliable)
    const nameInput = screen.getByRole('textbox', { name: /study group name/i });
    const bioInput = screen.getByRole('textbox', { name: /bio/i });
    const courseInput = screen.getByRole('textbox', { name: /relevant course/i });
  
    // Test changes
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    fireEvent.change(bioInput, { target: { value: 'New Description' } });
    fireEvent.change(courseInput, { target: { value: 'New Course' } });
  
    await waitFor(() => {
      expect(nameInput).toHaveValue('New Name');
      expect(bioInput).toHaveValue('New Description');
      expect(courseInput).toHaveValue('New Course');
    });
  });
  


  it('should handle ideal match factor selection', async () => {
    await act(async () => {
      renderComponent();
    });
  
    await waitFor(() => {
      const select = screen.getByTestId('mock-select');
      fireEvent.change(select, { target: { value: 'MEDIUM' } });
      expect(select).toHaveValue('MEDIUM');
    });
    });


  it('should set current group ID after fetch', async () => {
    await act(async () => {
      renderComponent();
    });
    
    await waitFor(() => {
      expect(mockSetCurrentGroupId).toHaveBeenCalledWith(mockStudyGroup.studyGroupID);
    });
  });
});