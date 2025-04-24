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

  it('sends message when Enter key is pressed', async () => {
    await act(async () => {
      renderMessaging();
    });
    
    // Select a chat
    await waitFor(() => {
      const chat1 = screen.getAllByText('1')[0];
      fireEvent.click(chat1);
    });
    
    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    
  });


  it('handles calendar scheduler button in study group', async () => {
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
      const schedulerOption = screen.getByText('Calendar Event');
      expect(schedulerOption).toBeInTheDocument();
      expect(schedulerOption.closest('button')).not.toHaveClass('disabled');
      expect(schedulerOption.closest('button')).not.toBeDisabled();
    });
  
    // Click the Weekly Scheduler button
    const schedulerButton = screen.getByText('Calendar Event');
    await act(async () => {
      fireEvent.click(schedulerButton);
    });

  });



  it('only makes necessary API calls when switching chats', async () => {
    await act(async () => {
      renderMessaging();
    });
    
    const initialCallCount = (axios.get as jest.Mock).mock.calls.length;
    
    // Select first chat
    const chat1 = await screen.findByText('1');
    await act(async () => {
      fireEvent.click(chat1);
    });
    
    // Select second chat
    const chat2 = await screen.findByText('2');
    await act(async () => {
      fireEvent.click(chat2);
    });
    
    // Verify no duplicate unnecessary calls were made
    expect((axios.get as jest.Mock).mock.calls.length).toBeLessThan(initialCallCount *3);
  });
 
});