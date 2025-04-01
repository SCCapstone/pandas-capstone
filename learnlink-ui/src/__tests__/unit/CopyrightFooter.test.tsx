import React from 'react';
import CopyrightFooter from '../../components/CopyrightFooter';
import {render, screen} from '@testing-library/react'

describe ('CopyrightFooter Component', () => {
    it('renders the copyright text correctly', () => {
        render(<CopyrightFooter />);

        expect(screen.getByText('© LearnLink')).toBeInTheDocument();
    });
});