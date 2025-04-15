import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GroupUserContainer from '../../components/GroupUserContainer';


// Mock axios with proper ESM handling
jest.mock('axios', () => ({
    __esModule: true,
    default: {
      get: jest.fn(),
      put: jest.fn(),
    },
  }));

  
// Mock the GroupUserList component since it's a child component
jest.mock('../../components/GroupUserList', () => {
  return function MockGroupUserList(props: any) {
    return (
      <div data-testid="mock-group-user-list">
        {props.users?.map((user: any) => (
          <div key={user.id}>{user.firstName} {user.lastName}</div>
        ))}
        {props.onClose && <button onClick={props.onClose}>Close</button>}
      </div>
    );
  };
});

describe('GroupUserContainer Component', () => {
  const mockUsers = [
    { id: 1, firstName: 'John', lastName: 'Doe' },
    { id: 2, firstName: 'Jane', lastName: 'Smith' }
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

  it('should render in inline mode by default', () => {
    render(<GroupUserContainer {...mockProps} />);
    
    expect(screen.getByTestId('mock-group-user-list')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('should render in popup mode when isPopup is true', () => {
    const popupProps = {
      ...mockProps,
      isPopup: true,
      onClose: jest.fn()
    };

    render(<GroupUserContainer {...popupProps} />);
    
    expect(screen.getByTestId('mock-group-user-list')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('should pass correct props to GroupUserList in inline mode', () => {
    render(<GroupUserContainer {...mockProps} />);
    
    const groupUserList = screen.getByTestId('mock-group-user-list');
    expect(groupUserList).toHaveTextContent('John Doe');
    expect(groupUserList).toHaveTextContent('Jane Smith');
  });

  it('should pass correct props to GroupUserList in popup mode', () => {
    const popupProps = {
      ...mockProps,
      isPopup: true,
      onClose: jest.fn()
    };

    render(<GroupUserContainer {...popupProps} />);
    
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('should not render close button in inline mode', () => {
    render(<GroupUserContainer {...mockProps} />);
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('should handle null users prop', () => {
    const nullUsersProps = {
      ...mockProps,
      users: null
    };

    render(<GroupUserContainer {...nullUsersProps} />);
    
    const groupUserList = screen.getByTestId('mock-group-user-list');
    expect(groupUserList).toBeEmptyDOMElement();
  });
});