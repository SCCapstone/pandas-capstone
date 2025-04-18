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
    
});
