import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '../../components/Navbar';
import { act } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock custom hooks
jest.mock('../../utils/format', () => ({
  useEnums: jest.fn(),
  useColleges: jest.fn(),
}));

// Mock auth utility
jest.mock('../../utils/auth', () => ({
  getLoggedInUserId: jest.fn(),
}));

// Mock JoinRequestsContext
jest.mock('../../components/JoinRequestsContext', () => ({
  useJoinRequest: jest.fn(),
}));

type IconProps = {
  'data-testid'?: string;
  className?: string;
  onClick?: () => void;
};

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaSearch: ({ 'data-testid': testId, ...props }: IconProps) => (
    <span data-testid={testId} {...props}>SearchIcon</span>
  ),
  FaBell: ({ 'data-testid': testId, ...props }: IconProps) => (
    <span data-testid={testId} {...props}>BellIcon</span>
  ),
  FaCog: ({ 'data-testid': testId, ...props }: IconProps) => (
    <span data-testid={testId} {...props}>CogIcon</span>
  ),
  FaUserCircle: ({ 'data-testid': testId, ...props }: IconProps) => (
    <span data-testid={testId} {...props}>UserIcon</span>
  ),
  FaTimes: ({ 'data-testid': testId, ...props }: IconProps) => (
    <span data-testid={testId} {...props}>CloseIcon</span>
  ),
  FaSlidersH: ({ 'data-testid': testId, ...props }: IconProps) => (
    <span data-testid={testId} {...props}>SliderIcon</span>
  ),
  FaBars: ({ 'data-testid': testId, ...props }: IconProps) => (
    <span data-testid={testId} {...props}>MenuIcon</span>
  ),
}));

// Mock react-select
jest.mock('react-select', () => ({
  __esModule: true,
  default: jest.fn(({ options, value, onChange }) => (
    <select
      data-testid="mock-select"
      value={value ? value.value : ''}
      onChange={(e) => onChange(options.find((opt:any) => opt.value === e.target.value))}
    >
      {options.map(({ value, label }: any) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  )),
}));

// Mock Logo component
jest.mock('../../components/Logo', () => () => <div>MockLogo</div>);

// Mock NotificationDropdown
jest.mock('../../components/NotificationDropdown', () => () => (
  <div data-testid="notification-dropdown">NotificationDropdown</div>
));

// Mock JoinRequestsNotificationBadge
jest.mock('../../components/JoinRequestsNotificationBadge', () => () => (
  <div data-testid="join-requests-badge">JoinRequestsBadge</div>
));

describe('Navbar Component Unit Tests', () => {
  const mockNavigate = jest.fn();
  const mockSetSearchParams = jest.fn();
  const mockSearchParams = new URLSearchParams();
  
  const mockUseEnums = {
    grade: ['Freshman', 'Sophomore', 'Junior', 'Senior'],
    gender: ['Male', 'Female', 'Nonbinary', 'Other', 'Prefer not to say'],
    studyHabitTags: ['Morning', 'Evening', 'Group', 'Solo'],
  };

  const mockUseColleges = {
    isLoading: false,
    colleges: ['College1', 'College2', 'College3'],
  };

  const mockUseJoinRequest = {
    joinRequestCount: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/' });
    (useSearchParams as jest.Mock).mockReturnValue([mockSearchParams, mockSetSearchParams]);
    (require('../../utils/format').useEnums as jest.Mock).mockReturnValue(mockUseEnums);
    (require('../../utils/format').useColleges as jest.Mock).mockReturnValue(mockUseColleges);
    (require('../../utils/auth').getLoggedInUserId as jest.Mock).mockReturnValue(1);
    (require('../../components/JoinRequestsContext').useJoinRequest as jest.Mock).mockReturnValue(mockUseJoinRequest);
    
    // Mock fetch globally
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ users: [] }),
      })
    );
  });

  it('should render the Navbar component with all main elements', () => {
    render(<Navbar />);
    
    expect(screen.getByText('MockLogo')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '' })).toBeInTheDocument();
    expect(screen.getByText('SearchIcon')).toBeInTheDocument();
    expect(screen.getByText('BellIcon')).toBeInTheDocument();
    expect(screen.getByText('CogIcon')).toBeInTheDocument();
    expect(screen.getByText('UserIcon')).toBeInTheDocument();
  });

  it('should display navigation links', () => {
    render(<Navbar />);
    
    // Test regular navigation links (not mobile menu)
    const navLinks = screen.getByTestId('nav-links');
    
    // Use within to scope queries to just the regular nav links
    expect(within(navLinks).getByText('Match')).toBeInTheDocument();
    expect(within(navLinks).getByText('Profile')).toBeInTheDocument();
    expect(within(navLinks).getByText('Network')).toBeInTheDocument();
    expect(within(navLinks).getByText('Messaging')).toBeInTheDocument();
    expect(within(navLinks).getByText('Groups')).toBeInTheDocument();
    expect(within(navLinks).getByText('Resources')).toBeInTheDocument();
  });
 
  it('should toggle mobile menu when hamburger icon is clicked (mobile view)', () => {
    // Set mobile viewport size
    window.innerWidth = 500;
    window.dispatchEvent(new Event('resize'));
  
    render(<Navbar />);
    
    // Hamburger icon should be visible in mobile view
    const hamburgerIcon = screen.getByText('MenuIcon');
    expect(hamburgerIcon).toBeInTheDocument();
  
    // Mobile menu should be hidden initially
    const mobileMenu = screen.getByTestId('mobile-menu');
    expect(mobileMenu).not.toHaveClass('show');
  
    // Click the hamburger menu icon
    fireEvent.click(hamburgerIcon);
  
    // Click the close icon
    const closeIcon = screen.getByText('CloseIcon');
    fireEvent.click(closeIcon);
  
    // Mobile menu should be hidden again
    expect(mobileMenu).not.toHaveClass('show');
  });

  
  it('should navigate to correct pages when icons are clicked', () => {
    const mockNavigate = jest.fn() as jest.MockedFunction<typeof useNavigate>;
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  
    render(<Navbar />);
    
    // Test settings icon navigation
    const settingsIcon = screen.getByTestId('settings-icon') as HTMLButtonElement;
    fireEvent.click(settingsIcon);
    expect(mockNavigate).toHaveBeenCalledWith('/settings');
    
    // Test user icon navigation
    const userIcon = screen.getByTestId('user-icon') as HTMLButtonElement;
    fireEvent.click(userIcon);
    expect(mockNavigate).toHaveBeenCalledWith('/accountDetails');
  });
  

  it('should show notification dropdown when bell icon is clicked', () => {
    render(<Navbar />);
    
    expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();
    
    fireEvent.click(screen.getByText('BellIcon'));
    expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('BellIcon'));
    expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();
  });

  it('should display join request notification badge', () => {
    (require('../../components/JoinRequestsContext').useJoinRequest as jest.Mock).mockReturnValue({
      joinRequestCount: 3,
    });
    
    render(<Navbar />);
    
    expect(screen.getByTestId('join-requests-badge')).toBeInTheDocument();
  });




});