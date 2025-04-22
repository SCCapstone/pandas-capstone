import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChangePassword from '../../pages/changePassword';

// Mock subcomponents
jest.mock('../../components/Navbar', () => () => <div data-testid="navbar">Mock Navbar</div>);
jest.mock('../../components/CustomAlert', () => (props: any) => (
    <div data-testid={`alert-${props.severity}`}>
      {props.text}
      <button
        data-testid="close-button"
        onClick={props.onClose} // Simulate the close button action
      >
        Close
      </button>
    </div>
  ));
jest.mock('../../components/CopyrightFooter', () => () => <div data-testid="footer">Mock Footer</div>);

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ChangePassword page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(<ChangePassword />);
  });

  test('renders the Change Password form', () => {
    expect(screen.getByRole('heading', { name: /Change Password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Old Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Change Password/i })).toBeInTheDocument();
  });

  test('disables button when loading', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ error: null }),
    });

    fireEvent.change(screen.getByLabelText(/Old Password/i), {
      target: { value: 'oldpass123' },
    });
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: 'newpass456' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    expect(screen.getByRole('button')).toBeDisabled();
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
  });

  test('displays success alert when password changes', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ error: null }),
    });

    fireEvent.change(screen.getByLabelText(/Old Password/i), {
      target: { value: 'oldpass123' },
    });
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: 'newpass456' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));

    await waitFor(() => {
      expect(screen.getByTestId('alert-success')).toBeInTheDocument();
    });
  });

  test('displays warning alert when backend returns a warning', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ warning: 'Password too weak' }),
    });

    fireEvent.change(screen.getByLabelText(/Old Password/i), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: '456' },
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByTestId('alert-warning')).toHaveTextContent('Password too weak');
    });
  });

  test('sets error and adds error alert when backend returns an error', async () => {
    // Mocking the fetch call to simulate an error response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Old password is incorrect' }), // Simulating backend error
    });
  
    fireEvent.change(screen.getByLabelText(/Old Password/i), {
      target: { value: 'wrongpass' }, // Simulating incorrect old password
    });
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: 'newpass123' }, // New password
    });
  
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
  
    // Wait for the alert to appear
    await waitFor(() => {
      // Verify that the error alert is added
      expect(screen.getByTestId('alert-error')).toHaveTextContent('Old password is incorrect');
    });
  
    // Verify that the error state is set
    expect(screen.getByTestId('alert-error')).toBeInTheDocument();
  });

  test('sets error and adds error alert on network failure', async () => {
    // Mocking fetch to simulate a network failure
    mockFetch.mockRejectedValueOnce(new Error('Network Error'));
  
    fireEvent.change(screen.getByLabelText(/Old Password/i), {
      target: { value: 'oldpass' },
    });
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: 'newpass123' },
    });
  
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
  
    // Wait for the alert to appear
    await waitFor(() => {
      // Verify that the error alert is added
      expect(screen.getByTestId('alert-error')).toHaveTextContent('Failed to update password. Please try again later.');
    });
  
    // Verify that the error state is set
    expect(screen.getByTestId('alert-error')).toBeInTheDocument();
  });

  test('removes alert when close button is clicked', async () => {
    // Mocking the fetch to simulate a successful password change
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  
    // Simulate filling out the password form and submitting it
    fireEvent.change(screen.getByLabelText(/Old Password/i), {
      target: { value: 'oldpass' },
    });
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: 'newpass123' },
    });
  
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
  
    // Wait for the success alert to appear
    await waitFor(() => {
      expect(screen.getByTestId('alert-success')).toHaveTextContent('Password updated successfully');
    });
  
    // Simulate closing the alert
    fireEvent.click(screen.getByTestId('close-button'));
  
    // Wait for the alert to be removed
    await waitFor(() => {
      expect(screen.queryByTestId('alert-success')).not.toBeInTheDocument();
    });
  
    // Verify that the alert is removed from the state (i.e., no longer visible)
    expect(screen.queryByTestId('alert-success')).toBeNull();
  });  
  
});
