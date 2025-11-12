// BugTracker.integration.test.jsx - Integration tests for BugTracker app

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BugList from '../../components/BugList';
import BugForm from '../../components/BugForm';
import { createBug, getBugs, updateBug, deleteBug } from '../../services/api';

// Mock the API module
jest.mock('../../services/api');

// Mock console.log to avoid test output pollution
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('BugTracker Integration Tests', () => {
  beforeEach(() => {
    consoleLogSpy.mockClear();
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  describe('Bug Creation Flow', () => {
    it('creates a new bug and updates the list', async () => {
      const mockBug = {
        _id: '507f1f77bcf86cd799439011',
        title: 'New Integration Test Bug',
        description: 'Testing the full bug creation flow',
        status: 'open',
        priority: 'medium',
        reporter: 'Integration Tester',
        assignee: '',
        tags: ['integration', 'test'],
        createdAt: '2023-01-01T10:00:00.000Z',
        updatedAt: '2023-01-01T10:00:00.000Z'
      };

      // Mock API calls
      createBug.mockResolvedValue(mockBug);
      getBugs.mockResolvedValue({ bugs: [mockBug], pagination: { total: 1, pages: 1 } });

      // Render components
      const { rerender } = render(<BugForm onSubmit={createBug} />);
      const bugList = render(<BugList bugs={[]} onEdit={jest.fn()} onDelete={jest.fn()} onStatusChange={jest.fn()} />);

      // Fill out the form
      fireEvent.change(screen.getByTestId('bug-title-input'), {
        target: { value: 'New Integration Test Bug' }
      });
      fireEvent.change(screen.getByTestId('bug-description-input'), {
        target: { value: 'Testing the full bug creation flow' }
      });
      fireEvent.change(screen.getByTestId('bug-reporter-input'), {
        target: { value: 'Integration Tester' }
      });

      // Add tags
      fireEvent.change(screen.getByTestId('bug-tags-input'), { target: { value: 'integration' } });
      fireEvent.click(screen.getByTestId('add-tag-button'));
      fireEvent.change(screen.getByTestId('bug-tags-input'), { target: { value: 'test' } });
      fireEvent.click(screen.getByTestId('add-tag-button'));

      // Submit the form
      fireEvent.click(screen.getByTestId('bug-submit-button'));

      // Wait for the bug to be created and list to update
      await waitFor(() => {
        expect(createBug).toHaveBeenCalledWith({
          title: 'New Integration Test Bug',
          description: 'Testing the full bug creation flow',
          status: 'open',
          priority: 'medium',
          reporter: 'Integration Tester',
          assignee: '',
          tags: ['integration', 'test']
        });
      });

      // Rerender BugList with new data
      bugList.rerender(<BugList bugs={[mockBug]} onEdit={jest.fn()} onDelete={jest.fn()} onStatusChange={jest.fn()} />);

      // Verify the bug appears in the list
      expect(screen.getByTestId('bug-list')).toBeInTheDocument();
      expect(screen.getByText('New Integration Test Bug')).toBeInTheDocument();
      expect(screen.getByText('Integration Tester')).toBeInTheDocument();
      expect(screen.getByText('integration')).toBeInTheDocument();
      expect(screen.getByText('test')).toBeInTheDocument();
    });
  });

  describe('Bug Filtering and Search', () => {
    const mockBugs = [
      {
        _id: '1',
        title: 'Frontend Bug',
        description: 'UI issue',
        status: 'open',
        priority: 'high',
        reporter: 'Alice',
        tags: ['frontend', 'ui']
      },
      {
        _id: '2',
        title: 'Backend Bug',
        description: 'API error',
        status: 'resolved',
        priority: 'medium',
        reporter: 'Bob',
        tags: ['backend', 'api']
      },
      {
        _id: '3',
        title: 'Database Bug',
        description: 'Connection issue',
        status: 'open',
        priority: 'critical',
        reporter: 'Charlie',
        tags: ['database']
      }
    ];

    it('filters bugs by status', () => {
      render(<BugList bugs={mockBugs} onEdit={jest.fn()} onDelete={jest.fn()} onStatusChange={jest.fn()} />);

      const statusFilter = screen.getByTestId('status-filter');
      fireEvent.change(statusFilter, { target: { value: 'open' } });

      expect(screen.getByText('Frontend Bug')).toBeInTheDocument();
      expect(screen.getByText('Database Bug')).toBeInTheDocument();
      expect(screen.queryByText('Backend Bug')).not.toBeInTheDocument();
    });

    it('filters bugs by priority', () => {
      render(<BugList bugs={mockBugs} onEdit={jest.fn()} onDelete={jest.fn()} onStatusChange={jest.fn()} />);

      const priorityFilter = screen.getByTestId('priority-filter');
      fireEvent.change(priorityFilter, { target: { value: 'critical' } });

      expect(screen.getByText('Database Bug')).toBeInTheDocument();
      expect(screen.queryByText('Frontend Bug')).not.toBeInTheDocument();
      expect(screen.queryByText('Backend Bug')).not.toBeInTheDocument();
    });

    it('searches bugs by title', () => {
      render(<BugList bugs={mockBugs} onEdit={jest.fn()} onDelete={jest.fn()} onStatusChange={jest.fn()} />);

      const searchFilter = screen.getByTestId('search-filter');
      fireEvent.change(searchFilter, { target: { value: 'Frontend' } });

      expect(screen.getByText('Frontend Bug')).toBeInTheDocument();
      expect(screen.queryByText('Backend Bug')).not.toBeInTheDocument();
      expect(screen.queryByText('Database Bug')).not.toBeInTheDocument();
    });

    it('searches bugs by reporter', () => {
      render(<BugList bugs={mockBugs} onEdit={jest.fn()} onDelete={jest.fn()} onStatusChange={jest.fn()} />);

      const searchFilter = screen.getByTestId('search-filter');
      fireEvent.change(searchFilter, { target: { value: 'Alice' } });

      expect(screen.getByText('Frontend Bug')).toBeInTheDocument();
      expect(screen.queryByText('Backend Bug')).not.toBeInTheDocument();
      expect(screen.queryByText('Database Bug')).not.toBeInTheDocument();
    });

    it('searches bugs by tags', () => {
      render(<BugList bugs={mockBugs} onEdit={jest.fn()} onDelete={jest.fn()} onStatusChange={jest.fn()} />);

      const searchFilter = screen.getByTestId('search-filter');
      fireEvent.change(searchFilter, { target: { value: 'backend' } });

      expect(screen.getByText('Backend Bug')).toBeInTheDocument();
      expect(screen.queryByText('Frontend Bug')).not.toBeInTheDocument();
      expect(screen.queryByText('Database Bug')).not.toBeInTheDocument();
    });

    it('clears all filters', () => {
      render(<BugList bugs={mockBugs} onEdit={jest.fn()} onDelete={jest.fn()} onStatusChange={jest.fn()} />);

      // Apply filters
      fireEvent.change(screen.getByTestId('status-filter'), { target: { value: 'open' } });
      fireEvent.change(screen.getByTestId('search-filter'), { target: { value: 'Frontend' } });

      // Should only show Frontend Bug
      expect(screen.getByText('Frontend Bug')).toBeInTheDocument();
      expect(screen.queryByText('Backend Bug')).not.toBeInTheDocument();

      // Clear filters
      fireEvent.click(screen.getByTestId('clear-filters-button'));

      // Should show all bugs again
      expect(screen.getByText('Frontend Bug')).toBeInTheDocument();
      expect(screen.getByText('Backend Bug')).toBeInTheDocument();
      expect(screen.getByText('Database Bug')).toBeInTheDocument();
    });
  });

  describe('Bug Status Update Flow', () => {
    const mockBug = {
      _id: '507f1f77bcf86cd799439011',
      title: 'Status Update Bug',
      description: 'Testing status updates',
      status: 'open',
      priority: 'medium',
      reporter: 'Status Tester'
    };

    it('updates bug status through the UI', async () => {
      const mockOnStatusChange = jest.fn();
      updateBug.mockResolvedValue({ ...mockBug, status: 'resolved' });

      render(<BugList bugs={[mockBug]} onEdit={jest.fn()} onDelete={jest.fn()} onStatusChange={mockOnStatusChange} />);

      const statusSelect = screen.getByTestId('status-select');
      fireEvent.change(statusSelect, { target: { value: 'resolved' } });

      expect(mockOnStatusChange).toHaveBeenCalledWith(mockBug._id, 'resolved');
    });
  });

  describe('Error Handling', () => {
    it('displays error message when API fails', () => {
      const errorMessage = 'Failed to load bugs';
      render(<BugList bugs={[]} onEdit={jest.fn()} onDelete={jest.fn()} onStatusChange={jest.fn()} error={errorMessage} />);

      expect(screen.getByTestId('bug-list-error')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      render(<BugList bugs={[]} onEdit={jest.fn()} onDelete={jest.fn()} onStatusChange={jest.fn()} isLoading={true} />);

      expect(screen.getByTestId('bug-list-loading')).toBeInTheDocument();
      expect(screen.getByText('Loading bugs...')).toBeInTheDocument();
    });

    it('shows empty state message', () => {
      render(<BugList bugs={[]} onEdit={jest.fn()} onDelete={jest.fn()} onStatusChange={jest.fn()} />);

      expect(screen.getByTestId('bug-list-empty')).toBeInTheDocument();
      expect(screen.getByText('No bugs reported yet')).toBeInTheDocument();
    });
  });
});