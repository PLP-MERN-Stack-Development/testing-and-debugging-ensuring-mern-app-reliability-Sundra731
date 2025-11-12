// BugForm.test.jsx - Unit tests for BugForm component

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BugForm from '../../components/BugForm';

// Mock console.log to avoid test output pollution
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('BugForm Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    consoleLogSpy.mockClear();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it('renders with default props', () => {
    render(<BugForm onSubmit={mockOnSubmit} />);

    expect(screen.getByTestId('bug-form')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/reporter/i)).toBeInTheDocument();
    expect(screen.getByTestId('bug-submit-button')).toBeInTheDocument();
  });

  it('renders with initial data', () => {
    const initialData = {
      title: 'Existing Bug',
      description: 'Existing description',
      status: 'in-progress',
      priority: 'high',
      reporter: 'John Doe',
      assignee: 'Jane Smith',
      tags: ['urgent', 'frontend']
    };

    render(<BugForm onSubmit={mockOnSubmit} initialData={initialData} />);

    expect(screen.getByDisplayValue('Existing Bug')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.getByText('frontend')).toBeInTheDocument();
  });

  it('updates form fields when user types', () => {
    render(<BugForm onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByTestId('bug-title-input');
    const descriptionInput = screen.getByTestId('bug-description-input');
    const reporterInput = screen.getByTestId('bug-reporter-input');

    fireEvent.change(titleInput, { target: { value: 'New Bug Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'New description' } });
    fireEvent.change(reporterInput, { target: { value: 'New Reporter' } });

    expect(titleInput.value).toBe('New Bug Title');
    expect(descriptionInput.value).toBe('New description');
    expect(reporterInput.value).toBe('New Reporter');
  });

  it('shows validation errors for empty required fields', async () => {
    render(<BugForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByTestId('bug-submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
      expect(screen.getByText('Reporter is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error for title exceeding 100 characters', async () => {
    render(<BugForm onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByTestId('bug-title-input');
    const longTitle = 'a'.repeat(101);
    fireEvent.change(titleInput, { target: { value: longTitle } });

    const submitButton = screen.getByTestId('bug-submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title cannot exceed 100 characters')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error for description exceeding 1000 characters', async () => {
    render(<BugForm onSubmit={mockOnSubmit} />);

    const descriptionInput = screen.getByTestId('bug-description-input');
    const longDescription = 'a'.repeat(1001);
    fireEvent.change(descriptionInput, { target: { value: longDescription } });

    const submitButton = screen.getByTestId('bug-submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Description cannot exceed 1000 characters')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', () => {
    render(<BugForm onSubmit={mockOnSubmit} />);

    // Fill in required fields
    fireEvent.change(screen.getByTestId('bug-title-input'), {
      target: { value: 'Valid Bug Title' }
    });
    fireEvent.change(screen.getByTestId('bug-description-input'), {
      target: { value: 'Valid description' }
    });
    fireEvent.change(screen.getByTestId('bug-reporter-input'), {
      target: { value: 'Valid Reporter' }
    });

    const submitButton = screen.getByTestId('bug-submit-button');
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'Valid Bug Title',
      description: 'Valid description',
      status: 'open',
      priority: 'medium',
      reporter: 'Valid Reporter',
      assignee: '',
      tags: []
    });
  });

  it('adds and removes tags', () => {
    render(<BugForm onSubmit={mockOnSubmit} />);

    const tagInput = screen.getByTestId('bug-tags-input');
    const addButton = screen.getByTestId('add-tag-button');

    // Add a tag
    fireEvent.change(tagInput, { target: { value: 'urgent' } });
    fireEvent.click(addButton);

    expect(screen.getByText('urgent')).toBeInTheDocument();

    // Add another tag
    fireEvent.change(tagInput, { target: { value: 'frontend' } });
    fireEvent.click(addButton);

    expect(screen.getByText('frontend')).toBeInTheDocument();

    // Remove a tag
    const removeButton = screen.getByTestId('remove-tag-urgent');
    fireEvent.click(removeButton);

    expect(screen.queryByText('urgent')).not.toBeInTheDocument();
    expect(screen.getByText('frontend')).toBeInTheDocument();
  });

  it('adds tag when pressing Enter', () => {
    render(<BugForm onSubmit={mockOnSubmit} />);

    const tagInput = screen.getByTestId('bug-tags-input');

    fireEvent.change(tagInput, { target: { value: 'urgent' } });
    fireEvent.keyPress(tagInput, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  it('disables form when loading', () => {
    render(<BugForm onSubmit={mockOnSubmit} isLoading={true} />);

    expect(screen.getByTestId('bug-title-input')).toBeDisabled();
    expect(screen.getByTestId('bug-description-input')).toBeDisabled();
    expect(screen.getByTestId('bug-reporter-input')).toBeDisabled();
    expect(screen.getByTestId('bug-submit-button')).toBeDisabled();
    expect(screen.getByTestId('bug-submit-button')).toHaveTextContent('Submitting...');
  });

  it('clears validation errors when user starts typing', async () => {
    render(<BugForm onSubmit={mockOnSubmit} />);

    // Submit empty form to trigger errors
    fireEvent.click(screen.getByTestId('bug-submit-button'));

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    // Start typing in title field
    fireEvent.change(screen.getByTestId('bug-title-input'), {
      target: { value: 'a' }
    });

    expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
  });

  it('logs form submission data', () => {
    render(<BugForm onSubmit={mockOnSubmit} />);

    // Fill and submit form
    fireEvent.change(screen.getByTestId('bug-title-input'), {
      target: { value: 'Test Bug' }
    });
    fireEvent.change(screen.getByTestId('bug-description-input'), {
      target: { value: 'Test description' }
    });
    fireEvent.change(screen.getByTestId('bug-reporter-input'), {
      target: { value: 'Test Reporter' }
    });

    fireEvent.click(screen.getByTestId('bug-submit-button'));

    expect(consoleLogSpy).toHaveBeenCalledWith('Submitting bug form:', expect.any(Object));
  });
});