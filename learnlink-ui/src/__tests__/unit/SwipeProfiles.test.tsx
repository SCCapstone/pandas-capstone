import SwipeProfiles from "../../components/SwipeProfiles";
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('axios', () => ({
    __esModule: true,
    default: {
      get: jest.fn(),
      post: jest.fn(),
      delete: jest.fn(),
    },
  }));

// Mock the fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      profiles: []  // Return empty profiles to trigger "no more profiles" case
    })
  })
) as jest.Mock;

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('SwipeProfiles Component', () => {
  it('displays loading initially and then shows no profiles message', async () => {
    render(
      <MemoryRouter>
        <SwipeProfiles userId={1} />
      </MemoryRouter>
    );
    // Check for loading text
    expect(screen.getByText('loading')).toBeInTheDocument();
    await waitFor(() => {
        expect(
            screen.getByText((content) =>
              content.toLowerCase().includes('no more profiles to swipe on')
            )
          ).toBeInTheDocument();
    });
  });
});