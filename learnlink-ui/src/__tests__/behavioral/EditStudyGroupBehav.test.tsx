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

describe('EditStudyGroup Component Behavioral Tests', () => {
  const mockOnClose = jest.fn();
  const mockUpdateChatName = jest.fn();
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
          chatID={123}
          onClose={mockOnClose}
          updateChatName={mockUpdateChatName}
          groupId={456}
          currentId={789}
          users={[]}
          onRemoveUser={mockOnRemoveUser}
          updateUsers={mockUpdateUsers}
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
});
});