import { render, screen, fireEvent } from '@testing-library/react';
import WelcomeComponent from '../../components/WelcomeComponent'; 

it('opens and closes the modal correctly', () => {
    render(<WelcomeComponent />);
    const studySmarterBox = screen.getByText('Match & Connect');
    
    fireEvent.click(studySmarterBox);
    expect(screen.getByRole('img', { name: /expanded screenshot/i })).toBeInTheDocument();

    const closeButton = screen.getByText('X');
    fireEvent.click(closeButton);
    expect(screen.queryByRole('img', { name: /expanded screenshot/i })).not.toBeInTheDocument();
});