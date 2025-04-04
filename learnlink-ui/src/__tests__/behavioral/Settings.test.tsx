import { render, screen, fireEvent, act } from '@testing-library/react';
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
});