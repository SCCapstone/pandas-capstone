import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GroupUserContainer from '../../components/GroupUserContainer';

// Enhanced mock with TypeScript interface
interface User {
  id: number;
  firstName: string;
  lastName: string;
}

// Mock the GroupUserList component with interactive elements
jest.mock('../../components/GroupUserList', () => {
  return function MockGroupUserList(props: {
    groupId: number | null;
    currentId: number | null;
    users: User[] | null;
    chatId: number | null;
    onRemoveUser?: (userId: number, groupId: number | null) => void;
    updateUsers: (userId: number) => void;
    onClose?: () => void;
    isPopup: boolean;
  }) {
    return (
      <div data-testid="mock-group-user-list">
        {props.users?.map((user) => (
          <div key={user.id}>
            <span>{user.firstName} {user.lastName}</span>
            {props.onRemoveUser && (
              <button 
                onClick={() => props.onRemoveUser!(user.id, props.groupId)}
                data-testid={`remove-user-${user.id}`}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        {props.onClose && (
          <button 
            onClick={props.onClose}
            data-testid="close-button"
          >
            Close
          </button>
        )}
      </div>
    );
  };
});

describe('GroupUserContainer Behavioral Tests', () => {
  const mockUsers = [
    { id: 1, firstName: 'John', lastName: 'Doe' },
    { id: 2, firstName: 'Jane', lastName: 'Smith' }
  ];

  const mockProps = {
    groupId: 1,
    currentId: 1,
    users: mockUsers,
    chatId: 1,
    onRemoveUser: jest.fn((userId: number, groupId: number | null) => {}),
    updateUsers: jest.fn(),
    isPopup: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call onRemoveUser when a user is removed in inline mode', () => {
    render(<GroupUserContainer {...mockProps} />);
    
    const removeButton = screen.getByTestId('remove-user-1');
    fireEvent.click(removeButton);
    
    expect(mockProps.onRemoveUser).toHaveBeenCalledTimes(1);
    expect(mockProps.onRemoveUser).toHaveBeenCalledWith(1, 1);
  });

  it('should call onRemoveUser when a user is removed in popup mode', () => {
    const popupProps = {
      ...mockProps,
      isPopup: true,
      onClose: jest.fn()
    };

    render(<GroupUserContainer {...popupProps} />);
    
    const removeButton = screen.getByTestId('remove-user-2');
    fireEvent.click(removeButton);
    
    expect(popupProps.onRemoveUser).toHaveBeenCalledTimes(1);
    expect(popupProps.onRemoveUser).toHaveBeenCalledWith(2, 1);
  });

  it('should call onClose when close button is clicked in popup mode', () => {
    const popupProps = {
      ...mockProps,
      isPopup: true,
      onClose: jest.fn()
    };

    render(<GroupUserContainer {...popupProps} />);
    
    const closeButton = screen.getByTestId('close-button');
    fireEvent.click(closeButton);
    
    expect(popupProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should not render remove buttons when onRemoveUser is not provided', () => {
    // Create a new props object without onRemoveUser
    const { onRemoveUser, ...noRemoveProps } = mockProps;
    
    render(<GroupUserContainer {...noRemoveProps as any} />);
    
    expect(screen.queryByTestId('remove-user-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('remove-user-2')).not.toBeInTheDocument();
  });

  it('should handle empty users array gracefully', () => {
    const emptyUsersProps = {
      ...mockProps,
      users: []
    };

    render(<GroupUserContainer {...emptyUsersProps} />);
    
    const groupUserList = screen.getByTestId('mock-group-user-list');
    expect(groupUserList).toBeEmptyDOMElement();
  });

  it('should not break when groupId is null', () => {
    const nullGroupProps = {
      ...mockProps,
      groupId: null
    };

    render(<GroupUserContainer {...nullGroupProps} />);
    
    const removeButton = screen.getByTestId('remove-user-1');
    fireEvent.click(removeButton);
    
    expect(nullGroupProps.onRemoveUser).toHaveBeenCalledTimes(1);
    expect(nullGroupProps.onRemoveUser).toHaveBeenCalledWith(1, null);
  });
});
