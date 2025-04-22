import { render, screen, fireEvent, within } from '@testing-library/react';
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

    it('renders all feature boxes under the Why LearnLink section', () => {
        render(<WelcomeComponent />);
        
        // Select the section that contains the feature boxes
        const whyBoxesSection = screen.getByTestId('whyBoxes');    
        // Verify each expected feature box exists
        const expectedBoxes = [
            'Match & Connect',
            'Stay Connected',
            'Weekly Scheduler',
            'Groups Page',
            'Resources Page',
            'Profile Page',
            'Calendar Invites',
            'Network Page'
        ];
        
        expectedBoxes.forEach(text => {
            expect(within(whyBoxesSection).getByText(text)).toBeInTheDocument();
        });
    });

    it('renders all team member profile images in the About Section', () => {
        render(<WelcomeComponent />);
    
        // Array of expected image alt texts
        const expectedImages = [
            'natalie-profile',
            'kelly-profile',
            'rae-profile',
            'kennedy-profile',
            'yesha-profile'
        ];
    
        expectedImages.forEach(altText => {
            expect(screen.getByAltText(altText)).toBeInTheDocument();
        });
    });

    it('renders GitHub link correctly', () => {
        render(<WelcomeComponent />);
        const githubLink = screen.getByText('Check Out Our Code on GitHub');
        expect(githubLink).toBeInTheDocument();
        expect(githubLink).toHaveAttribute('href', 'https://github.com/SCCapstone/pandas-capstone');
    });
});
