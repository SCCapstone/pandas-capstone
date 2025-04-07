import React from 'react';
import { render, screen } from '@testing-library/react';
import Logo from '../../components/Logo';

describe('Logo component', () => {
  it('renders the LearnLink SVG logo', () => {
    render(<Logo />);
    
    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.getByTestId('logo')).toHaveAttribute('aria-label', 'LearnLink Logo');
  });
});