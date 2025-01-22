// components/Navbar.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';

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
