import ProfilePictureModal from "../../components/ProfilePictureModal";
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';

describe('ProfilePictureModal', () => {
    const mockOnSelect = jest.fn();
    const mockOnRequestClose = jest.fn();
  
    beforeEach(() => {
      mockOnSelect.mockClear();
      mockOnRequestClose.mockClear();
    });
  
    test('does not render when isOpen is false', () => {
      const { container } = render(
        <ProfilePictureModal
          isOpen={false}
          onRequestClose={mockOnRequestClose}
          onSelect={mockOnSelect}
        />
      );
  
      expect(container.firstChild).toBeNull();
    });
  
    test('renders when isOpen is true', () => {
      render(
        <ProfilePictureModal
          isOpen={true}
          onRequestClose={mockOnRequestClose}
          onSelect={mockOnSelect}
        />
      );
  
      expect(screen.getByText('Pick your profile picture')).toBeInTheDocument();
      expect(screen.getAllByRole('button').length).toBeGreaterThan(1); // emoji buttons + close button
    });
  
    test('calls onSelect with correct emoji and URL when an emoji is clicked', () => {
      render(
        <ProfilePictureModal
          isOpen={true}
          onRequestClose={mockOnRequestClose}
          onSelect={mockOnSelect}
        />
      );
  
      const cherryButton = screen.getByText('🌸');
      fireEvent.click(cherryButton);
  
      expect(mockOnSelect).toHaveBeenCalledWith(
        '🌸',
        'https://learnlink-pfps.s3.us-east-1.amazonaws.com/profile-pictures/circle_cherry_blossom.png'
      );
    });
  
    test('calls onRequestClose when clicking the close button', () => {
      render(
        <ProfilePictureModal
          isOpen={true}
          onRequestClose={mockOnRequestClose}
          onSelect={mockOnSelect}
        />
      );
  
      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);
  
      expect(mockOnRequestClose).toHaveBeenCalled();
    });
  
    test('calls onRequestClose when clicking outside the modal content', () => {
      render(
        <ProfilePictureModal
          isOpen={true}
          onRequestClose={mockOnRequestClose}
          onSelect={mockOnSelect}
        />
      );
  
      const modalOverlay = screen.getByText('Pick your profile picture').parentElement?.parentElement!;
      fireEvent.click(modalOverlay);
  
      expect(mockOnRequestClose).toHaveBeenCalled();
    });
  });