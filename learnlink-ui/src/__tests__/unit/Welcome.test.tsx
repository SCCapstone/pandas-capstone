import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Welcome from '../../pages/welcome';
import { useNavigate } from 'react-router-dom';

// Mocks for subcomponents
jest.mock('../../components/Logo', () => () => <div data-testid="logo">Mock Logo</div>);
jest.mock('../../components/WelcomeComponent', () => () => <div data-testid="welcome">Mock WelcomeComponent</div>);
jest.mock('../../components/CopyrightFooter', () => () => <div data-testid="copyright">Mock Copyright</div>);

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Welcome component', () => {
  beforeEach(() => {
    render(<Welcome />);
  });

  test('renders main welcome title', () => {
    expect(screen.getByText(/Welcome to LearnLink!/i)).toBeInTheDocument();
  });

  test('renders subtitle text', () => {
    expect(screen.getByText(/The best way to find study groups!/i)).toBeInTheDocument();
  });

  test('renders Get Started button', () => {
    expect(screen.getByRole('button', { name: /Get Started/i })).toBeInTheDocument();
  });

  test('navigates to /login when Get Started is clicked', () => {
    const button = screen.getByRole('button', { name: /Get Started/i });
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('renders Logo component', () => {
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  test('renders WelcomeComponent', () => {
    expect(screen.getByTestId('welcome')).toBeInTheDocument();
  });

  test('renders Copyright', () => {
    expect(screen.getByTestId('copyright')).toBeInTheDocument();
  });
});
