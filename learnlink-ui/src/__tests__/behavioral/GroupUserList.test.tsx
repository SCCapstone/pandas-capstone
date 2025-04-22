import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GroupUserList from '../../components/GroupUserList';
import '@testing-library/jest-dom';

describe('GroupUserList Component', () => {
  const mockUsers = [
    { id: 1, firstName: 'John', lastName: 'Doe' },
    { id: 2, firstName: 'Jane', lastName: 'Smith' },
    { id: 3, firstName: 'Bob', lastName: 'Johnson' },
  ];

  const mockOnRemoveUser = jest.fn();
  const mockUpdateUsers = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the list of users', () => {
      render(
        <GroupUserList
          groupId={1}
          currentId={1}
          users={mockUsers}
          chatId={1}
          onClose={mockOnClose}
          onRemoveUser={mockOnRemoveUser}
          updateUsers={mockUpdateUsers}
          isPopup={false}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('shows "No users found" when users array is empty', () => {
      render(
        <GroupUserList
          groupId={1}
          currentId={1}
          users={[]}
          chatId={1}
          onClose={mockOnClose}
          onRemoveUser={mockOnRemoveUser}
          updateUsers={mockUpdateUsers}
          isPopup={false}
        />
      );

      expect(screen.getByText('No users found.')).toBeInTheDocument();
    });

    it('shows "No users found" when users is null', () => {
      render(
        <GroupUserList
          groupId={1}
          currentId={1}
          users={null}
          chatId={1}
          onClose={mockOnClose}
          onRemoveUser={mockOnRemoveUser}
          updateUsers={mockUpdateUsers}
          isPopup={false}
        />
      );

      expect(screen.getByText('No users found.')).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('calls onRemoveUser when remove button is clicked', () => {
      render(
        <GroupUserList
          groupId={1}
          currentId={1}
          users={mockUsers}
          chatId={1}
          onClose={mockOnClose}
          onRemoveUser={mockOnRemoveUser}
          updateUsers={mockUpdateUsers}
          isPopup={false}
        />
      );

      const removeButtons = screen.getAllByText('X');
      fireEvent.click(removeButtons[0]); // Remove first user
      expect(mockOnRemoveUser).toHaveBeenCalledWith(1, 1);
      expect(mockUpdateUsers).toHaveBeenCalledWith(1);
    });

    it('calls onRemoveUser with currentId when leave group button is clicked', () => {
      render(
        <GroupUserList
          groupId={1}
          currentId={1}
          users={mockUsers}
          chatId={1}
          onClose={mockOnClose}
          onRemoveUser={mockOnRemoveUser}
          updateUsers={mockUpdateUsers}
          isPopup={false}
        />
      );

      const leaveButton = screen.getByText('Leave Study Group');
      fireEvent.click(leaveButton);
      expect(mockOnRemoveUser).toHaveBeenCalledWith(1, 1);
      expect(mockUpdateUsers).toHaveBeenCalledWith(1);
    });

    it('does not call onRemoveUser when groupId is null', () => {
      render(
        <GroupUserList
          groupId={null}
          currentId={1}
          users={mockUsers}
          chatId={1}
          onClose={mockOnClose}
          onRemoveUser={mockOnRemoveUser}
          updateUsers={mockUpdateUsers}
          isPopup={false}
        />
      );

      const removeButtons = screen.getAllByText('X');
      fireEvent.click(removeButtons[0]);
      expect(mockOnRemoveUser).not.toHaveBeenCalled();
    });

    it('does not call onRemoveUser when currentId is null for leave group', () => {
      render(
        <GroupUserList
          groupId={1}
          currentId={null}
          users={mockUsers}
          chatId={1}
          onClose={mockOnClose}
          onRemoveUser={mockOnRemoveUser}
          updateUsers={mockUpdateUsers}
          isPopup={false}
        />
      );

      const leaveButton = screen.getByText('Leave Study Group');
      fireEvent.click(leaveButton);
      expect(mockOnRemoveUser).not.toHaveBeenCalled();
    });
  });

  describe('Popup Behavior', () => {
    it('renders close button when isPopup is true', () => {
      render(
        <GroupUserList
          groupId={1}
          currentId={1}
          users={mockUsers}
          chatId={1}
          onClose={mockOnClose}
          onRemoveUser={mockOnRemoveUser}
          updateUsers={mockUpdateUsers}
          isPopup={true}
        />
      );

      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('does not render close button when isPopup is false', () => {
      render(
        <GroupUserList
          groupId={1}
          currentId={1}
          users={mockUsers}
          chatId={1}
          onClose={mockOnClose}
          onRemoveUser={mockOnRemoveUser}
          updateUsers={mockUpdateUsers}
          isPopup={false}
        />
      );

      expect(screen.queryByText('Close')).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      render(
        <GroupUserList
          groupId={1}
          currentId={1}
          users={mockUsers}
          chatId={1}
          onClose={mockOnClose}
          onRemoveUser={mockOnRemoveUser}
          updateUsers={mockUpdateUsers}
          isPopup={true}
        />
      );

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when leaving group in popup mode', () => {
      render(
        <GroupUserList
          groupId={1}
          currentId={1}
          users={mockUsers}
          chatId={1}
          onClose={mockOnClose}
          onRemoveUser={mockOnRemoveUser}
          updateUsers={mockUpdateUsers}
          isPopup={true}
        />
      );

      const leaveButton = screen.getByText('Leave Study Group');
      fireEvent.click(leaveButton);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Click Outside Behavior', () => {
    it('calls onClose when clicking outside the panel in popup mode', () => {
      render(
        <div data-testid="outside-element">
          <GroupUserList
            groupId={1}
            currentId={1}
            users={mockUsers}
            chatId={1}
            onClose={mockOnClose}
            onRemoveUser={mockOnRemoveUser}
            updateUsers={mockUpdateUsers}
            isPopup={true}
          />
        </div>
      );
  
      const outsideElement = screen.getByTestId('outside-element');
      fireEvent.mouseDown(outsideElement);
      expect(mockOnClose).toHaveBeenCalled();
    });
  
    it('does not call onClose when clicking inside the panel', () => {
      render(
        <GroupUserList
          groupId={1}
          currentId={1}
          users={mockUsers}
          chatId={1}
          onClose={mockOnClose}
          onRemoveUser={mockOnRemoveUser}
          updateUsers={mockUpdateUsers}
          isPopup={true}
        />
      );
  
      const userElement = screen.getByText('John Doe');
      fireEvent.mouseDown(userElement);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  
    it('does not set up click outside listener when not in popup mode', () => {
      // Mock document.addEventListener to verify it's not called
      const addEventListenerMock = jest.spyOn(document, 'addEventListener');
      
      render(
        <GroupUserList
          groupId={1}
          currentId={1}
          users={mockUsers}
          chatId={1}
          onClose={mockOnClose}
          onRemoveUser={mockOnRemoveUser}
          updateUsers={mockUpdateUsers}
          isPopup={false}
        />
      );
  
      expect(addEventListenerMock).not.toHaveBeenCalledWith(
        'mousedown',
        expect.any(Function)
      );
      addEventListenerMock.mockRestore();
    });
  
    it('cleans up event listener when unmounted in popup mode', () => {
      const removeEventListenerMock = jest.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(
        <GroupUserList
          groupId={1}
          currentId={1}
          users={mockUsers}
          chatId={1}
          onClose={mockOnClose}
          onRemoveUser={mockOnRemoveUser}
          updateUsers={mockUpdateUsers}
          isPopup={true}
        />
      );
  
      unmount();
      expect(removeEventListenerMock).toHaveBeenCalledWith(
        'mousedown',
        expect.any(Function)
      );
      removeEventListenerMock.mockRestore();
    });
  });
});