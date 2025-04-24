import { render, screen } from '@testing-library/react';
import StudyTips from '../../pages/resources/studyTips';

// Mock components that are imported in StudyTips
jest.mock('../../components/Navbar', () => () => <div data-testid="navbar" />);
jest.mock('../../components/ResourcesNavBar', () => () => <div data-testid="resources-navbar" />);
jest.mock('../../components/CopyrightFooter', () => () => <div data-testid="footer" />);

describe('StudyTips Page', () => {
  beforeEach(() => {
    render(<StudyTips />);
  });

  it('renders the navbar and footer', () => {
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('resources-navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders the page title', () => {
    expect(screen.getByRole('heading', { name: 'Study Tips' })).toBeInTheDocument();
  });

  it('renders all study tip headings and descriptions', () => {
    expect(screen.getByText('Collaborate Asynchronously')).toBeInTheDocument();
    expect(screen.getByText(/Create shared Quizlet study cards/i)).toBeInTheDocument();

    expect(screen.getByText('Choose Study Location Wisely')).toBeInTheDocument();
    expect(screen.getByText(/Ensure that the needs of each group member/i)).toBeInTheDocument();

    expect(screen.getByText('Teach Eachother')).toBeInTheDocument();
    expect(screen.getByText(/Take turns explaining the content/i)).toBeInTheDocument();

    expect(screen.getByText('Dumb It Down')).toBeInTheDocument();
    expect(screen.getByText(/attempt to explain it to eachother as if the other person/i)).toBeInTheDocument();
  });
});
