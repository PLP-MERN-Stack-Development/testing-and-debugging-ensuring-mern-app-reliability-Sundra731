// BugItem.test.jsx - Unit tests for BugItem component

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BugItem from '../../components/BugItem';

// Mock console.log to avoid test output pollution
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConfirm = jest.fn();

beforeAll(() => {
  global.confirm = mockConfirm;
});

beforeEach(() => {
  consoleLogSpy.mockClear();
  mockConfirm.mockClear();
});

afterAll(() => {
  consoleLogSpy.mockRestore();
  delete global.confirm;
});

const mockBug = {
  _id: '507f1f77bcf86cd799439011',
  title: 'Test Bug Title',
  description: 'This is a detailed description of the test bug that should be truncated in the display.',
  status: 'open',
  priority: 'high',
  reporter: 'John Doe',
  assignee: 'Jane Smith',
  tags: ['urgent', 'frontend'],
  createdAt: '2023-01-01T10:00:00.000Z',
  updatedAt: '2023-01-02T10:00:00.000Z'
};

const mockProps = {
  bug: mockBug,
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onStatusChange: jest.fn()
};

describe('BugItem Component', () => {
  it('renders bug information correctly', () => {
    render(<BugItem {...mockProps} />);

    expect(screen.getByTestId('bug-item-507f1f77bcf86cd799439011')).toBeInTheDocument();
    expect(screen.getByTestId('bug-title')).toHaveTextContent('Test Bug Title');
    expect(screen.getByTestId('bug-description')).toHaveTextContent(/^This is a detailed description/);
    expect(screen.getByTestId('bug-status')).toHaveTextContent('OPEN');
    expect(screen.getByTestId('bug-priority')).toHaveTextContent('HIGH');
    expect(screen.getByTestId('bug-reporter')).toHaveTextContent('John Doe');
    expect(screen.getByTestId('bug-assignee')).toHaveTextContent('Jane Smith');
    expect(screen.getByTestId('bug-id')).toHaveTextContent('#9439011');
  });

  it('renders truncated description when too long', () => {
    const longDescription = 'a'.repeat(200);
    const bugWithLongDesc = { ...mockBug, description: longDescription };

    render(<BugItem {...mockProps} bug={bugWithLongDesc} />);

    const descriptionElement = screen.getByTestId('bug-description');
    expect(descriptionElement.textContent).toHaveLength(153); // 150 chars + '...'
    expect(descriptionElement.textContent).toEndWith('...');
  });

  it('renders tags correctly', () => {
    render(<BugItem {...mockProps} />);

    expect(screen.getByTestId('bug-tag-urgent')).toBeInTheDocument();
    expect(screen.getByTestId('bug-tag-frontend')).toBeInTheDocument();
  });

  it('does not render assignee section when not assigned', () => {
    const bugWithoutAssignee = { ...mockBug, assignee: '' };
    render(<BugItem {...mockProps} bug={bugWithoutAssignee} />);

    expect(screen.queryByTestId('bug-assignee')).not.toBeInTheDocument();
  });

  it('applies correct status color classes', () => {
    const { rerender } = render(<BugItem {...mockProps} />);

    expect(screen.getByTestId('bug-status')).toHaveClass('status-open');

    const bugInProgress = { ...mockBug, status: 'in-progress' };
    rerender(<BugItem {...mockProps} bug={bugInProgress} />);
    expect(screen.getByTestId('bug-status')).toHaveClass('status-in-progress');

    const bugResolved = { ...mockBug, status: 'resolved' };
    rerender(<BugItem {...mockProps} bug={bugResolved} />);
    expect(screen.getByTestId('bug-status')).toHaveClass('status-resolved');

    const bugClosed = { ...mockBug, status: 'closed' };
    rerender(<BugItem {...mockProps} bug={bugClosed} />);
    expect(screen.getByTestId('bug-status')).toHaveClass('status-closed');
  });

  it('applies correct priority color classes', () => {
    const { rerender } = render(<BugItem {...mockProps} />);

    expect(screen.getByTestId('bug-priority')).toHaveClass('priority-high');

    const bugLow = { ...mockBug, priority: 'low' };
    rerender(<BugItem {...mockProps} bug={bugLow} />);
    expect(screen.getByTestId('bug-priority')).toHaveClass('priority-low');

    const bugMedium = { ...mockBug, priority: 'medium' };
    rerender(<BugItem {...mockProps} bug={bugMedium} />);
    expect(screen.getByTestId('bug-priority')).toHaveClass('priority-medium');

    const bugCritical = { ...mockBug, priority: 'critical' };
    rerender(<BugItem {...mockProps} bug={bugCritical} />);
    expect(screen.getByTestId('bug-priority')).toHaveClass('priority-critical');
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<BugItem {...mockProps} />);

    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);

    expect(mockProps.onEdit).toHaveBeenCalledWith(mockBug);
    expect(consoleLogSpy).toHaveBeenCalledWith('Editing bug:', mockBug._id);
  });

  it('calls onDelete when delete button is clicked and confirmed', () => {
    mockConfirm.mockReturnValue(true);
    render(<BugItem {...mockProps} />);

    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete the bug "Test Bug Title"?');
    expect(mockProps.onDelete).toHaveBeenCalledWith(mockBug._id);
    expect(consoleLogSpy).toHaveBeenCalledWith('Deleting bug:', mockBug._id);
  });

  it('does not call onDelete when delete is cancelled', () => {
    mockConfirm.mockReturnValue(false);
    render(<BugItem {...mockProps} />);

    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalled();
    expect(mockProps.onDelete).not.toHaveBeenCalled();
  });

  it('calls onStatusChange when status select changes', () => {
    render(<BugItem {...mockProps} />);

    const statusSelect = screen.getByTestId('status-select');
    fireEvent.change(statusSelect, { target: { value: 'resolved' } });

    expect(mockProps.onStatusChange).toHaveBeenCalledWith(mockBug._id, 'resolved');
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Changing bug status:',
      mockBug._id,
      'from',
      'open',
      'to',
      'resolved'
    );
  });

  it('formats dates correctly', () => {
    render(<BugItem {...mockProps} />);

    expect(screen.getByTestId('bug-created-at')).toBeInTheDocument();
    expect(screen.getByTestId('bug-updated-at')).toBeInTheDocument();
  });

  it('renders all status options in select', () => {
    render(<BugItem {...mockProps} />);

    const statusSelect = screen.getByTestId('status-select');
    expect(statusSelect).toHaveValue('open');

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveValue('open');
    expect(options[1]).toHaveValue('in-progress');
    expect(options[2]).toHaveValue('resolved');
    expect(options[3]).toHaveValue('closed');
  });

  it('handles bug without tags', () => {
    const bugWithoutTags = { ...mockBug, tags: [] };
    render(<BugItem {...mockProps} bug={bugWithoutTags} />);

    expect(screen.queryByTestId(/^bug-tag-/)).not.toBeInTheDocument();
  });

  it('handles bug with empty tags array', () => {
    const bugWithEmptyTags = { ...mockBug, tags: [] };
    render(<BugItem {...mockProps} bug={bugWithEmptyTags} />);

    expect(screen.queryByTestId('bug-tags')).not.toBeInTheDocument();
  });
});