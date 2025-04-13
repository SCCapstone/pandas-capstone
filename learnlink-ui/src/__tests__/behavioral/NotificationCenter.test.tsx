import React, { JSX } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import NotificationDropdown from '../../components/NotificationDropdown';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

// Utility function to set up the test environment
const renderWithRouter = (ui: JSX.Element) => {
    return render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={ui} />
          {/* You can add other routes if necessary */}
        </Routes>
      </MemoryRouter>
    );
  };
  

describe('NotificationDropdown Component Unit Tests', () => {
    const mockNotifications = [
    {
        id: 1,
        message: 'New match found!',
        createdAt: '2025-04-12T10:00:00Z',
        isRead: false,
    },
    {
        id: 2,
        message: 'Your group has been updated.',
        createdAt: '2025-04-11T14:30:00Z',
        isRead: true,
    },
    ];

    let setNotifCountMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        setNotifCountMock = jest.fn();
        Storage.prototype.getItem = jest.fn(() => 'mock-token');

        global.fetch = jest.fn(() =>
            Promise.resolve({
              ok: true,
              json: () => Promise.resolve(mockNotifications),
            })
          ) as jest.Mock;
    });

    it('should show a loading state while fetching notifications', () => {
        renderWithRouter(<NotificationDropdown setNotifCount={setNotifCountMock} />);
        expect(screen.getByTestId('loading-text')).toBeInTheDocument();
    });

    it('should fetch and display notifications', async () => {

        renderWithRouter(<NotificationDropdown setNotifCount={setNotifCountMock} />);
        expect(await screen.findByText(/New match found!/i)).toBeInTheDocument();

        renderWithRouter(<NotificationDropdown setNotifCount={setNotifCountMock} />);
        expect(await screen.findByText(/Your group has been updated./i)).toBeInTheDocument();

    });

    it('should display Clear All button when there are notifications', async () => {
        renderWithRouter(<NotificationDropdown setNotifCount={setNotifCountMock} />);
        expect(await screen.findByText(/Clear All/i)).toBeInTheDocument();
      });

  


});
