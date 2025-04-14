import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResendEmail from '../../components/ResendEmail';

// Mock CustomAlert since we don't need to test its internals
jest.mock('../../components/CustomAlert', () => ({ text, severity, onClose }: any) => (
  <div data-testid="custom-alert">
    <span>{text}</span>
    <button onClick={onClose}>Close</button>
  </div>
));

// Set up global fetch mock
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ResendEmail Component', () => {
  const email = 'test@example.com';
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:2000';

  beforeEach(() => {
    mockFetch.mockReset();
  });

  test('renders button and sends email successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ success: true }),
    });

    render(<ResendEmail email={email} />);

    const button = screen.getByText('Send Reset Link');
    fireEvent.click(button);

    expect(button).toBeDisabled();
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    expect(mockFetch).toHaveBeenCalledWith(`${apiUrl}/api/forgot-password/email`, expect.objectContaining({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }));

    expect(await screen.findByText('Email sent successfully!')).toBeInTheDocument();
    expect(screen.getByTestId('custom-alert')).toBeInTheDocument();
  });

  test('handles API failure response', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ success: false }),
    });

    render(<ResendEmail email={email} />);
    fireEvent.click(screen.getByText('Send Reset Link'));

    await waitFor(() => expect(screen.getByText('Failed to send email.')).toBeInTheDocument());
    expect(screen.getByTestId('custom-alert')).toBeInTheDocument();
  });

  it("handles fetch error (e.g., network issue)", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Network error")));
  
    render(<ResendEmail email="test@example.com" />);
  
    fireEvent.click(screen.getByText("Send Reset Link"));
  
    await waitFor(() => {
      const errorAlerts = screen.getAllByText("Error sending email.");
      expect(errorAlerts.length).toBeGreaterThanOrEqual(2); // span + <p>
    });
  });  

  test('alerts can be dismissed', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ success: true }),
    });

    render(<ResendEmail email={email} />);
    fireEvent.click(screen.getByText('Send Reset Link'));
    const closeButton = await screen.findByText('Close');

    fireEvent.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByTestId('custom-alert')).not.toBeInTheDocument();
    });
  });
});
