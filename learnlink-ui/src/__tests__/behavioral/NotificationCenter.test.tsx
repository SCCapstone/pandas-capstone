import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationDropdown from '../../components/NotificationDropdown';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

// Mocking axios requests
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('NotificationDropdown Component', () => {

  // Test for successfully fetching and displaying notifications
  it('renders correctly and fetches notifications', async () => {
    const mockNotifications = [
      { id: 1, message: 'New comment on your post', read: false },
      { id: 2, message: 'You have a new follower', read: false },
    ];

    // Mock axios GET request
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockNotifications });

    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={() => {}} />
      </MemoryRouter>
    );

    // Wait for notifications to be displayed
    await waitFor(() => {
      mockNotifications.forEach((notification) => {
        expect(screen.getByText(notification.message)).toBeInTheDocument();
      });
    });
  });

  // Test for error when fetching notifications fails
  it('displays error when fetching notifications fails', async () => {
    const errorMessage = 'Failed to fetch notifications';

    // Mock axios GET request to reject with an error
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={() => {}} />
      </MemoryRouter>
    );

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch notifications')).toBeInTheDocument();
    });
  });

  // Test for loading state
  it('displays loading state while fetching notifications', async () => {
    const mockNotifications = [
      { id: 1, message: 'New comment on your post', read: false },
    ];

    // Mock axios to delay the response
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve({ data: mockNotifications }), 1000))
    );

    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={() => {}} />
      </MemoryRouter>
    );

    // Check if loading message is displayed
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
      expect(screen.getByText('New comment on your post')).toBeInTheDocument();
    });
  });

  // Test for no notifications
  it('displays a message when there are no notifications', async () => {
    // Mock axios to return an empty list of notifications
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={() => {}} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });
  });

  // Test for successfully marking a notification as read
  it('marks a notification as read when clicked', async () => {
    const notifications = [
      { id: 1, message: 'New comment on your post', read: false },
    ];

    // Mock axios GET request
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: notifications });

    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={() => {}} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('New comment on your post')).toBeInTheDocument();
    });

    // Simulate clicking the notification
    fireEvent.click(screen.getByText('New comment on your post'));

    // Mock axios POST request to mark the notification as read
    (axios.post as jest.Mock).mockResolvedValueOnce({ status: 200 });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.any(String), {
        id: 1,
        read: true,
      });
    });
  });

  it('fetches more notifications when scrolling', async () => {
    const notificationsPage1 = [{ id: 1, message: 'First notification' }];
    const notificationsPage2 = [{ id: 2, message: 'Second notification' }];

    // Mock axios to return the first page of notifications
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: notificationsPage1 });

    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={() => {}} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('First notification')).toBeInTheDocument();
    });

    // Simulate scroll event to trigger loading more notifications
    fireEvent.scroll(window, { target: { scrollY: 100 } });

    (axios.get as jest.Mock).mockResolvedValueOnce({ data: notificationsPage2 });

    await waitFor(() => {
      expect(screen.getByText('Second notification')).toBeInTheDocument();
    });
  });
});
