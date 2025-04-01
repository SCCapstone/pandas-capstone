import React from 'react';
import CopyrightFooter from '../../components/CopyrightFooter';
import {render, screen, fireEvent} from '@testing-library/react'
import { MemoryRouter } from 'react-router';

describe ('Copyright Footer Component', () => {
    it('renders the copyright footer', () => {
        render(<MemoryRouter>
            <CopyrightFooter />
            </MemoryRouter>);

        const copyrightElement = screen.getByText('LearnLink');
        expect(copyrightElement).toBeInTheDocument();
    });
});