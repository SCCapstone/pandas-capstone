import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FullScrenAlert from '../../components/FullScreenAlert';

describe('FullScreenAlert (ConfirmPopup) Component', () => {
    const testMessage = 'Are you sure you want to continue?';
    const testHeader = 'Caution!';
    const testButtonText = 'Dismiss';
    const onCancelMock = jest.fn();
  
    beforeEach(() => {
      render(
        <FullScrenAlert
          message={testMessage}
          HeaderText={testHeader}
          buttonText={testButtonText}
          OnCancel={onCancelMock}
        />
      );
    });
  
    it('renders with the correct header and message', () => {
      expect(screen.getByRole('heading', { name: testHeader })).toBeInTheDocument();
      expect(screen.getByText(testMessage)).toBeInTheDocument();
    });
  
    it('renders the custom button text', () => {
      expect(screen.getByRole('button', { name: testButtonText })).toBeInTheDocument();
    });
  
    it('calls OnCancel when the button is clicked', () => {
      fireEvent.click(screen.getByRole('button', { name: testButtonText }));
      expect(onCancelMock).toHaveBeenCalledTimes(1);
    });
  });