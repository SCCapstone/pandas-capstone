

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditStudyGroup from '../../components/EditStudyGroup';
import axios from 'axios';
import { useCourses } from '../../utils/format'; 


// Mock axios with proper ESM handling
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
  },
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

// Mock format utilities
jest.mock('../../utils/format', () => ({
  __esModule: true,
  ...jest.requireActual('../../utils/format'), // Keep other actual implementations
  useCourses: jest.fn(() => ({
    courses: ['Mathematics', 'Physics', 'Chemistry'],
    isLoadingCourses: false,
    error: null,
  })),
  formatEnum: jest.fn((str) => str), // Simple mock that returns the input
  normalizeCourseInput: jest.fn((str) => str), // Mock if needed
  selectStyles: {}, // Mock if needed
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
  const mockOnGroupUpdated = jest.fn();
  const mockStudyGroup = {
    name: 'Initial Group Name',
    description: 'Initial description',
    subject: 'Initial Subject',
    chatID: 123,
    ideal_match_factor: 'MORNING_PERSON',
    profilePic: 'initial-pic.jpg',
  };

  let mockFileReaderInstance: any;

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

    // Setup FileReader
    mockFileReaderInstance = {
      readAsDataURL: jest.fn(function(this: any) {
        this.result = 'data:image/png;base64,mock-data';
        this.onload && this.onload();
      }),
      onload: jest.fn(),
      onerror: jest.fn(),
      result: '',
      readyState: 0,
      error: null,
      abort: jest.fn(),
      DONE: 2,
      EMPTY: 0,
      LOADING: 1,
    };

    global.FileReader = jest.fn(() => mockFileReaderInstance) as any;
    (global.FileReader as any).EMPTY = 0;
    (global.FileReader as any).LOADING = 1;
    (global.FileReader as any).DONE = 2;

     (useCourses as jest.Mock).mockReturnValue({
          courses: ['Mathematics', 'Physics', 'Chemistry'],
          isLoadingCourses: false,
          error: null,
        });

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
  
  
    it('should update ideal match factor when a new option is selected', async () => {
      renderComponent();
      
      // Wait for initial data to load and verify initial state
      await waitFor(() => {
        expect(screen.getByDisplayValue('Initial Group Name')).toBeInTheDocument();
        expect(screen.getByText('Ideal Match Factor:')).toBeInTheDocument();
      });

      await waitFor(() => {
          const select = screen.getByTestId('mock-select');
          fireEvent.change(select, { target: { value: 'NIGHT_OWL' } });
          expect(select).toHaveValue('NIGHT_OWL');
        });
    
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
        const img = screen.getByAltText('Selected Profile');
        expect(img).toHaveAttribute('src', 'initial-pic.jpg');
      });
    });
  

    it('should allow clicking on profile picture to trigger file input', async () => {
      renderComponent();
      
      await waitFor(() => {
        const img = screen.getByAltText('Selected Profile');
        fireEvent.click(img);
        // Verify the file input click was triggered
        // This is indirect since we can't directly access the hidden input
        expect(document.getElementById('emoji-pfp-upload')).toBeInTheDocument();
      });
    });
  
    
});


});
