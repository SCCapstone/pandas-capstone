import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditStudyGroup from '../../components/EditStudyGroup';
import axios from 'axios';


// Mock axios with proper ESM handling
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));


// Mock react-select
jest.mock('react-select', () => ({ 
  options, 
  value, 
  onChange, 
  ...props 
}: {
  options: any[];
  value: any;
  onChange: (value: any) => void;
  [key: string]: any;
}) => {
  return (
    <select
      data-testid="mock-react-select"
      value={value?.value || ''}
      onChange={(e) => {
        const selectedOption = options.find(opt => opt.value === e.target.value);
        onChange(selectedOption);
      }}
      {...props}
    >
      <option value="">Select an option</option>
      {options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
});

// Mock CustomAlert
jest.mock('../../components/CustomAlert', () => ({
  __esModule: true,
  default: ({ text }: { text: string }) => (
    <div data-testid="custom-alert">{text}</div>
  ),
}));

// Mock ProfilePictureModal
jest.mock('../../components/ProfilePictureModal', () => ({
  __esModule: true,
  default: () => <div data-testid="profile-picture-modal" />,
}));

describe('EditStudyGroup Component Behavioral Tests', () => {
  const mockOnClose = jest.fn();
  const mockUpdateChatName = jest.fn();
  const mockUpdatePFP = jest.fn();
  const mockOnRemoveUser = jest.fn();
  const mockUpdateUsers = jest.fn();
  const mockStudyGroup = {
    name: 'Initial Group Name',
    description: 'Initial description',
    subject: 'Initial Subject',
    chatID: 123,
    ideal_match_factor: 'MORNING_PERSON',
    profilePic: 'initial-pic.jpg',
  };

  beforeEach(() => {
    // Setup localStorage mock
    Storage.prototype.getItem = jest.fn(() => 'fake-token');
    
    // Setup axios mocks
    require('axios').default.get.mockResolvedValue({ data: mockStudyGroup });
    require('axios').default.put.mockResolvedValue({ data: mockStudyGroup });
    
    // Setup fetch mock for enums
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          studyHabitTags: ['MORNING_PERSON', 'NIGHT_OWL', 'VISUAL_LEARNER']
        }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  describe('EditStudyGroup Component Behavioral Tests', () => {
    const mockOnClose = jest.fn();
    const mockUpdateChatName = jest.fn();
    const mockOnRemoveUser = jest.fn();
    const mockUpdateUsers = jest.fn();
    const mockOnGroupUpdated = jest.fn();
  
    const mockStudyGroup = {
      name: 'Initial Group Name',
      description: 'Initial description',
      subject: 'Initial Subject',
      chatID: 123,
      ideal_match_factor: 'MORNING_PERSON',
      profilePic: 'initial-pic.jpg'
    };
  
    const mockEnumOptions = {
      studyHabitTags: ['MORNING_PERSON', 'NIGHT_OWL', 'VISUAL_LEARNER']
    };
  
    beforeEach(() => {
      // Setup localStorage mock
      Storage.prototype.getItem = jest.fn(() => 'test-token');
      
      // Mock axios responses
      require('axios').default.get.mockImplementation((url:any) => {
        if (url.includes('/api/study-groups/chat')) {
          return Promise.resolve({ data: mockStudyGroup });
        }
        return Promise.reject(new Error('Unexpected URL'));
      });
      
      require('axios').default.put.mockResolvedValue({ data: mockStudyGroup });
      
      // Mock fetch for enums
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(mockEnumOptions),
        })
      ) as jest.Mock;
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    const renderComponent = () => {
      return render(
        <EditStudyGroup
          chatID={1}
          onClose={mockOnClose}
          updateChatName={mockUpdateChatName}
          updatePFP={mockUpdatePFP}
          groupId={1}
          currentId={1}
          users={[]}
          onRemoveUser={mockOnRemoveUser}
          updateUsers={mockUpdateUsers}
          onGroupUpdated={mockOnGroupUpdated}
        />
      );
    };
  
    it('should load and display initial study group data', async () => {
      renderComponent();
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Initial Group Name')).toBeInTheDocument();
      });
  
      expect(screen.getByDisplayValue('Initial description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Initial Subject')).toBeInTheDocument();
      //expect(screen.getByTestId('mock-select')).toHaveValue('MORNING_PERSON');
    });
  
  /*
  
    it('should update ideal match factor when a new option is selected', async () => {
      renderComponent();
      
      // Wait for the component to finish loading and rendering
      await waitFor(() => {
        // First verify the initial data loaded
        expect(screen.getByDisplayValue('Initial Group Name')).toBeInTheDocument();
        // Then verify the select is present
        expect(screen.getByTestId('mock-react-select')).toBeInTheDocument();
      });
    
      // Get the select element
      const selectElement = screen.getByTestId('mock-react-select');
      
      // Verify initial value
      expect(selectElement).toHaveValue('MORNING_PERSON');
    
      // Change the value
      fireEvent.change(selectElement, { target: { value: 'NIGHT_OWL' } });
    
      // Verify the value changed
      expect(selectElement).toHaveValue('NIGHT_OWL');
    });
  
  
  
  
    it('should close when Cancel button is clicked', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });
  
      fireEvent.click(screen.getByText('Cancel'));
      expect(mockOnClose).toHaveBeenCalled();
    });


    it('should show error alert when saving without a group name', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Initial Group Name')).toBeInTheDocument();
      });
  
      // Clear the name field
      fireEvent.change(screen.getByDisplayValue('Initial Group Name'), {
        target: { value: '' }
      });
  
      fireEvent.click(screen.getByText('Save'));
  
      await waitFor(() => {
        expect(screen.getByText('Study group name is required')).toBeInTheDocument();
      });
    });



  
    it('should update the description when input changes', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Initial description')).toBeInTheDocument();
      });
  
      const newDescription = 'Updated description text';
      fireEvent.change(screen.getByDisplayValue('Initial description'), {
        target: { value: newDescription }
      });
  
      expect(screen.getByDisplayValue(newDescription)).toBeInTheDocument();
    });

  
    it('should update the subject when input changes', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Initial Subject')).toBeInTheDocument();
      });
  
      const newSubject = 'Updated subject text';
      fireEvent.change(screen.getByDisplayValue('Initial Subject'), {
        target: { value: newSubject }
      });
  
      expect(screen.getByDisplayValue(newSubject)).toBeInTheDocument();
    });

  
    it('should show success alert when save is successful', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Save')).toBeInTheDocument();
      });
  
      fireEvent.click(screen.getByText('Save'));
  
      await waitFor(() => {
        expect(screen.getByText('Study group updated')).toBeInTheDocument();
      });
    });

  
  

  
    it('should display the current profile picture', async () => {
      renderComponent();
      
      await waitFor(() => {
        const img = screen.getByAltText('Profile');
        expect(img).toHaveAttribute('src', 'initial-pic.jpg');
      });
    });
  

    it('should allow clicking on profile picture to trigger file input', async () => {
      renderComponent();
      
      await waitFor(() => {
        const img = screen.getByAltText('Profile');
        fireEvent.click(img);
        // Verify the file input click was triggered
        // This is indirect since we can't directly access the hidden input
        expect(document.getElementById('image-upload')).toBeInTheDocument();
      });
    });
  
    /*
    describe('Image Upload Tests', () => {
      beforeEach(() => {
        // Mock file reader
        global.FileReader = jest.fn().mockImplementation(() => ({
          readAsDataURL: jest.fn(),
          onload: jest.fn(),
          result: 'mock-image-data',
        }));
      });
    
      it('should handle image selection', async () => {
        renderComponent();
        
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        const input = screen.getByTestId('image-upload') || document.getElementById('image-upload');
        
        if (input) {
          fireEvent.change(input, { target: { files: [file] } });
        }
    
        await waitFor(() => {
          // Verify the image was set in state (indirectly through preview)
          expect(require('axios').default.put).not.toHaveBeenCalled(); // No upload yet
        });
      });
    
      it('should show error when image upload fails', async () => {
        require('axios').default.put.mockRejectedValueOnce(new Error('Upload failed'));
        
        renderComponent();
        
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        const input = screen.getByTestId('image-upload') || document.getElementById('image-upload');
        
        if (input) {
          fireEvent.change(input, { target: { files: [file] } });
        }
    
        fireEvent.click(screen.getByText('Save'));
    
        await waitFor(() => {
          expect(screen.queryByText(/failed to upload image/i)).toBeInTheDocument();
        });
      });
    });*/
    
});


});