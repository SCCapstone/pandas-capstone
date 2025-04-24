import { render, screen, waitFor } from '@testing-library/react';
import AccountDetails from '../../pages/accountDetails';
import '@testing-library/jest-dom';

// Mock components
jest.mock('../../components/Navbar', () => () => <div data-testid="navbar">Navbar</div>);
jest.mock('../../components/CopyrightFooter', () => () => <div data-testid="footer">Footer</div>);

// Mock localStorage
beforeEach(() => {
  Storage.prototype.getItem = jest.fn(() => 'fake-token');
});

// Mock fetch
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({
        first_name: 'Alice',
        last_name: 'Smith',
        email: 'alice@example.com',
        username: 'alicesmith'
      }),
    })
  ) as jest.Mock;
});

describe('AccountDetails Page', () => {
  test('renders Navbar and Footer components', async () => {
    render(<AccountDetails />);

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  test('displays user profile information after fetch', async () => {
    render(<AccountDetails />);

    await waitFor(() => {
      expect(screen.getByText(/First Name:/)).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();

      expect(screen.getByText(/Last Name:/)).toBeInTheDocument();
      expect(screen.getByText('Smith')).toBeInTheDocument();

      expect(screen.getByText(/Username:/)).toBeInTheDocument();
      expect(screen.getByText('alicesmith')).toBeInTheDocument();

      expect(screen.getByText(/Email:/)).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    });
  });

  test('displays fallback text when email is missing', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({
        first_name: 'Bob',
        last_name: 'Jones',
        username: 'bobbyj',
        email: '' // Simulate missing email
      }),
    });

    render(<AccountDetails />);

    await waitFor(() => {
      expect(screen.getByText('No email available')).toBeInTheDocument();
    });
  });

  test('logs error to console when fetch fails', async () => {
    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    // Simulate fetch throwing an error
    (global.fetch as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Fetch failed');
    });
  
    render(<AccountDetails />);
  
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching data:',
        expect.any(Error)
      );
    });
  
    consoleErrorSpy.mockRestore(); // Clean up after test
  });

  test('fetches and displays user data if token is present', async () => {
    const mockUserData = {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      username: 'janesmith',
    };

    // Simulate a token in localStorage
    Storage.prototype.getItem = jest.fn(() => 'mock-token');

    // Mock fetch response
    (global.fetch as jest.Mock) = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData),
      })
    );

    render(<AccountDetails />);

    await waitFor(() => {
      expect(screen.getByText(/First Name:/)).toBeInTheDocument();
      expect(screen.getByText(/Jane/)).toBeInTheDocument();
      expect(screen.getByText(/Smith/)).toBeInTheDocument();
      expect(screen.getByText(/janesmith/)).toBeInTheDocument();
      expect(screen.getByText(/jane@example.com/)).toBeInTheDocument();
    });
  });

  test('logs error if fetch fails', async () => {
    Storage.prototype.getItem = jest.fn(() => 'mock-token');
  
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
  
    render(<AccountDetails />);
  
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching data:', expect.any(Error));
    });
  
    consoleErrorSpy.mockRestore();
  });
  
});
