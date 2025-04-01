import React from 'react';
import ConfirmPopup from '../../components/ConfirmPopup';
import {render, screen, fireEvent} from '@testing-library/react';

describe('ConfirmPopup Component', () => {
    it('renders with correct messages and buttons', () => {
        render(<ConfirmPopup  message="Do you want to procced?" onConfirm={() => {}} onCancel={() => {}}/>);

        expect(screen.getByText("Do you want to procced?")).toBeInTheDocument();
        expect(screen.getByText("Confirm")).toBeInTheDocument();
        expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it('calls onConfirm when the button is clicked', () => {
        const handleConfirm = jest.fn();
        render(<ConfirmPopup message="Confirm action?" onConfirm={handleConfirm} onCancel={() => {}}/>);

        fireEvent.click(screen.getByText("Confirm"));
        expect(handleConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when the button is clicked', () => {
        const handleCancel = jest.fn();
        render(<ConfirmPopup message="Confirm action?" onConfirm={() => {}} onCancel={handleCancel}/>);

        fireEvent.click(screen.getByText("Cancel"));
        expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it('renders with custom buttons text', () => {
        render(<ConfirmPopup  message="Custom buttons?" onConfirm={() => {}} onCancel={() => {}} confirmText="Yes" cancelText="No"/>);

        
        expect(screen.getByText("Yes")).toBeInTheDocument();
        expect(screen.getByText("No")).toBeInTheDocument();
    });
});