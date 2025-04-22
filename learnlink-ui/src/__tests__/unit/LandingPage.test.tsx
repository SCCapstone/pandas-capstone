import { render, screen } from '@testing-library/react';
import LandingPage from '../../pages/LandingPage';
import '@testing-library/jest-dom'; // Import jest-dom for assertions

// Mock Navbar and CopyrightFooter to focus tests on the content of the page
jest.mock('../../components/Navbar', () => () => <div data-testid="navbar">Navbar</div>);
jest.mock('../../components/CopyrightFooter', () => () => <div data-testid="footer">Footer</div>);

describe('LandingPage', () => {
  test('renders Navbar component', () => {
    render(<LandingPage />);

    // Check if the Navbar is rendered
    const navbar = screen.getByTestId('navbar');
    expect(navbar).toBeInTheDocument();
  });

  test('renders CopyrightFooter component', () => {
    render(<LandingPage />);

    // Check if the CopyrightFooter is rendered
    const footer = screen.getByTestId('footer');
    expect(footer).toBeInTheDocument();
  });

  test('displays the correct informational message', () => {
    render(<LandingPage />);

    // Check if the informational message is displayed correctly
    const message = screen.getByText(/To start matching, please update your ideal match factor via the profile tab!/i);
    expect(message).toBeInTheDocument();
  });

  test('renders the main content section', () => {
    render(<LandingPage />);

    // Check if the main content section exists
    const mainContent = screen.getByRole('main');
    expect(mainContent).toBeInTheDocument();
  });

});
