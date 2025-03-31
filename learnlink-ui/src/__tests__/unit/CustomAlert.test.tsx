import React from 'react';
import CustomAlert from '../../components/CustomAlert';
import {render, screen, fireEvent} from '@testing-library/react';

describe('CustomAlert component', () => {
    it('calls onClose when close button is clicked', () => {
        const handleClose = jest.fn();
        render(<CustomAlert text="Closable alert" severity="info" onClose={handleClose} />);

        fireEvent.click(screen.getByRole('button'));
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('renders with correct text and serverity', () => {
        render(<CustomAlert text="This is a test alert" severity="error" onClose={() => {}}/>);

        expect(screen.getByText("Error:")).toBeInTheDocument();
        expect(screen.getByText("This is a test alert")).toBeInTheDocument();
    });

    it('renders different serverity correctly', () =>{
        render(<CustomAlert text="Warning message" severity="warning" onClose={() => {}}/>);
        expect(screen.getByText("Warning:")).toBeInTheDocument();

        render(<CustomAlert text="Info message" severity="info" onClose={() => {}}/>);
        expect(screen.getByText("Info:")).toBeInTheDocument();

        render(<CustomAlert text="Success message" severity="success" onClose={() => {}}/>);
        expect(screen.getByText("Success:")).toBeInTheDocument();
    });
});
