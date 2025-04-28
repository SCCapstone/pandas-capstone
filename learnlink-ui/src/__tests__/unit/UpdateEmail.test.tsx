import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UpdateEmail from '../../pages/updateEmail';
import '@testing-library/jest-dom/extend-expect';

// Mock the child components (Navbar, Footer, CustomAlert)
jest.mock('../../components/Navbar', () => () => <div>Mocked Navbar</div>);
jest.mock('../../components/CustomAlert', () => ({ text, severity, onClose }: any) => (
  <div>
    Mocked CustomAlert - {text} - {severity}
    <button onClick={onClose}>Close Alert</button>
  </div>
));
jest.mock('../../components/CopyrightFooter', () => () => <div>Mocked Footer</div>);

// Mock fetch globally
global.fetch = jest.fn();

describe('UpdateEmail Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<UpdateEmail />);
    expect(screen.getByRole('heading', { name: 'Update Email' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('JohnDoe123@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('JohnDoe1234@email.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update email/i })).toBeInTheDocument();
  });

  it('updates oldEmail and newEmail fields', () => {
    render(<UpdateEmail />);

    const oldEmailInput = screen.getByPlaceholderText('JohnDoe123@email.com') as HTMLInputElement;
    const newEmailInput = screen.getByPlaceholderText('JohnDoe1234@email.com') as HTMLInputElement;

    fireEvent.change(oldEmailInput, { target: { value: 'old@example.com' } });
    fireEvent.change(newEmailInput, { target: { value: 'new@example.com' } });

    expect(oldEmailInput.value).toBe('old@example.com');
    expect(newEmailInput.value).toBe('new@example.com');
  });

  it('shows loading text when submitting', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<UpdateEmail />);

    const oldEmailInput = screen.getByPlaceholderText('JohnDoe123@email.com');
    const newEmailInput = screen.getByPlaceholderText('JohnDoe1234@email.com');
    const submitButton = screen.getByRole('button', { name: /update email/i });

    fireEvent.change(oldEmailInput, { target: { value: 'old@example.com' } });
    fireEvent.change(newEmailInput, { target: { value: 'new@example.com' } });

    fireEvent.click(submitButton);

    expect(submitButton).toHaveTextContent('Updating...');

    await waitFor(() => {
      expect(screen.getByText(/email updated successfully/i)).toBeInTheDocument();
    });
  });

  it('displays error alert when server responds with an error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 451,
      json: async () => ({ error: 'Old email not found.' }),
    });

    render(<UpdateEmail />);

    fireEvent.change(screen.getByPlaceholderText('JohnDoe123@email.com'), { target: { value: 'old@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('JohnDoe1234@email.com'), { target: { value: 'new@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /update email/i }));

    await waitFor(() => {
      expect(screen.getByText(/old email not found/i)).toBeInTheDocument();
    });
  });

  it('displays network error if fetch fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<UpdateEmail />);

    fireEvent.change(screen.getByPlaceholderText('JohnDoe123@email.com'), { target: { value: 'old@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('JohnDoe1234@email.com'), { target: { value: 'new@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /update email/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to update email/i)).toBeInTheDocument();
    });
  });


  it('displays warning alert when server responds with 452', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 452,
      json: async () => ({ error: 'Warning: same email' }),
    });

    render(<UpdateEmail />);

    fireEvent.change(screen.getByPlaceholderText('JohnDoe123@email.com'), { target: { value: 'old@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('JohnDoe1234@email.com'), { target: { value: 'new@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /update email/i }));

    await waitFor(() => {
      expect(screen.getByText(/warning: same email/i)).toBeInTheDocument();
    });
  });

  it('displays error alert when server responds with 453', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 453,
      json: async () => ({ error: 'Error 453 occurred' }),
    });

    render(<UpdateEmail />);

    fireEvent.change(screen.getByPlaceholderText('JohnDoe123@email.com'), { target: { value: 'old@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('JohnDoe1234@email.com'), { target: { value: 'new@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /update email/i }));

    await waitFor(() => {
      expect(screen.getByText(/error 453 occurred/i)).toBeInTheDocument();
    });
  });

  it('displays error alert when server responds with 454', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 454,
      json: async () => ({ error: 'Error 454 occurred' }),
    });

    render(<UpdateEmail />);

    fireEvent.change(screen.getByPlaceholderText('JohnDoe123@email.com'), { target: { value: 'old@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('JohnDoe1234@email.com'), { target: { value: 'new@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /update email/i }));

    await waitFor(() => {
      expect(screen.getByText(/error 454 occurred/i)).toBeInTheDocument();
    });
  });

  it('displays default error alert when server responds with unexpected status', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' }),
    });

    render(<UpdateEmail />);

    fireEvent.change(screen.getByPlaceholderText('JohnDoe123@email.com'), { target: { value: 'old@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('JohnDoe1234@email.com'), { target: { value: 'new@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /update email/i }));

    await waitFor(() => {
      expect(screen.getByText(/an error occurred/i)).toBeInTheDocument();
    });
  });
});
