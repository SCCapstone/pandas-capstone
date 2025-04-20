import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotificationDropdown from "../../components/NotificationDropdown";
import * as ReactRouterDom from "react-router-dom";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

// Mock axios with proper ESM handling
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));


describe("NotificationDropdown Behavioral Tests", () => {
  let setNotifCountMock: jest.Mock;
  let navigateMock: jest.Mock;

  const mockNotifications = [
    {
        id: 1,
        message: 'New match found!',
        createdAt: '2025-04-12T10:00:00Z',
        isRead: false,
    },
    {
        id: 2,
        message: 'Your group has been updated.',
        createdAt: '2025-04-11T14:30:00Z',
        isRead: true,
    },
  ];

  beforeEach(() => {
      navigateMock = jest.fn();
      (ReactRouterDom.useNavigate as jest.Mock).mockReturnValue(navigateMock);
      global.fetch = jest.fn();
      setNotifCountMock = jest.fn();

      Storage.prototype.getItem = jest.fn(() => 'mock-token');

        global.fetch = jest.fn(() =>
            Promise.resolve({
              ok: true,
              json: () => Promise.resolve(mockNotifications),
            })
          ) as jest.Mock;
  });

  afterEach(() => {
      jest.restoreAllMocks();
  });

  test('should delete a single notification when "X" is clicked', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockNotifications),
    });
  
    render(
      <MemoryRouter>
          <NotificationDropdown setNotifCount={setNotifCountMock} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId("loading-text")).not.toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTestId("delete-notifs");
    
    fireEvent.click(deleteButtons[0]);
      
    await waitFor(() => {
      expect(screen.queryByText(/New match found!/i)).not.toBeInTheDocument();
    });
  
    expect(setNotifCountMock).toHaveBeenCalledTimes(1);
    const updateFn = setNotifCountMock.mock.calls[0][0];
    expect(typeof updateFn).toBe('function');
    expect(updateFn(2)).toBe(1);
  });

  test('should delete all notifications when "Clear all" is clicked', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockNotifications),
    });
  
    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={setNotifCountMock} />
      </MemoryRouter>
    );
  
    await waitFor(() => {
      expect(screen.queryByTestId("loading-text")).not.toBeInTheDocument();
    });
  
    const clearAllButton = screen.getByText(/clear all/i);
    fireEvent.click(clearAllButton);
  
    await waitFor(() => {
      expect(screen.queryByText(/New match found!/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Your group has been updated/i)).not.toBeInTheDocument();
    });
  
    expect(setNotifCountMock).toHaveBeenCalledTimes(1);
    expect(setNotifCountMock).toHaveBeenCalledWith(0);
  });
  
  test('should handle missing token in localStorage', async () => {
    (Storage.prototype.getItem as jest.Mock).mockReturnValueOnce(null); // Simulate no token
  
    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={setNotifCountMock} />
      </MemoryRouter>
    );
  
    await waitFor(() => {
      // Expect an unauthorized error message or just check that loading stopped
      expect(screen.queryByTestId("loading-text")).not.toBeInTheDocument();
    });
  
    // You can also verify that no notifications are rendered
    expect(screen.queryByText(/New match found!/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Your group has been updated/i)).not.toBeInTheDocument();
  
    // If your component shows an error to the user, assert that here too
    expect(screen.queryByText(/unauthorized/i)).toBeInTheDocument();
  });

  test('should handle error when loading notifications fails', async () => {
    (Storage.prototype.getItem as jest.Mock).mockReturnValueOnce('mock-token');
  
    // Simulate a fetch error (e.g., network failure)
    global.fetch = jest.fn(() =>
      Promise.reject(new Error("Network error"))
    ) as jest.Mock;
  
    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={setNotifCountMock} />
      </MemoryRouter>
    );
  
    await waitFor(() => {
      expect(screen.queryByTestId("loading-text")).not.toBeInTheDocument();
    });
  
    // Check if error message is displayed (adjust this if error is shown via toast, modal, etc.)
    expect(screen.queryByText(/error loading notifications/i)).toBeInTheDocument();
  });

  test('should handle error when deleting a notification fails', async () => {
    (Storage.prototype.getItem as jest.Mock).mockReturnValueOnce('mock-token');
  
    // First fetch to get notifications (succeeds)
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockNotifications),
    });
  
    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={setNotifCountMock} />
      </MemoryRouter>
    );
  
    // Wait for notifications to be rendered
    await waitFor(() => {
      expect(screen.queryByText(/New match found!/i)).toBeInTheDocument();
    });
  
    // Simulate failure when trying to delete a notification
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'));
  
    // Spy on console.error to ensure it's called
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    // Click the delete button
    const deleteButtons = screen.getAllByTestId("delete-notifs");
    fireEvent.click(deleteButtons[0]);
  
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting notification:', expect.any(Error));
    });
  
    // Clean up
    consoleErrorSpy.mockRestore();
  });
  
  test('should navigate to /network?tab=receivedRequests for Match notification', async () => {
    const matchNotif = {
      ...mockNotifications[0],
      type: 'Match',
    };
  
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([matchNotif]),
    });
  
    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={setNotifCountMock} />
      </MemoryRouter>
    );
  
    await waitFor(() => {
      expect(screen.queryByText(/New match found!/i)).toBeInTheDocument();
    });
  
    fireEvent.click(screen.getByText(/New match found!/i));
  
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/network?tab=receivedRequests');
    });
  });

  test('should navigate to /messaging?selectedChatId=123 for Message notification', async () => {
    const messageNotif = {
      id: 3,
      message: 'You have a new message',
      type: 'Message',
      chatID: '123',
      createdAt: '2025-04-13T10:00:00Z',
      isRead: false,
    };
  
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([messageNotif]),
    });
  
    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={setNotifCountMock} />
      </MemoryRouter>
    );
  
    await waitFor(() => {
      expect(screen.getByText(/You have a new message/i)).toBeInTheDocument();
    });
  
    fireEvent.click(screen.getByText(/You have a new message/i));
  
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/messaging?selectedChatId=123');
    });
  });
  
  test('should navigate to group page with studyGroupID if present', async () => {
    const studyGroupNotif = {
      id: 4,
      message: 'Study group update',
      type: 'StudyGroup',
      studyGroupID: '456',
      createdAt: '2025-04-13T11:00:00Z',
      isRead: false,
    };
  
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([studyGroupNotif]),
    });
  
    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={setNotifCountMock} />
      </MemoryRouter>
    );
  
    await waitFor(() => {
      expect(screen.getByText(/Study group update/i)).toBeInTheDocument();
    });
  
    fireEvent.click(screen.getByText(/Study group update/i));
  
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/groups?groupId=456&tab=false');
    });
  });
  
  test('should navigate to messaging if chat exists for StudyGroup with other_id', async () => {
    const otherStudyNotif = {
      id: 5,
      message: 'You’ve been invited to study',
      type: 'StudyGroup',
      user_id: 10,
      other_id: 20,
      createdAt: '2025-04-13T12:00:00Z',
      isRead: false,
    };
  
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([otherStudyNotif]),
    });
  
    const axios = require('axios');
    axios.default.get.mockResolvedValueOnce({
      data: {
        exists: true,
        chatId: '999',
      },
    });
  
    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={setNotifCountMock} />
      </MemoryRouter>
    );
  
    await waitFor(() => {
      expect(screen.getByText(/You’ve been invited to study/i)).toBeInTheDocument();
    });
  
    fireEvent.click(screen.getByText(/You’ve been invited to study/i));
  
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/messaging?selectedChatId=999');
    });
  });
  
  test('should handle errors in handleSelectNotif', async () => {
    const errorNotif = {
      id: 6,
      message: 'Error test',
      type: 'StudyGroup',
      user_id: 1,
      other_id: 2,
      createdAt: '2025-04-13T13:00:00Z',
      isRead: false,
    };
  
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([errorNotif]),
    });
  
    const axios = require('axios');
    axios.default.get.mockRejectedValueOnce(new Error('API Error'));
  
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={setNotifCountMock} />
      </MemoryRouter>
    );
  
    await waitFor(() => {
      expect(screen.getByText(/Error test/i)).toBeInTheDocument();
    });
  
    fireEvent.click(screen.getByText(/Error test/i));
  
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error selecting notification:',
        expect.any(Error)
      );
    });
  
    consoleSpy.mockRestore();
  });
  
  test('should log error if clearing notifications fails', async () => {
    // Mocking the successful fetch to load notifications first
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockNotifications), // mockNotifications should be the data you want to load
    });
  
    // Spy on console.error to capture error logs
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    // Render the component and wait for notifications to load
    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={setNotifCountMock} />
      </MemoryRouter>
    );
  
    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByTestId("loading-text")).not.toBeInTheDocument();
    });
  
    // Verify that notifications are loaded
    await waitFor(() => {
      expect(screen.queryByText(/New match found!/i)).toBeInTheDocument();
      expect(screen.queryByText(/Your group has been updated/i)).toBeInTheDocument();
    });
  
    // Now simulate a failure when clicking the "Clear All" button
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Simulated fetch error')); // Simulate a fetch failure
  
    // Click the "Clear All" button
    const clearAllButton = screen.getByText(/clear all/i);
    fireEvent.click(clearAllButton);
  
    // Wait for the error to be logged to the console
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error clearing notifications:',
        expect.any(Error)
      );
    });
  
    // Clean up the console spy
    consoleSpy.mockRestore();
  });
  
  test('should navigate to messaging if chat exists for StudyGroup with other_id', async () => {
    const studyGroupNotifWithOtherId = {
      id: 5,
      message: 'You’ve been invited to study',
      type: 'StudyGroup',
      user_id: 10,  // Example user_id
      other_id: 20, // other user_id to check for chat existence
      createdAt: '2025-04-13T12:00:00Z',
      isRead: false,
    };
  
    // Mock the notification fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([studyGroupNotifWithOtherId]),
    });
  
    // Mock the axios call for checking chat existence
    const axios = require('axios');
    axios.default.get.mockResolvedValueOnce({
      data: {
        exists: true,  // Simulate that the chat exists
        chatId: '999', // The chat ID to navigate to
      },
    });
  
    // Render the component
    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={setNotifCountMock} />
      </MemoryRouter>
    );
  
    // Wait for the notification to load
    await waitFor(() => {
      expect(screen.getByText(/You’ve been invited to study/i)).toBeInTheDocument();
    });
  
    // Click the notification
    fireEvent.click(screen.getByText(/You’ve been invited to study/i));
  
    // Wait for the navigation to occur
    await waitFor(() => {
      // Ensure navigation happens with the correct URL
      expect(navigateMock).toHaveBeenCalledWith('/messaging?selectedChatId=999');
    });
  });
  
  test('should handle error if fetch response is not ok', async () => {
    const token = 'mock-token'; // Simulate a valid token
    localStorage.setItem('token', token);
  
    // Mock the fetch API to return a response with a non-OK status
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false, // Simulate a failed response
      status: 500, // Simulate a server error (Internal Server Error)
      json: () => Promise.resolve({ message: 'Internal Server Error' }), // Simulate the response body
    });
  
    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={setNotifCountMock} />
      </MemoryRouter>
    );
  
    // Wait for the loading state to finish and check for the error message
    await waitFor(() => {
      expect(screen.queryByTestId("loading-text")).not.toBeInTheDocument();
      expect(screen.queryByText(/Error loading notifications/i)).toBeInTheDocument(); // Ensure error message is displayed
    });
  
  });
  
  
  test('should log error if clearing notifications fails', async () => {
    // Mocking the successful fetch to load notifications first
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockNotifications), // mockNotifications should be the data you want to load
    });
  
    // Spy on console.error to capture error logs
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    // Render the component and wait for notifications to load
    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={setNotifCountMock} />
      </MemoryRouter>
    );
  
    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByTestId("loading-text")).not.toBeInTheDocument();
    });
  
    // Verify that notifications are loaded
    await waitFor(() => {
      expect(screen.queryByText(/New match found!/i)).toBeInTheDocument();
      expect(screen.queryByText(/Your group has been updated/i)).toBeInTheDocument();
    });
  
    // Now simulate a failure when clicking the "Clear All" button
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Simulated fetch error')); // Simulate a fetch failure
  
    // Click the "Clear All" button
    const clearAllButton = screen.getByText(/clear all/i);
    fireEvent.click(clearAllButton);
  
    // Wait for the error to be logged to the console
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error clearing notifications:',
        expect.any(Error)
      );
    });
  
    // Clean up the console spy
    consoleSpy.mockRestore();
  });
  
  test('renders loading state initially', () => {
    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={setNotifCountMock} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('loading-text')).toBeInTheDocument();
  });

  test('renders no new notifications message when there are no notifications', async () => {
    // Mock API response with no notifications
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    ) as jest.Mock;

    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={setNotifCountMock} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No new notifications')).toBeInTheDocument();
    });
  });

  test('displays notifications correctly', async () => {
    const notifications = [
      {
        id: 1,
        message: 'You have a new match!',
        type: 'Match',
        read: false,
        created_at: '2025-04-20',
        user_id: 1,
        other_id: 2,
        chatID: 123,
        studyGroupID: 0,
      },
    ];

    // Mock API response with notifications
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(notifications),
      })
    ) as jest.Mock;

    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={setNotifCountMock} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('You have a new match!')).toBeInTheDocument();
    });
  });

  test('deletes notification', async () => {
    const mockSetNotifCount = jest.fn();
  
    const notifications = [
      {
        id: 1,
        message: 'You have a new match!',
        type: 'Match',
        read: false,
        created_at: '2025-04-20',
        user_id: 1,
        other_id: 2,
        chatID: 123,
        studyGroupID: 0,
      },
    ];
  
    // Mock API response with notifications
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(notifications),
      })
    ) as jest.Mock;
  
    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={mockSetNotifCount} />
      </MemoryRouter>
    );
  
    // Wait for loading to finish and notifications to appear
    await waitFor(() => {
      expect(screen.getByText('You have a new match!')).toBeInTheDocument();
    });
  
    // Ensure the delete button appears
    const deleteButton = screen.getByTestId('delete-notifs');
    expect(deleteButton).toBeInTheDocument();
  
    // Delete notification
    fireEvent.click(deleteButton);
  
    // Wait for notification to be deleted and ensure it's not in the document anymore
    await waitFor(() => {
      expect(mockSetNotifCount).toHaveBeenCalled();
    });
    
    // Now test what that function does
    const updateFn = mockSetNotifCount.mock.calls[0][0];
    expect(typeof updateFn).toBe('function');
    
    // Simulate calling the function with current count = 1
    expect(updateFn(1)).toBe(0);
  });
  
  

  test('handles error in fetching notifications', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('API Error'))
    ) as jest.Mock;

    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={setNotifCountMock} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Error loading notifications')).toBeInTheDocument();
    });
  });

  
    
});
