// components/Navbar.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../../components/Navbar';

// Mock axios with proper ESM handling
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

jest.mock('../../components/JoinRequestsContext', () => ({
  useJoinRequest: () => ({
    // Mock any required functions/data
    joinRequests: [],
    refreshRequests: jest.fn(),
  }),
}));

describe('Navbar', () => {
  it('renders the logo', () => {
    render(
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      );

      const logoElement = screen.getByTestId('logo');
      expect(logoElement).toBeInTheDocument();

    });
});
