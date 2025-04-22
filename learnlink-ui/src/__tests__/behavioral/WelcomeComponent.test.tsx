import { render, screen, fireEvent, within } from '@testing-library/react';
import WelcomeComponent from '../../components/WelcomeComponent'; 


it('opens and closes the modal correctly for all Why LearnLink boxes', () => {
    render(<WelcomeComponent />);

    // Get the container for all modal-triggering boxes
    const whyBoxesSection = screen.getByTestId('whyBoxes'); // Make sure you add data-testid="whyBoxes" to the div!

    // List of all boxes that should trigger the modal
    const modalTriggerBoxes = [
        'Match & Connect',
        'Stay Connected',
        'Weekly Scheduler',
        'Groups Page',
        'Resources Page',
        'Profile Page',
        'Calendar Invites',
        'Network Page'
    ];

    modalTriggerBoxes.forEach(boxTitle => {
        const box = within(whyBoxesSection).getByText(boxTitle);

        // Click the box to open the modal
        fireEvent.click(box);
        expect(screen.getByRole('img', { name: /expanded screenshot/i })).toBeInTheDocument();

        // Click the close button to close the modal
        const closeButton = screen.getByText('X');
        fireEvent.click(closeButton);
        expect(screen.queryByRole('img', { name: /expanded screenshot/i })).not.toBeInTheDocument();
    });
});