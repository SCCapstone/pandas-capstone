import { render, screen } from '@testing-library/react';
import Navbar from '../../components/Navbar';
import Copyright from '../../components/CopyrightFooter';
import WelcomeComponent from '../../components/WelcomeComponent';
import UserHome from '../../pages/userHome';


jest.mock('../../components/Navbar', () => () => <div data-testid="navbar">Mock Navbar</div>);
jest.mock('../../components/CopyrightFooter', () => () => <div data-testid="copyright">Mock Copyright</div>);
jest.mock('../../components/WelcomeComponent', () => () => <div data-testid="welcome">Mock WelcomeComponent</div>);

describe('UserHome component', () => {
    beforeEach(() => {
      render(<UserHome />);
    });
  
    test('renders the main title', () => {
      expect(screen.getByText(/Learn more about LearnLink!/i)).toBeInTheDocument();
    });
  
    test('renders the brief explanation text', () => {
      expect(screen.getByText(/The best way to find study groups!/i)).toBeInTheDocument();
    });
  
    test('renders Navbar component', () => {
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
  
    test('renders WelcomeComponent', () => {
      expect(screen.getByTestId('welcome')).toBeInTheDocument();
    });
  
    test('renders Copyright component', () => {
      expect(screen.getByTestId('copyright')).toBeInTheDocument();
    });
  });