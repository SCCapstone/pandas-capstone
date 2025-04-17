import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Settings from '../../pages/settings';
import * as ReactRouterDom from 'react-router-dom';

// Mock all necessary dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('../../components/JoinRequestsContext', () => ({
  useJoinRequest: () => ({
    joinRequests: [],
    refreshRequests: jest.fn(),
    refetchRequests: jest.fn(),
  }),
}));

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
  },
}));

describe('Settings Behavioral Test', () => {
  let navigateMock: jest.Mock;
  let originalWindowLocation: Location;

  beforeAll(() => {
    // Store original window.location
    originalWindowLocation = window.location;
  });

  beforeEach(() => {
    // Initialize mocks
    navigateMock = jest.fn();
    (ReactRouterDom.useNavigate as jest.Mock).mockReturnValue(navigateMock);
    
    // Mock localStorage
    Storage.prototype.removeItem = jest.fn();
    
    // Mock window.location with proper TypeScript typing
    Object.defineProperty(window, 'location', {
      value: {
        ...originalWindowLocation,
        href: 'http://localhost',
        assign: jest.fn(),
        replace: jest.fn(),
        reload: jest.fn(),
      },
      writable: true,
    });

    // Mock fetch
    global.fetch = jest.fn((url) => {
      if (url.includes('colleges')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes('enums')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      }
      if (url.includes('/api/users/')) {
        return Promise.resolve({});
      }
      if (url.includes('/api/chats')) {
        return Promise.resolve({});
      }
      return Promise.reject(new Error('Unexpected URL'));
    }) as jest.Mock;
  });

  afterEach(() => {
    // Restore original window.location
    Object.defineProperty(window, 'location', {
      value: originalWindowLocation,
      writable: true,
    });
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Clean up any pending timers
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('should navigate to the login page when the log out button is clicked', async () => {
    jest.useFakeTimers();

    await act(async () => {
      render(
        <MemoryRouter>
          <Settings />
        </MemoryRouter>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('logout'));
    });

    // Check navigation
    if (navigateMock.mock.calls.length > 0) {
      expect(navigateMock).toHaveBeenCalledWith('/login');
    } else {
      expect(window.location.href).toBe('/login');
    }
    
    // Verify localStorage was cleared
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
  });


  test('should navigate to the update email page when the update email button is clicked', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Settings />
        </MemoryRouter>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('buttonemail'));
    });

    expect(navigateMock).toHaveBeenCalledWith('/updateEmail');
  });

  test('should navigate to the change password page when the change password button is clicked', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Settings />
        </MemoryRouter>
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('buttonchangepass'));
    });

    expect(navigateMock).toHaveBeenCalledWith('/changePassword');
  });


  test('should show confirmation popup when delete account button is clicked', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Settings />
        </MemoryRouter>
      );
    });
  
    fireEvent.click(screen.getByText('Delete Account'));
    expect(screen.getByTestId('confirm-popup')).toBeInTheDocument();
  });

  

  test('should close confirmation popup when cancel is clicked', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Settings />
        </MemoryRouter>
      );
    });
  
    // Open the popup
    fireEvent.click(screen.getByText('Delete Account'));
    
    // Verify it's open
    expect(screen.getByTestId('confirm-popup')).toBeInTheDocument();
    
    // Click cancel
    fireEvent.click(screen.getByText('Cancel'));
    
    // Use queryByTestId for negative assertions
    expect(screen.queryByTestId('confirm-popup')).not.toBeInTheDocument();
  });

});
