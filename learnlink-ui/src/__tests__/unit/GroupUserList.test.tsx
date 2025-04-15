import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GroupUserList from '../../components/GroupUserList';

jest.mock('axios', () => ({
    __esModule: true,
    default: {
      get: jest.fn(),
      put: jest.fn(),
    },
  }));

  
describe('GroupUserList Component Unit Tests', () => {
  const mockUsers = [
    { id: 1, firstName: 'John', lastName: 'Doe', profilePic: 'john.jpg' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', profilePic: 'jane.jpg' }
  ];

  const mockProps = {
    groupId: 1,
    currentId: 1,
    users: mockUsers,
    chatId: 1,
    onRemoveUser: jest.fn(),
    updateUsers: jest.fn(),
    isPopup: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render user list correctly', () => {
    render(<GroupUserList {...mockProps} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getAllByText('X').length).toBe(2); // Remove buttons
    expect(screen.getByText('Leave Study Group')).toBeInTheDocument();
  });

  it('should display "No users found" when users is empty', () => {
    render(<GroupUserList {...mockProps} users={[]} />);
    expect(screen.getByText('No users found.')).toBeInTheDocument();
  });

  it('should display "No users found" when users is null', () => {
    render(<GroupUserList {...mockProps} users={null} />);
    expect(screen.getByText('No users found.')).toBeInTheDocument();
  });

  it('should call onRemoveUser when remove button is clicked', () => {
    render(<GroupUserList {...mockProps} />);
    
    fireEvent.click(screen.getAllByText('X')[0]); // Click first remove button
    expect(mockProps.onRemoveUser).toHaveBeenCalledWith(1, 1);
    expect(mockProps.updateUsers).toHaveBeenCalledWith(1);
  });

  it('should handle leave group action', () => {
    render(<GroupUserList {...mockProps} />);
    
    fireEvent.click(screen.getByText('Leave Study Group'));
    expect(mockProps.onRemoveUser).toHaveBeenCalledWith(1, 1);
    expect(mockProps.updateUsers).toHaveBeenCalledWith(1);
  });

  it('should show close button in popup mode', () => {
    render(<GroupUserList {...mockProps} isPopup={true} onClose={jest.fn()} />);
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('should not show close button in inline mode', () => {
    render(<GroupUserList {...mockProps} />);
    expect(screen.queryByText('Close')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    render(<GroupUserList {...mockProps} isPopup={true} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle click outside in popup mode', () => {
    const mockOnClose = jest.fn();
    const { container } = render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <GroupUserList {...mockProps} isPopup={true} onClose={mockOnClose} />
      </div>
    );

    fireEvent.mouseDown(screen.getByTestId('outside-element'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should not handle click outside in inline mode', () => {
    const mockOnClose = jest.fn();
    const { container } = render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <GroupUserList {...mockProps} isPopup={false} onClose={mockOnClose} />
      </div>
    );

    fireEvent.mouseDown(screen.getByTestId('outside-element'));
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should log error when groupId is null on remove user', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<GroupUserList {...mockProps} groupId={null} />);
    
    fireEvent.click(screen.getAllByText('X')[0]);
    expect(consoleSpy).toHaveBeenCalledWith('Group ID is not available');
    consoleSpy.mockRestore();
  });

  it('should log error when currentId is null on leave group', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<GroupUserList {...mockProps} currentId={null} />);
    
    fireEvent.click(screen.getByText('Leave Study Group'));
    expect(consoleSpy).toHaveBeenCalledWith('User ID or Group ID is not available');
    consoleSpy.mockRestore();
  });
});