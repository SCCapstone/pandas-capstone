import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPassword from '../../pages/forgotPassword';
import { MemoryRouter, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    // Reset the mock before each test
    jest.clearAllMocks();
  });

  // Test 1: Renders the Forgot Password Page
  test('renders forgot password page', () => {
    render(
      <Router>
        <ForgotPassword />
      </Router>
    );
  
    expect(screen.getByText(/Forgot Password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('example@learnlink.com')).toBeInTheDocument();
    expect(screen.getByText('* Email may take up to 15 minutes to arrive.')).toBeInTheDocument();
  });

  // Test 2: Email input updates on change
  test('email input updates on change', () => {
    render(
      <Router>
        <ForgotPassword />
      </Router>
    );
  
    const emailInput = screen.getByPlaceholderText('example@learnlink.com') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  
    expect(emailInput.value).toBe('test@example.com');
  });

  // Test 3: Show error message when email is blank
  test('shows error when email is blank', async () => {
    render(
      <Router>
        <ForgotPassword />
      </Router>
    );
  
    const submitButton = screen.getByText(/send reset link/i);
    fireEvent.click(submitButton);
  
    expect(await screen.findByText('Email field cannot be blank')).toBeInTheDocument();
  });

  // Test 4: Show error message when invalid email is provided
  test('shows error when invalid email is entered', async () => {
    render(
      <Router>
        <ForgotPassword />
      </Router>
    );
  
    const emailInput = screen.getByPlaceholderText('example@learnlink.com');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
  
    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    fireEvent.click(submitButton);
  
    const messages = await screen.findAllByText('Enter a valid email address', { exact: true });
    expect(messages).toHaveLength(2);
  });

  // Test 5: Show success message when valid email is submitted
  test('shows success message when valid email is submitted', async () => {
    // Mock fetch to simulate a successful API response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Password reset link sent!' }),
      })
    ) as jest.Mock;
  
    render(
      <Router>
        <ForgotPassword />
      </Router>
    );
  
    const emailInput = screen.getByPlaceholderText('example@learnlink.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  
    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    fireEvent.click(submitButton);
  
    const messages = await screen.findAllByText('Password reset link sent! Check Your Email.');
    expect(messages).toHaveLength(2); // because it's shown in two places
  });

  // Test 6: Show error message when API call fails
  test('shows error when API call fails', async () => {
    // Mock the fetch call to simulate a failed API response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to send reset link.' }),
      })
    ) as jest.Mock;
  
    render(
      <Router>
        <ForgotPassword />
      </Router>
    );
  
    const emailInput = screen.getByPlaceholderText('example@learnlink.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  
    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    fireEvent.click(submitButton);
  
    const errorMessages = await screen.findAllByText('Failed to send reset link.');
    expect(errorMessages).toHaveLength(3);
  });
  

  // Test 7: Display CustomAlert component when alerts are present
  test('displays alert when email field is blank and submit is clicked', async () => {
    render(
        <Router>
          <ForgotPassword />
        </Router>
      );
    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    fireEvent.click(submitButton);

    // Wait for alert to appear in DOM
    const alert = await screen.findByText('Email field cannot be blank');
    expect(alert).toBeInTheDocument();
  });

});
