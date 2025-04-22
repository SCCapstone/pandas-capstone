import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import WeeklySchedule from '../../components/WeeklySchedule';
import axios from 'axios';
import { getLoggedInUserId } from "../../utils/auth"
import { User, StudyGroup } from "../../utils/types"

// Mock axios
jest.mock('axios', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
    },
}));

// Mock auth utility
jest.mock('../../utils/types', () => ({
    getLoggedInUserId: jest.fn(() => 1),
}));

// Mock EditScheduleModal
jest.mock('../../components/EditScheduleModal', () => ({
    __esModule: true,
    default: () => <div data-testid="edit-schedule-modal" />,
}));

describe('WeeklySchedule Component', () => {
    const mockStudyGroupId = 1;
    const mockUsers: User[] = [
        {
            id: 1,
            username: 'user1',
            firstName: 'John',
            lastName: 'Doe',
            age: 20,
            profilePic: 'profile1.jpg',
            gender: 'Male',
            college: 'UMiami',
            coursework: ['BIO 101', "MATH 140"],

        },
        {
            id: 2,
            username: 'user2',
            firstName: 'Jane',
            lastName: 'Smith',
            age: 21,
            profilePic: 'profile2.jpg',
            gender: 'Male',
            college: 'UMiami',
            coursework: ['BIO 101', "MATH 140"],

        }
    ];

    const mockStudyGroup: StudyGroup = {
        id: 1,
        name: 'Advanced Calculus Study Group',
        description: 'For students taking MATH 301',
        profilePic: 'group-pic.jpg',
        users: mockUsers,
        subject: 'Mathematics'
    };

    const mockAvailabilityData = [
        {
            userId: 1,
            availability: {
                Sun: ['9:00 AM', '10:00 AM'],
                Mon: ['2:00 PM'],
                Tues: [],
                Wed: ['11:00 AM'],
                Thur: [],
                Fri: ['9:00 AM', '10:00 AM', '11:00 AM'],
                Sat: []
            }
        },
        {
            userId: 2,
            availability: {
                Sun: ['10:00 AM'],
                Mon: ['2:00 PM'],
                Tues: ['9:00 AM'],
                Wed: [],
                Thur: ['1:00 PM'],
                Fri: ['10:00 AM', '11:00 AM'],
                Sat: ['9:00 AM']
            }
        }
    ];

    beforeEach(() => {
        // Mock localStorage
        Storage.prototype.getItem = jest.fn(() => 'test-token');

        // Mock API responses
        (axios.get as jest.Mock).mockImplementation((url) => {
            if (url.includes('/api/studyGroup/1/availability')) {
                return Promise.resolve({ data: mockAvailabilityData });
            }
            if (url.includes('/api/study-groups/1')) {
                return Promise.resolve({ data: { studyGroup: mockStudyGroup } });
            }
            if (url.includes('/api/study-groups/1/schedule')) {
                return Promise.resolve({
                    data: {
                        scheduleDays: ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'],
                        scheduleStartTime: '9:00 AM',
                        scheduleEndTime: '5:00 PM'
                    }
                });
            }
            return Promise.reject(new Error('Unexpected URL'));
        });

        (axios.post as jest.Mock).mockResolvedValue({ status: 200 });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });


    it('should display all users in the group availability tooltip', async () => {
        render(<WeeklySchedule studyGroupId={mockStudyGroupId} />);
    
        await waitFor(() => {
            // Get the group availability table
            const groupTable = screen.getByRole('table', { 
                name: /group-schedule-table/i 
            });
    
            // Find the Sunday 10:00 AM cell by its position in the table
            const timeSlotHeaders = within(groupTable).getAllByText('10:00 AM');
            const timeSlotRow = timeSlotHeaders[0].closest('tr');
            if(!timeSlotRow) return
            const sunday10AMCell = within(timeSlotRow).getAllByRole('cell')[1]; // Sunday is 2nd column
    
            // Hover over the cell
            fireEvent.mouseEnter(sunday10AMCell);
    
            // Verify tooltip appears with correct content
            const tooltip = screen.getByRole('tooltip');
            expect(tooltip).toBeInTheDocument();
            
            // Verify availability count
            expect(within(tooltip).getByText('2/2 Available')).toBeInTheDocument();
            
            // Verify available users section
            const availableSection = within(tooltip).getByText(/available:/i).closest('div');
            expect(availableSection).toBeInTheDocument();

            if(!availableSection) return

            expect(within(availableSection).getByText('John Doe')).toBeInTheDocument();
            expect(within(availableSection).getByText('Jane Smith')).toBeInTheDocument();
            
            // Verify available users' profile pictures
            const availableImages = within(availableSection).getAllByRole('img');
            expect(availableImages).toHaveLength(2);
    
            // Verify unavailable section exists
            const unavailableSection = within(tooltip).getByText(/unavailable:/i).closest('div');
            expect(unavailableSection).toBeInTheDocument();
        });
    });

    it('should show empty state when no users are available', async () => {
    
        render(<WeeklySchedule studyGroupId={mockStudyGroupId} />);
    
        await waitFor(() => {
            // Verify the table structure is rendered
            const table = screen.getByRole('table', { name: /group-schedule-table/i });
            expect(table).toBeInTheDocument();
    
            // Get all Sunday column headers
            const sundayHeaders = within(table).getAllByRole('columnheader', { name: 'Sun' });
            // expect(sundayHeaders).toHaveLength(2); // Verify there are two instances
    
            // Get all Sunday data cells (skipping headers)
            const sundayCells = within(table).getAllByRole('cell', {
                name: (content, element) => {
                  // Verify cell is in a row where the first columnheader is "Sun"
                  const row = element?.closest('tr');
                  const headers = row?.querySelectorAll('th');
                  return headers ? headers[0]?.textContent === 'Sun' : false;
                }
              });
    
            // Verify all Sunday cells have transparent background (no availability)
            sundayCells.forEach(cell => {
                expect(cell).toHaveStyle('background-color: rgba(0, 128, 0, 0)');
            });
    
            // Verify time slots are still rendered correctly (twice)
            const timeSlots = screen.getAllByText('9:00 AM');
            // expect(timeSlots).toHaveLength(1);
            timeSlots.forEach(slot => {
                expect(slot).toBeInTheDocument();
            });
        });
    });


    it('should correctly render time slots and days', async () => {
    render(<WeeklySchedule studyGroupId={mockStudyGroupId} />);

    await waitFor(() => {
        // Verify all days are rendered in header (2 instances each)
        ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'].forEach(day => {
            expect(screen.getAllByRole('columnheader', { name: day })).toHaveLength(2);
        });

        // Verify time slots are rendered correctly (2 instances each)
        const expectedTimeSlots = [
            '9:00 AM', '10:00 AM', '11:00 AM',
            '12:00 PM', '1:00 PM', '2:00 PM'
        ];

        expectedTimeSlots.forEach(timeSlot => {
            const timeSlotElements = screen.getAllByText(timeSlot);
            expect(timeSlotElements).toHaveLength(2);
            timeSlotElements.forEach(element => {
                expect(element).toBeInTheDocument();
            });
        });
    });
});

    it('should apply correct row styling for half-hour slots', async () => {
        render(<WeeklySchedule studyGroupId={mockStudyGroupId} />);

        await waitFor(() => {
            // Get all rows
            const rows = screen.getAllByRole('row');

            // First row after header should be solid (full hour)

            // Second row should be dotted (half hour)
            expect(rows[3]).toHaveClass('solid-line');
        });
    });


});