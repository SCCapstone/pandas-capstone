import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import ChatsNavi, { checkStudyGroup } from '../../components/ChatsNavi'; // Adjust the import path as needed
import { act } from 'react';

// Mock axios and other external dependencies

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

const mockedAxios = require('axios').default;

// Mock the ConfirmPopup component

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

// Mock the FaXmark icon
jest.mock('react-icons/fa6', () => ({
  FaXmark: () => <span>X</span>,
}));

describe('ChatsNavi Component', () => {
  const mockChats: any[] = [
    {
      id: 1,
      name: 'Study Group Chat',
      messages: [],
      users: [{ id: 1, username: 'user1', firstName: 'John', lastName: 'Doe' }],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
      lastUpdatedById: 2,
      lastOpened: { 1: '2023-01-01T12:00:00Z' }
    },
    {
      id: 2,
      name: 'Direct Message',
      messages: [],
      users: [{ id: 1, username: 'user1', firstName: 'John', lastName: 'Doe' }],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-03T00:00:00Z',
      lastUpdatedById: 3,
      lastOpened: { 1: '2023-01-01T12:00:00Z' }
    }
  ];

  const defaultProps = {
    chats: mockChats,
    selectedChat: null,
    setSelectedChat: jest.fn(),
    currentUserId: 1,
    handleDeleteChat: jest.fn(),
    chatNames: { 1: 'Study Group', 2: 'Direct Message' },
    chatPfps: { 1: 'profile1.jpg', 2: 'profile2.jpg' },
    loadingChatList: false,
    removeUser: jest.fn(),
    updateChats: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ 
      data: { 
        data: [
          { chatId: 1, userId: 1, timestamp: '2023-01-01T12:00:00Z' },
          { chatId: 2, userId: 1, timestamp: '2023-01-01T12:00:00Z' }
        ] 
      } 
    });
    mockedAxios.post.mockResolvedValue({ data: {} });
  });

  it('renders loading spinner when loadingChatList is true', () => {
    render(<ChatsNavi {...defaultProps} loadingChatList={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders list of chats when not loading', () => {
    render(<ChatsNavi {...defaultProps} />);
    expect(screen.getByText('Study Group')).toBeInTheDocument();
    expect(screen.getByText('Direct Message')).toBeInTheDocument();
  });

  it('sorts chats by most recent update', () => {
    render(<ChatsNavi {...defaultProps} />);
    const chatItems = screen.getAllByRole('listitem');
    // Direct Message should come first since it has a more recent updatedAt
    expect(chatItems[0]).toHaveTextContent('Direct Message');
    expect(chatItems[1]).toHaveTextContent('Study Group');
  });

  it('highlights chats with unread messages', async () => {
    render(<ChatsNavi {...defaultProps} />);
    await waitFor(() => {
      // Both chats should be highlighted since their updates are after last opened
      const highlightedChats = document.querySelectorAll('.highlighted');
      expect(highlightedChats.length).toBe(2);
    });
  });

  it('does not highlight the currently selected chat', async () => {
    render(<ChatsNavi {...defaultProps} selectedChat={mockChats[0]} />);
    await waitFor(() => {
      const highlightedChats = document.querySelectorAll('.highlighted');
      // Only the second chat should be highlighted
      expect(highlightedChats.length).toBe(1);
      expect(highlightedChats[0]).toHaveTextContent('Direct Message');
    });
  });

  it('calls setSelectedChat when a chat is clicked', async () => {
    render(<ChatsNavi {...defaultProps} />);
    const chatItem = screen.getByText('Study Group');
    fireEvent.click(chatItem);
    expect(defaultProps.setSelectedChat).toHaveBeenCalledWith(mockChats[0]);
  });

  it('updates lastOpened time when a chat is clicked', async () => {
    render(<ChatsNavi {...defaultProps} />);
    const chatItem = screen.getByText('Study Group');
    fireEvent.click(chatItem);
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/chats/updateLastOpened'),
        expect.objectContaining({
          chatId: 1,
          userId: 1,
          lastOpened: expect.any(String)
        })
      );
    });
  });

  describe('Delete/Chat Leave functionality', () => {

    it('shows chat delete confirmation when deleting a regular chat', async () => {
      // Mock the study group check to return false
      mockedAxios.get.mockImplementation((url:any) => {
        if (url.includes('/api/study-groups/chat/2')) {
          return Promise.resolve({ data: { studyGroupID: null } });
        }
        return Promise.resolve({ data: {} });
      });

      render(<ChatsNavi {...defaultProps} />);
      const deleteButton = screen.getByTestId('delete-chat-2');
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('confirm-popup')).toBeInTheDocument();
        expect(screen.getByText('Are you sure you want to delete this chat?')).toBeInTheDocument();
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

    it('calls handleDeleteChat when confirming to delete a regular chat', async () => {
      mockedAxios.get.mockImplementation((url:any) => {
        if (url.includes('/api/study-groups/chat/2')) {
          return Promise.resolve({ data: { studyGroupID: null } });
        }
        return Promise.resolve({ data: {} });
      });

      render(<ChatsNavi {...defaultProps} />);
      const deleteButton = screen.getByTestId('delete-chat-2');
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        const confirmButton = screen.getByText('Confirm');
        fireEvent.click(confirmButton);
        expect(defaultProps.handleDeleteChat).toHaveBeenCalledWith(2);
      });
    });

    it('does not call any action when canceling the confirmation', async () => {
      mockedAxios.get.mockImplementation((url:any) => {
        if (url.includes('/api/study-groups/chat/1')) {
          return Promise.resolve({ data: { studyGroupID: 123 } });
        }
        return Promise.resolve({ data: {} });
      });

      render(<ChatsNavi {...defaultProps} />);
      const deleteButton = screen.getByTestId('delete-chat-1');
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);
        expect(defaultProps.removeUser).not.toHaveBeenCalled();
        expect(defaultProps.handleDeleteChat).not.toHaveBeenCalled();
      });
    });
  });

  describe('checkStudyGroup function', () => {
    it('returns false when chat is not associated with a study group', async () => {
      mockedAxios.get.mockResolvedValue({ data: { studyGroupID: null } });
      const result = await checkStudyGroup(1);
      expect(result).toBe(false);
    });

    it('returns false when API call fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API error'));
      const result = await checkStudyGroup(1);
      expect(result).toBe(false);
    });
  });
});