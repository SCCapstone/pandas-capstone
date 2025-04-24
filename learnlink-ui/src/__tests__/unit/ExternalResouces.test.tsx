import { render, screen } from '@testing-library/react';
import ExternalResources from '../../pages/resources/externalResources';

// Mock the imported components
jest.mock('../../components/Navbar', () => () => <div data-testid="navbar" />);
jest.mock('../../components/ResourcesNavBar', () => () => <div data-testid="resources-navbar" />);
jest.mock('../../components/CopyrightFooter', () => () => <div data-testid="footer" />);

describe('ExternalResources Page', () => {
  beforeEach(() => {
    render(<ExternalResources />);
  });

  it('renders the navbar and footer', () => {
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('resources-navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders the page title', () => {
    expect(screen.getByRole('heading', { name: 'External Resources' })).toBeInTheDocument();
  });

  it('renders scheduling tool section', () => {
    expect(screen.getByText('External Scheduling Tool')).toBeInTheDocument();
    expect(screen.getByText(/Use When2Meet for scheduling/i)).toBeInTheDocument();
    expect(screen.getByText(/Have one group memeber create/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'When2Meet' })).toHaveAttribute('href', 'https://www.when2meet.com');
  });

  it('renders flashcard tool section', () => {
    expect(screen.getByText('Online Flashcard Tool')).toBeInTheDocument();
    expect(screen.getByText(/Use Quizlet to make flashcard sets/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Quizlet' })).toHaveAttribute('href', 'https://quizlet.com');
  });
});
