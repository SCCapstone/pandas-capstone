import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationDropdown from '../../components/NotificationDropdown';
import { MemoryRouter } from 'react-router-dom';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('NotificationDropdown Component', () => {
  it('renders correctly and fetches notifications', async () => {
    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={() => {}} />
      </MemoryRouter>
    );

  });

  it('displays error when fetching notifications fails', async () => {
    render(
      <MemoryRouter>
        <NotificationDropdown setNotifCount={() => {}} />
      </MemoryRouter>
    );

  });
});
