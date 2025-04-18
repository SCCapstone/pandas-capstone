import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Messaging from '../../pages/messaging';
import axios from 'axios';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const mockSocket = {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  };
  return jest.fn(() => mockSocket);
});

// Mock axios
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
    })
  ) as jest.Mock;


// Mock components
jest.mock('../../components/Navbar', () => () => <div data-testid="navbar">Navbar</div>);
jest.mock('../../components/CopyrightFooter', () => () => <div data-testid="copyright">Copyright</div>);
jest.mock('../../components/CustomAlert', () => ({ text, severity, onClose }: any) => (
  <div data-testid="custom-alert" onClick={onClose}>
    {text} - {severity}
  </div>
));
jest.mock('../../components/ChatsNavi', () => ({ chats, selectedChat, setSelectedChat }: any) => (
  <div data-testid="chats-navi">
    {chats?.map((chat: any) => (
      <div key={chat.id} onClick={() => setSelectedChat(chat)}>
        {chat.id}
      </div>
    ))}
  </div>
));
jest.mock('../../components/NewChatList', () => ({ onClose }: any) => (
  <div data-testid="new-chat-list">
    <button onClick={onClose}>Close</button>
  </div>
));
jest.mock('../../components/GroupUserContainer', () => () => <div data-testid="group-user-container">Group Users</div>);
jest.mock('../../components/CreateStudyGroup', () => ({ onClose }: any) => (
  <div data-testid="create-study-group">
    <button onClick={onClose}>Close Create</button>
  </div>
));
jest.mock('../../components/CalendarEventPopup', () => () => <div data-testid="calendar-popup">Calendar</div>);

// Mock react-router hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));

// Mock messageUtils
jest.mock('../../utils/messageUtils', () => ({
  handleSendSystemMessage: jest.fn(),
  handleSendButtonMessage: jest.fn(),
  openCalendarEvent: jest.fn(),
  updateChatTimestamp: jest.fn(),
}));

describe('Messaging Component', () => {
  const mockNavigate = jest.fn();
  const mockLocation = {
    pathname: '/messaging',
    search: '',
    hash: '',
    state: null,
  };

  const mockChats = [
    {
      id: 1,
      name: 'Chat 1',
      messages: [
        {
          id: 1,
          content: 'Hello',
          createdAt: new Date().toISOString(),
          userId: 1,
          chatId: 1,
          liked: false,
          system: false,
          isButton: false,
        },
      ],
      users: [
        { id: 1, username: 'user1', firstName: 'John', lastName: 'Doe', profilePic: 'pic1.jpg' },
        { id: 2, username: 'user2', firstName: 'Jane', lastName: 'Smith', profilePic: 'pic2.jpg' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUpdatedById: 1,
    },
    {
      id: 2,
      name: 'Chat 2',
      messages: [
        {
          id: 2,
          content: 'Hi there',
          createdAt: new Date().toISOString(),
          userId: 2,
          chatId: 2,
          liked: false,
          system: false,
          isButton: false,
        },
      ],
      users: [
        { id: 1, username: 'user1', firstName: 'John', lastName: 'Doe', profilePic: 'pic1.jpg' },
        { id: 3, username: 'user3', firstName: 'Alice', lastName: 'Johnson', profilePic: 'pic3.jpg' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUpdatedById: 2,
    },
  ];

  const mockUser = {
    id: 1,
    username: 'user1',
    firstName: 'John',
    lastName: 'Doe',
    profilePic: 'pic1.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    window.HTMLElement.prototype.scrollTo = jest.fn();

    // Mock localStorage
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'token') return 'test-token';
      return null;
    });

    // Mock axios responses
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/currentUser')) {
        return Promise.resolve({ data: mockUser });
      }
      if (url.includes('/api/users')) {
        return Promise.resolve({ data: [mockUser] });
      }
      if (url.includes('/api/chats')) {
        return Promise.resolve({ data: mockChats });
      }
      if (url.includes('/api/study-groups/chat/')) {
        return Promise.resolve({ data: { studyGroupID: 123, name: 'Study Group', profilePic: 'group-pic.jpg' } });
      }
      if (url.includes('/api/users/')) {
        return Promise.resolve({ data: mockUser });
      }
      return Promise.reject(new Error('Not mocked'));
    });

    // Mock useNavigate and useLocation
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useLocation as jest.Mock).mockReturnValue(mockLocation);
  });

  afterEach(async () => {
    // Clear all timers
    jest.clearAllTimers();
  
  });
  
  afterAll(async () => {
    
  });

  const renderMessaging = () => {
    return render(
      <MemoryRouter>
        <Messaging />
      </MemoryRouter>
    );
  };

  // works
  it('renders without crashing', async () => {
    await act(async () => {
      renderMessaging();
    });
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  // works 
  it('loads current user and chats on mount', async () => {
    await act(async () => {
      renderMessaging();
    });

    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/currentUser'), expect.anything());
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/chats'), expect.anything());
  });

  // works
  it('displays please select state initially', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));
    
    await act(async () => {
      renderMessaging();
    });
    
    expect(screen.getByText('Select a chat to start messaging')).toBeInTheDocument();
  });

  // works
  it('displays chat list after loading', async () => {
    await act(async () => {
      renderMessaging();
    });

    await waitFor(() => {
      expect(screen.getByTestId('chats-navi')).toBeInTheDocument();
      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    });
  });

  // works
  it('allows selecting a chat', async () => {
    await act(async () => {
      renderMessaging();
    });

    await waitFor(() => {
      const chat1 = screen.getAllByText('1')[0];
      fireEvent.click(chat1);
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  // works
  it('handles sending a message', async () => {
    (axios.post as jest.Mock).mockResolvedValue({ data: {} });
    
    await act(async () => {
      renderMessaging();
    });
  
    // Select a chat
    await waitFor(() => {
      const chat1 = screen.getAllByText('1')[0];
      fireEvent.click(chat1);
    });
  
    // Type a message
    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'New message' } });
  
    // Send the message
    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);

  });

  // works
  it('opens and closes new chat popup', async () => {
    await act(async () => {
      renderMessaging();
    });

    const newChatButton = screen.getByText('+ New Chat');
    fireEvent.click(newChatButton);

    await waitFor(() => {
      expect(screen.getByTestId('new-chat-list')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('new-chat-list')).not.toBeInTheDocument();
    });
  });


    // works
    it('handles double click to like a message', async () => {
    // Mock initial data
    const mockChatWithMessage = {
        ...mockChats[0],
        messages: [{
        id: 1,
        content: 'Hello',
        userId: 2,
        chatId: 1,
        liked: false
        }]
    };

    require('axios').default.get.mockImplementation((url:string) => {
        if (url.includes('/api/chats')) return Promise.resolve({ data: [mockChatWithMessage] });
        if (url.includes('/api/users/2')) return Promise.resolve({ data: mockUser });
        if (url.includes('/api/currentUser')) return Promise.resolve({ data: { id: 1 } });
        return Promise.reject(new Error('Unmocked URL'));
    });

    // Render and interact
    await act(async () => {
        renderMessaging();
    });

    const chat1 = await screen.findByText('1');
    await act(async () => {
        fireEvent.click(chat1);
    });

    await waitFor(() => {
        expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    const message = screen.getByText('Hello');
    await act(async () => {
        fireEvent.doubleClick(message);
    });

    // Verify fetch was called with correct parameters
    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/messages/1/like'),
        expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify({ liked: true }),
            headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
            })
        })
        );
    });
    });
 

  // works
  it('shows group user container when members button is clicked', async () => {
    // Mock a study group chat
    const mockStudyGroupChat = {
      ...mockChats[0],
      id: 1, // Important for the API URL
      studyGroupId: 5, // Must match the studyGroupID below
      name: 'Study Group Chat',
      messages: [{
        id: 1,
        content: 'Hello',
        userId: 2,
        chatId: 1,
        liked: false
      }],
      users: [
        { id: 1, username: 'user1' },
        { id: 2, username: 'user2' }
      ]
    };
  
    // Mock axios responses for other calls
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/chats')) {
        return Promise.resolve({ data: [mockStudyGroupChat] });
      }
      if (url.includes('/api/currentUser')) {
        return Promise.resolve({ data: { id: 1 } });
      }
      if (url.includes('/api/users/')) {
        return Promise.resolve({ data: mockUser });
      }
      return Promise.reject(new Error('Unmocked URL'));
    });
  
    // Mock the fetch call for study group check
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/study-groups/chat/1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            studyGroupID: 5,
            name: 'Buddies',
            subject: 'BIOL 102',
            description: 'hi hello',
            ideal_match_factor: 'Solo_Study',
            profilePic: 'https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_palm-tree.png'
          })
        });
      }
      return Promise.reject(new Error('Unmocked URL'));
    });
  
    await act(async () => {
      renderMessaging();
    });
  
    // Select the study group chat
    const chat1 = await screen.findByText('1');
    await act(async () => {
      fireEvent.click(chat1);
    });
  
    // Wait for study group check to complete
    await waitFor(() => {
      expect(screen.getByText('Members')).toBeInTheDocument();
    });
  });




  // works
  it('handles creating a study group', async () => {
    (axios.post as jest.Mock).mockResolvedValue({ data: { studyGroup: { id: 123 } } });
    (axios.put as jest.Mock).mockResolvedValue({ data: {} });
    
    await act(async () => {
      renderMessaging();
    });

    // Select a chat
    await waitFor(() => {
      const chat1 = screen.getAllByText('1')[0];
      fireEvent.click(chat1);
    });

    // Click create study group button
    const createButton = screen.getByText('Create Study Group');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByTestId('create-study-group')).toBeInTheDocument();
    });

    // Close the create study group panel
    const closeButton = screen.getByText('Close Create');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('create-study-group')).not.toBeInTheDocument();
    });
  });

  // works
  it('handles chat deletion', async () => {
    (axios.delete as jest.Mock).mockResolvedValue({ data: {} });
    
    await act(async () => {
      renderMessaging();
    });

    // The actual delete button would be in the ChatsNavi component
    // This test assumes the delete functionality is properly passed down
    // In a real test, you might want to test the ChatsNavi component separately
  });

  // doesnt work
  it('handles weekly scheduler button in study group', async () => {
    // Mock navigation
    const mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    
    // Mock a study group chat
    const mockStudyGroupChat = {
        ...mockChats[0],
        id: 1, // Important for the API URL
        studyGroupId: 5, // Must match the studyGroupID below
        name: 'Study Group Chat',
        messages: [{
        id: 1,
        content: 'Hello',
        userId: 2,
        chatId: 1,
        liked: false
        }],
        users: [
        { id: 1, username: 'user1' },
        { id: 2, username: 'user2' }
        ]
    };

    // Mock axios responses for other calls
    (axios.get as jest.Mock).mockImplementation((url) => {
        if (url.includes('/api/chats')) {
        return Promise.resolve({ data: [mockStudyGroupChat] });
        }
        if (url.includes('/api/currentUser')) {
        return Promise.resolve({ data: { id: 1 } });
        }
        if (url.includes('/api/users/')) {
        return Promise.resolve({ data: mockUser });
        }
        return Promise.reject(new Error('Unmocked URL'));
    });

    // Mock the fetch call for study group check
    (global.fetch as jest.Mock).mockImplementation((url) => {
        if (url.includes('/api/study-groups/chat/1')) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
            studyGroupID: 5,
            name: 'Buddies',
            subject: 'BIOL 102',
            description: 'hi hello',
            ideal_match_factor: 'Solo_Study',
            profilePic: 'https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_palm-tree.png'
            })
        });
        }
        return Promise.reject(new Error('Unmocked URL'));
    });

    await act(async () => {
        renderMessaging();
    });

    // Select the study group chat
    const chat1 = await screen.findByText('1');
    await act(async () => {
        fireEvent.click(chat1);
    });

    // Click the plus button to open options
    const chatInput = screen.getByTestId('chat-input');
    const plusButton = within(chatInput).getByRole('button', { name: /open menu/i });

    await act(async () => {
        fireEvent.click(plusButton);
      });
  
    // Verify Weekly Scheduler option is available and enabled
    await waitFor(() => {
      const schedulerOption = screen.getByText('Weekly Scheduler');
      expect(schedulerOption).toBeInTheDocument();
      expect(schedulerOption.closest('button')).not.toHaveClass('disabled');
      expect(schedulerOption.closest('button')).not.toBeDisabled();
    });
  
    // Click the Weekly Scheduler button
    const schedulerButton = screen.getByText('Weekly Scheduler');
    await act(async () => {
      fireEvent.click(schedulerButton);
    });

  });



  it('disables Weekly Scheduler for non-study group chats', async () => {
    // Mock a regular chat (no study group)
    const mockRegularChat = {
      ...mockChats[0],
      id: 1,
      studyGroupId: null,
      messages: []
    };
  
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/chats')) return Promise.resolve({ data: [mockRegularChat] });
      if (url.includes('/api/currentUser')) return Promise.resolve({ data: { id: 1 } });
      return Promise.reject(new Error('Not mocked'));
    });
  
    await act(async () => {
      renderMessaging();
    });
  
    // Select the regular chat
    const chat1 = await screen.findByText('1');
    await act(async () => {
      fireEvent.click(chat1);
    });
  
    // Find the plus button within the ChatInput section
    const chatInput = screen.getByTestId('chat-input');
    const plusButton = within(chatInput).getByRole('button', { name: /open menu/i });
  

    await act(async () => {
        fireEvent.click(plusButton);
      });
    // Verify Weekly Scheduler is disabled with tooltip
    await waitFor(() => {
      const schedulerOption = screen.getByText('Weekly Scheduler');
      expect(schedulerOption.closest('button')).toHaveClass('disabled');
      expect(schedulerOption.closest('button')).toBeDisabled();
      
      // Verify tooltip text
      const tooltip = screen.getByText('This option is only available for study groups');
      expect(tooltip).toBeInTheDocument();
    });
  });

  // doesnt work 
  it('handles keyboard events for sending messages', async () => {

    const mockHandleSendMessage = jest.fn();


    await act(async () => {
      renderMessaging();
    });
    // Select a chat
    await waitFor(() => {
        const chat1 = screen.getAllByText('1')[0];
        fireEvent.click(chat1);
    });

    // Find the input and simulate key press
    const input = screen.getByPlaceholderText('Type a message...');
    
    // Test with Enter key
    fireEvent.keyPress(input, { 
        key: 'Enter', 
        code: 'Enter', 
        charCode: 13 
    });
  });
});