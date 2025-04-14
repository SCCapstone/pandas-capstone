import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatsNavi from '../../components/ChatsNavi';
import { act } from 'react';


jest.mock('axios', () => ({
    __esModule: true,
    default: {
      get: jest.fn((url: string) => {
        console.log(`Mock axios GET called with: ${url}`);
        
        // Study group check endpoint
        if (url.includes('/study-groups/chat/1')) {
          return Promise.resolve({
            data: { 
              studyGroupID: 123,
              name: 'Math Study Group',
              subject: 'Mathematics',
              description: 'Advanced calculus group',
              ideal_match_factor: 0.85,
              profilePic: 'math-group.jpg'
            }
          });
        }
        
        // Non-study group chat
        if (url.includes('/study-groups/chat/2')) {
          return Promise.resolve({ data: null });
        }
        
        // Last opened endpoint
        if (url.includes('/lastOpened')) {
          return Promise.resolve({
            data: {
              data: [
                { chatId: 1, userId: 1, timestamp: '2023-01-01T00:00:00Z' },
                { chatId: 2, userId: 1, timestamp: '2023-01-01T00:00:00Z' }
              ]
            }
          });
        }
        
        return Promise.reject(new Error('Unexpected URL'));
      }),
      post: jest.fn().mockResolvedValue({ data: {} })
    }
  }));

// Mock FaXmark icon
jest.mock('react-icons/fa6', () => ({
  FaXmark: () => <span>X</span>,
}));

// Mock ConfirmPopup
jest.mock('../../components/ConfirmPopup', () => ({
    __esModule: true,
    default: ({ message, onConfirm, onCancel, 'data-testid': testId }: any) => (
      <div data-testid={"confirm-popup"}>
        <div data-testid="confirm-message">{message}</div>
        <button data-testid="confirm-button" onClick={onConfirm}>Confirm</button>
        <button data-testid="cancel-button" onClick={onCancel}>Cancel</button>
      </div>
    )
  }));


// Define the interfaces that are used in the component
interface Message {
    id: number;
    content: string;
    createdAt: string;
    userId: number | undefined;
    chatId: number;
    liked: boolean;
    system: boolean;
    isButton: boolean;
    buttonData?: Button;
  }
  
  interface Button {
    id: number;
    label: string;
    action: string;
    studyGroupId?: number | null;
  }
  
  interface User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  }
  
  interface Chat {
    id: number;
    name: string;
    messages: Message[];
    users: User[];
    createdAt: string;
    updatedAt: string;
    lastUpdatedById: number | null;
    lastOpened: { [userId: number]: string };
  }
  
  
  interface ChatsNaviProps {
    chats: Chat[];
    selectedChat: Chat | null;
    setSelectedChat: React.Dispatch<React.SetStateAction<Chat | null>>;
    currentUserId: number;
    handleDeleteChat: (id: number) => void;
    chatNames: { [key: number]: string };
    chatPfps: { [key: number]: string };
    loadingChatList: boolean;
    removeUser: (userId: number, groupId: number | null) => Promise<void>;
    updateChats: (chatId: number) => void;
  }

describe('ChatsNavi Component Unit Tests', () => {
  const mockChats: Chat[] = [
    {
      id: 1,
      name: 'Chat 1',
      messages: [],
      users: [
        { id: 1, username: 'user1', firstName: 'John', lastName: 'Doe' },
        { id: 2, username: 'user2', firstName: 'Jane', lastName: 'Smith' },
        { id: 3, username: 'user3', firstName: 'Alex', lastName: 'Johnson' },
        { id: 4, username: 'user4', firstName: 'Sarah', lastName: 'Williams' }
      ],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      lastUpdatedById: null,
      lastOpened: {}
    },
    {
      id: 2,
      name: 'Chat 2',
      messages: [],
      users: [
        { id: 1, username: 'user1', firstName: 'John', lastName: 'Doe' },
        { id: 5, username: 'user5', firstName: 'Mike', lastName: 'Brown' }
      ],
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
      lastUpdatedById: 2,
      lastOpened: {}
    }
  ];

  let mockRemoveUser: jest.Mock;

  const mockSetSelectedChat = jest.fn();
  const mockHandleDeleteChat = jest.fn();
  //const mockRemoveUser = jest.fn();
  mockRemoveUser = jest.fn().mockResolvedValue(undefined);
    
  //const mockRemoveUser = jest.fn().mockResolvedValue(undefined);
  const mockUpdateChats = jest.fn();

  const defaultProps: ChatsNaviProps = {
    chats: mockChats,
    selectedChat: null,
    setSelectedChat: mockSetSelectedChat,
    currentUserId: 1,
    handleDeleteChat: mockHandleDeleteChat,
    chatNames: { 1: 'Chat 1', 2: 'Chat 2' },
    chatPfps: { 1: 'pfp1.jpg', 2: 'pfp2.jpg' },
    loadingChatList: false,
    removeUser: mockRemoveUser,
    updateChats: mockUpdateChats
  };

  beforeEach(() => {
    jest.clearAllMocks();

  });



  const renderComponent = (props = {}) => {
    return render(<ChatsNavi {...defaultProps} {...props} />);
  };

  it('should return true for a study group chat', async () => {
    // Mock the API to return a study group ID
    // In your test
    global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes('/study-groups/chat/1')) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
            studyGroupID: 123,
            name: 'Math Study Group',
            })
        });
        }
        return Promise.reject(new Error('Not found'));
    });
    
    const { checkStudyGroup } = require('../../components/ChatsNavi');
    const result = await checkStudyGroup(1);
    expect(result).toBe(true);
  });

  it('should return false for a regular chat', async () => {
    // Mock the API to return no study group
    (require('axios').default.get.mockResolvedValueOnce({
      data: { studyGroupID: null }
    }));

    const { checkStudyGroup } = require('../../components/ChatsNavi');
    const result = await checkStudyGroup(2);
    expect(result).toBe(false);
  });

  it('should return false when API request fails', async () => {
    // Mock a failed API request
    (require('axios').default.get.mockRejectedValueOnce(
      new Error('API error')
    ));

    const { checkStudyGroup } = require('../../components/ChatsNavi');
    const result = await checkStudyGroup(3);
    expect(result).toBe(false);
  });


  it('should render loading state when loadingChatList is true', async () => {
    await act(async () => {
      renderComponent({ loadingChatList: true });
    });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });


  it('should render list of chats when not loading', async () => {
    await act(async () => {
        renderComponent({ loadingChatList: false });
      });
    expect(screen.getByText('Chat 1')).toBeInTheDocument();
    expect(screen.getByText('Chat 2')).toBeInTheDocument();
  });

  it('should sort chats by most recent update', async () => {
    await act(async () => {
        renderComponent({ loadingChatList: false });
      });
    const chatItems = screen.getAllByRole('listitem');
    // Chat 2 has a more recent updatedAt date
    expect(chatItems[0]).toHaveTextContent('Chat 2');
    expect(chatItems[1]).toHaveTextContent('Chat 1');
  });

  it('should highlight chats with unread messages', async () => {
    // Mock lastOpened times to make Chat 2 appear as unread
    require('axios').default.get.mockResolvedValueOnce({
      data: {
        data: [
          { chatId: 1, userId: 1, timestamp: '2023-01-01T00:00:00Z' },
          { chatId: 2, userId: 1, timestamp: '2023-01-01T00:00:00Z' } // earlier than updatedAt
        ]
      }
    });

    await act(async () => {
        renderComponent({ loadingChatList: false });
    });
    
    await waitFor(() => {
      const chat2Name = screen.getByText('Chat 2');
      expect(chat2Name).toHaveClass('highlighted');
    });
  });

  it('should not highlight chats updated by current user', async () => {
    // Chat 2 was last updated by user 2 (not current user)
    await act(async () => {
        renderComponent({ loadingChatList: false });
      });
    
    await waitFor(() => {
      const chat2Name = screen.getByText('Chat 2');
      expect(chat2Name).toHaveClass('highlighted');
    });
  });

  it('should call setSelectedChat when a chat is clicked', async () => {
    await act(async () => {
        renderComponent({ loadingChatList: false });
      });
    const chat1 = screen.getByText('Chat 1');
    fireEvent.click(chat1);
    
    await waitFor(() => {
      expect(mockSetSelectedChat).toHaveBeenCalledWith(mockChats[0]);
    });
  });

  it('should update lastOpened when a chat is clicked', async () => {
    await act(async () => {
        renderComponent({ loadingChatList: false });
      });
    const chat1 = screen.getByText('Chat 1');
    fireEvent.click(chat1);
    
    await waitFor(() => {
      expect( require('axios').default.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/chats/updateLastOpened'),
        {
          chatId: 1,
          userId: 1,
          lastOpened: expect.any(String)
        }
      );
    });
  });




  it('should call handleDeleteChat when confirming delete', async () => {
    // Ensure this is NOT a study group
    (require('axios').default.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/study-groups/chat')) {
        return Promise.resolve({ data: { studyGroupID: null } });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });
  
    await act(async () => {
      renderComponent({ loadingChatList: false });
    });
  
    // Make sure we're clicking the button for chat 1 (not chat 2)
    const deleteButtons = screen.getAllByRole('button', { name: 'X' });
    await act(async () => {
      fireEvent.click(deleteButtons[1]); // Index 1 is chat 1 (since chats are sorted by date)
    });
  
    await waitFor(() => {
      expect(screen.getByTestId('confirm-popup')).toBeInTheDocument();
      
    });
  
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await act(async () => {
      fireEvent.click(confirmButton);
    });
  
    expect(mockHandleDeleteChat).toHaveBeenCalledWith(1);
  });
  
  it('should show leave confirmation for study group chat', async () => {
    // Mock the study group check to return true

    global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes('/study-groups/chat/1')) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
            studyGroupID: 123,
            name: 'Math Study Group',
            })
        });
        }
        return Promise.reject(new Error('Not found'));
    });
    (require('axios').default.get as jest.Mock).mockImplementation((url: string) => {
      
      
      if (url.includes('/lastOpened')) {
        return Promise.resolve({
          data: {
            data: [
              { chatId: 1, userId: 1, timestamp: '2023-01-01T00:00:00Z' }
            ]
          }
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });
  
    await act(async () => {
      renderComponent({ 
        loadingChatList: false,
        chats: [mockChats[0]] // Only include the study group chat
      });
    });
  
    // Click delete button for chat 1 (study group)
    const deleteButton = screen.getByTestId('delete-chat-1');
    await act(async () => {
      fireEvent.click(deleteButton);
    });
  
    // Wait for the async operations to complete
    await waitFor(() => {
      expect(screen.getByTestId('confirm-message'))
        .toHaveTextContent('Are you sure you want to leave this study group?');
    });
  });

 
  it('should handle study group chat differently from regular chat', async () => {
    // Mock different responses for different chats
    const mockAxios = require('axios').default;
    global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes('/study-groups/chat/1')) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
            studyGroupID: 123,
            name: 'Math Study Group',
            })
        });
        }
        return Promise.reject(new Error('Not found'));
    });
    mockAxios.get.mockImplementation((url: string) => {
      if (url.includes('/lastOpened')) {
        return Promise.resolve({
          data: {
            data: [
              { chatId: 1, userId: 1, timestamp: '2023-01-01T00:00:00Z' },
              { chatId: 2, userId: 1, timestamp: '2023-01-01T00:00:00Z' }
            ]
          }
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

      // Reverse the chat order so Chat 1 appears first
    const reversedChats = [...mockChats].reverse();
  
    await act(async () => {
      renderComponent({ 
        loadingChatList: false,
        chats: reversedChats // Include both chats
      });
    });
  
    // Wait for the component to finish rendering and processing
    await waitFor(() => {
      expect(screen.getByTestId('delete-chat-1')).toBeInTheDocument();
      expect(screen.getByTestId('delete-chat-2')).toBeInTheDocument();
    });
  
    // Test study group chat (ID 1)
    await act(async () => {
      fireEvent.click(screen.getByTestId('delete-chat-1'));
    });
  
    await waitFor(() => {
      expect(screen.getByTestId('confirm-message'))
        .toHaveTextContent('Are you sure you want to leave this study group?');
    });
  
    // Close the popup
    await act(async () => {
      fireEvent.click(screen.getByTestId('cancel-button'));
    });
  
    // Wait for popup to disappear
    await waitFor(() => {
      expect(screen.queryByTestId('confirm-message')).not.toBeInTheDocument();
    });
  
    // Test regular chat (ID 2)
    await act(async () => {
      fireEvent.click(screen.getByTestId('delete-chat-2'));
    });
  
    await waitFor(() => {
      expect(screen.getByTestId('confirm-message'))
        .toHaveTextContent('Are you sure you want to delete this chat?');
    });
  });


    



    
  it('should call removeUser with studyGroupID when confirming', async () => {
    const mockRemoveUser = jest.fn().mockResolvedValue(undefined);
    global.fetch = jest.fn().mockImplementation((url) => {
        if (url.includes('/study-groups/chat/1')) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
            studyGroupID: 123,
            name: 'Math Study Group',
            })
        });
        }
        return Promise.reject(new Error('Not found'));
    });
    // Mock the study group check
    (require('axios').default.get as jest.Mock).mockImplementation((url: string) => {
      
      if (url.includes('/lastOpened')) {
        return Promise.resolve({
          data: {
            data: [
              { chatId: 1, userId: 1, timestamp: '2023-01-01T00:00:00Z' }
            ]
          }
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });
  
    await act(async () => {
      render(
        <ChatsNavi
          {...defaultProps}
          chats={[mockChats[0]]} // Only study group chat
          removeUser={mockRemoveUser}
        />
      );
    });
  
    // Trigger delete action
    const deleteButton = screen.getByTestId('delete-chat-1');
    await act(async () => {
      fireEvent.click(deleteButton);
    });
  
    // Wait for popup to appear
    await waitFor(() => {
      expect(screen.getByTestId('confirm-popup')).toBeInTheDocument();
    });
  
    // Confirm action
    const confirmButton = screen.getByTestId('confirm-button');
    await act(async () => {
      fireEvent.click(confirmButton);
    });
  
    // Verify correct API call
    await waitFor(() => {
      expect(mockRemoveUser).toHaveBeenCalledTimes(1); // userId, studyGroupID
    });
  });

  it('should show delete confirmation for regular chat', async () => {
    // Render with only regular chat
    await act(async () => {
      render(
        <ChatsNavi
          {...defaultProps}
          chats={[mockChats[1]]} // Only regular chat
        />
      );
    });

    // Trigger delete action
    const deleteButton = screen.getByTestId('delete-chat-2');
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Verify regular delete message
    await waitFor(() => {
      expect(screen.getByTestId('confirm-message'))
        .toHaveTextContent('Are you sure you want to delete this chat?');
    });
  });
  
  

  it('should not call any action when canceling confirmation', async () => {
    await act(async () => {
        renderComponent({ loadingChatList: false });
      });
    const deleteButtons = screen.getAllByText('X');
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      expect(mockHandleDeleteChat).not.toHaveBeenCalled();
      expect(mockRemoveUser).not.toHaveBeenCalled();
    });
  });

  it('should display profile pictures for chats', async () => {
    await act(async () => {
        renderComponent({ loadingChatList: false });
      });
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('src', 'pfp2.jpg');
    expect(images[1]).toHaveAttribute('src', 'pfp1.jpg');   
  });
});