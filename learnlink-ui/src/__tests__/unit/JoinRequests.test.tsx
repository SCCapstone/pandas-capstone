import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JoinRequests from '../../components/JoinRequests';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';

// Mock axios with proper ESM handling
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockJoinRequests = [
    {
      id: 1,
      userId: 10,
      targetUserId: null,
      targetGroupId: 100,
      message: 'I would love to join your group!',
      createdAt: '2024-01-01T00:00:00Z',
      user: {
        id: 10,
        firstName: 'Jane',
        lastName: 'Doe',
        profilePic: 'jane.png',
        username: 'janedoe'
      },
      targetGroup: {
        studyGroup: {
          id: 100,
          name: 'Math Study Buddies'
        }
      },
      direction: 'Yes',
      status: 'Pending'
    }
  ];
  
  describe('JoinRequests Component', () => {
    const addNewChatMock = jest.fn();
    const openProfilePopupMock = jest.fn();
  
    beforeEach(() => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockJoinRequests });
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('renders join requests and handles approve/reject', async () => {
      render(
        <JoinRequests
          currentUserId={1}
          addNewChat={addNewChatMock}
          openProfilePopup={openProfilePopupMock}
        />
      );
    
  
      const approveButton = screen.getByRole('button', { name: 'approve' });
      const rejectButton = screen.getByRole('button', { name: 'reject'});

      mockedAxios.put.mockResolvedValue({ data: { status: 'Accepted' } });
  
      fireEvent.click(approveButton);
  
      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledWith('/api/swipes/1/status', {
          status: 'Accepted',
        });
      });
  
      // Click reject
      mockedAxios.put.mockResolvedValue({ data: { status: 'Denied' } });
      fireEvent.click(rejectButton);
  
      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledWith('/api/swipes/1/status', {
          status: 'Denied',
        });
      });
    });
  });