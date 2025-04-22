import React from 'react';
import { render, screen } from '@testing-library/react';
import Resources from '../../pages/resources/resources';
import '@testing-library/jest-dom';

// Mock components
jest.mock('../../components/Navbar', () => () => <div data-testid="navbar">Navbar</div>);
jest.mock('../../components/ResourcesNavBar', () => () => <div data-testid="resources-navbar">ResourcesNavBar</div>);
jest.mock('../../components/CopyrightFooter', () => () => <div data-testid="footer">Footer</div>);

describe('Resources Page', () => {
  test('renders without crashing and displays key components', () => {
    render(<Resources />);

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('resources-navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
