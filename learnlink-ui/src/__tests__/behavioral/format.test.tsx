import { useEnums, useColleges, useCourses, useUserAgeRange, formatEnum, normalizeCourseInput, selectStyles } from '../../utils/format';
import '@testing-library/jest-dom';
import Groups from '../../pages/groups';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { render, screen, renderHook, act } from '@testing-library/react';
import axios from 'axios';

// Mock axios with proper ESM handling
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock axios
jest.mock('axios', () => ({
    __esModule: true,
    default: {
      get: jest.fn(),
      put: jest.fn(),
    },
  }));
  
  // Mock react-router-dom
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
    useSearchParams: jest.fn(),
  }));
  
  describe('Utility Functions', () => {
    describe('formatEnum', () => {
      it('should format enum strings correctly', () => {
        expect(formatEnum('MORNING_PERSON')).toBe('Morning Person');
        expect(formatEnum('NIGHT_OWL')).toBe('Night Owl');
        expect(formatEnum('VISUAL_LEARNER')).toBe('Visual Learner');
        expect(formatEnum('')).toBe('');
        expect(formatEnum(undefined as unknown as string)).toBe('undefined');
      });
    });
  
    describe('normalizeCourseInput', () => {
      it('should normalize course input strings', () => {
        expect(normalizeCourseInput('CS101')).toBe('CS 101');
        expect(normalizeCourseInput('math 0201A')).toBe('MATH 201A');
        expect(normalizeCourseInput('  eng 005  ')).toBe('ENG 5');
        expect(normalizeCourseInput('invalid')).toBe('INVALID');
      });
    });
  
    describe('selectStyles', () => {
      it('should return the correct styles object', () => {
        expect(selectStyles.control).toBeDefined();
        expect(selectStyles.menu).toBeDefined();
        
        const controlStyles = selectStyles.control({}, { isFocused: false } as any);
        expect(controlStyles).toHaveProperty('border', '.7px solid #3B3C3D');
        
        const focusedControlStyles = selectStyles.control({}, { isFocused: true } as any);
        expect(focusedControlStyles).toHaveProperty('border', '2px solid #4A90E2');
      });
    });
});