import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditStudyGroup from '../../components/EditStudyGroup';

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
  __esModule: true,
  default: jest.fn(({ options, value, onChange }) => (
    <select
      data-testid="mock-select"
      value={value?.value || ''}
      onChange={(e) => {
        const option = options.find((opt: any) => opt.value === e.target.value);
        onChange(option);
      }}
    >
      {options.map(({ value, label }: any) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  )),
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

describe('EditStudyGroup Component Unit Tests', () => {
  const mockOnClose = jest.fn();
  const mockUpdateChatName = jest.fn();
  const mockUpdatePFP = jest.fn();
  const mockOnRemoveUser = jest.fn();
  const mockUpdateUsers = jest.fn();
  const mockOnGroupUpdated = jest.fn();
  const mockStudyGroup = {
    name: 'Math Study Group',
    description: 'For calculus students',
    subject: 'Mathematics',
    chatID: 1,
    ideal_match_factor: 'MORNING_PERSON',
    profile_pic: 'math-group.jpg',
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

  it('should render with initial study group data', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Math Study Group')).toBeInTheDocument();
      expect(screen.getByDisplayValue('For calculus students')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Mathematics')).toBeInTheDocument();
    });
  });

  it('should update study group name when changed', async () => {
    renderComponent();
    
    await waitFor(() => {
      const nameInput = screen.getByDisplayValue('Math Study Group');
      fireEvent.change(nameInput, { target: { value: 'Advanced Math Group' } });
      expect(nameInput).toHaveValue('Advanced Math Group');
    });
  });

  it('should show error when saving with empty name', async () => {
    renderComponent();
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('Math Study Group')).toBeInTheDocument();
    });
  
    // Clear the name field and attempt to save
    const nameInput = screen.getByDisplayValue('Math Study Group');
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(screen.getByText('Save'));
    
    // Verify error appears
    await waitFor(() => {
      expect(screen.getByText('Study group name is required')).toBeInTheDocument();
    });
  });
  

  it('should call onClose when cancel button is clicked', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Cancel'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should save changes successfully', async () => {
    renderComponent();
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Save'));
      
      expect(require('axios').default.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/study-groups/chat/1'),
        expect.objectContaining({
          name: 'Math Study Group',
          description: 'For calculus students',
          subject: 'Mathematics',
          chatID: 1,
          profile_pic: expect.any(String)
        }),
        expect.any(Object)
      );
    });
  });
});