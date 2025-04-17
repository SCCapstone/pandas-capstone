import { render, screen, fireEvent, act , waitFor} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Settings from '../../pages/settings';
import * as ReactRouterDom from 'react-router-dom';

// 1. Mock all necessary dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('../../components/JoinRequestsContext', () => ({
  useJoinRequest: () => ({
    joinRequests: [],
    refreshRequests: jest.fn(),
  }),
}));

// 2. Proper axios mock
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
  },
}));


// 3. Enhanced fetch mock
beforeEach(() => {
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



// 4. Mock window.location
const mockWindowLocation = () => {
  const location = {
    href: 'http://localhost',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  };
  Object.defineProperty(window, 'location', {
    value: location,
    writable: true,
  });
  return location;
};

describe('Settings Behavioral Test', () => {
  let navigateMock: jest.Mock;
  let location: ReturnType<typeof mockWindowLocation>;

  beforeEach(() => {
    // Initialize mocks
    location = mockWindowLocation();
    navigateMock = jest.fn();
    (ReactRouterDom.useNavigate as jest.Mock).mockReturnValue(navigateMock);
    
    // Mock localStorage
    Storage.prototype.removeItem = jest.fn();
    
    // Clear all mocks between tests
    jest.clearAllMocks();

    
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  
  // If you're using timers anywhere
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
/*
  test('should navigate to the login page when the log out button is clicked', async () => {
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

    // Check which navigation method was used
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
/*
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

  


  test('should complete account deletion flow', async () => {
    
  });
  
  test('should handle delete account failure', async () => {
    
  });

  /*
  test('should handle missing token when deleting account', async () => {
    // 1. Create a fresh mock for this specific test
    const mockFetch = jest.fn();
    global.fetch = mockFetch;
  
    // 2. Explicitly mock no token available
    Storage.prototype.getItem = jest.fn(() => null);
  
    // 3. Mock the user ID function to return null
    jest.mock('../../utils/auth', () => ({
      ...jest.requireActual('../../utils/auth'),
      getLoggedInUserIdString: jest.fn(() => null),
    }));
  
    // 4. Render the component
    await act(async () => {
      render(
        <MemoryRouter>
          <Settings />
        </MemoryRouter>
      );
    });
  
    // 5. Open delete confirmation dialog
    fireEvent.click(screen.getByText('Delete Account'));
    
    // 6. Confirm deletion
    await act(async () => {
      fireEvent.click(screen.getByText('Confirm'));
    });
  
    // 7. Verify no fetch calls were made
    expect(mockFetch).not.toHaveBeenCalled();
  
    // 8. Verify error handling (if your component shows error messages)
    // expect(screen.getByText(/must be logged in/i)).toBeInTheDocument();
  });
  

  test('should handle logout when navigate fails', async () => {
    // Simulate navigate throwing an error
    (ReactRouterDom.useNavigate as jest.Mock).mockImplementation(() => {
      throw new Error('Navigation error');
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <Settings />
        </MemoryRouter>
      );
    });

    fireEvent.click(screen.getByTestId('logout'));
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(window.location.href).toBe('/welcome');
  });
*/
});
