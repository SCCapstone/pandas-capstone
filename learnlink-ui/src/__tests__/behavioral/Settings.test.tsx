import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Settings from '../../pages/settings';
import { MemoryRouter } from "react-router-dom";
import * as ReactRouterDom from 'react-router-dom';

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));


describe('Settings Behaivoral Test', () => {
    let navigateMock: jest.Mock;

    beforeEach(() => {
        navigateMock = jest.fn();
        (ReactRouterDom.useNavigate as jest.Mock).mockReturnValue(navigateMock);
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

  test('should navigate to the welcome page when the log out button is clicked', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getByTestId('logout'));

    expect(navigateMock).toHaveBeenCalledWith('/welcome');
  });

  test('should navigate to the update email page when the update email button is clicked', () => {
    render(
        <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getByTestId('buttonemail'));
    
    expect(navigateMock).toHaveBeenCalledWith('/updateEmail');
  });

  test('should navigate to the change password page when the change password button is clicked', () => {
    render(
        <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getByTestId('buttonchangepass'));
    
    expect(navigateMock).toHaveBeenCalledWith('/changePassword');
  });
});

