import { render, screen, fireEvent } from '@testing-library/react';
import WelcomeComponent from '../../components/WelcomeComponent';

describe('Welcome Component', () => {
    it('renders component successfully', () => {
        render(<WelcomeComponent />);
        expect(screen.getByText('See LearnLink in Action')).toBeInTheDocument();
        expect(screen.getByText('Why LearnLink?')).toBeInTheDocument();
        expect(screen.getByText('Meet the Team')).toBeInTheDocument();
    });

    it('displays menu buttons with correct text', () => {
        render(<WelcomeComponent />);
        expect(screen.getByText('Study Groups')).toBeInTheDocument();
        expect(screen.getByText('Study Resources')).toBeInTheDocument();
        expect(screen.getByText('Messaging')).toBeInTheDocument();
        const menuButtons = screen.getByText('Calendar Invites', { selector: '.menuButtons' });
        expect(menuButtons).toBeInTheDocument();
    });

    it('renders GitHub link correctly', () => {
        render(<WelcomeComponent />);
        const githubLink = screen.getByText('Check Out Our Code on GitHub');
        expect(githubLink).toBeInTheDocument();
        expect(githubLink).toHaveAttribute('href', 'https://github.com/SCCapstone/pandas-capstone');
    });
});
