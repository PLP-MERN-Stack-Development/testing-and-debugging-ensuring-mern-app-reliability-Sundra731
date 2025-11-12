// ErrorBoundary.test.jsx - Unit tests for ErrorBoundary component

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from '../../components/ErrorBoundary';

// Mock console.error to avoid test output pollution
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

// Component that throws an error
const ThrowError = () => {
  throw new Error('Test error');
};

// Component that doesn't throw
const NoError = () => <div>No error here</div>;

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    consoleErrorSpy.mockClear();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <NoError />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error here')).toBeInTheDocument();
    expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument();
  });

  it('renders error UI when an error occurs', () => {
    // Suppress console.error for this test since we're intentionally causing an error
    const originalError = console.error;
    console.error = jest.fn();

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();

    // Restore console.error
    console.error = originalError;
  });

  it('shows error details in development mode', () => {
    // Mock NODE_ENV to be development
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const originalError = console.error;
    console.error = jest.fn();

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error Details (Development Only)')).toBeInTheDocument();
    expect(screen.getByText(/Test error/)).toBeInTheDocument();

    // Restore environment
    process.env.NODE_ENV = originalEnv;
    console.error = originalError;
  });

  it('does not show error details in production mode', () => {
    // Mock NODE_ENV to be production
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const originalError = console.error;
    console.error = jest.fn();

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Error Details (Development Only)')).not.toBeInTheDocument();

    // Restore environment
    process.env.NODE_ENV = originalEnv;
    console.error = originalError;
  });

  it('retries when Try Again button is clicked', () => {
    const originalError = console.error;
    console.error = jest.fn();

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Should show error UI
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();

    // Click retry button
    fireEvent.click(screen.getByTestId('retry-button'));

    // Rerender with no error component
    rerender(
      <ErrorBoundary>
        <NoError />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error here')).toBeInTheDocument();
    expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument();

    console.error = originalError;
  });

  it('logs errors to console', () => {
    const originalError = console.error;
    console.error = jest.fn();

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith('ErrorBoundary caught an error:', expect.any(Error), expect.any(Object));

    console.error = originalError;
  });

  it('handles componentDidCatch correctly', () => {
    const originalError = console.error;
    console.error = jest.fn();

    const errorBoundary = new ErrorBoundary({});
    const mockError = new Error('Mock error');
    const mockErrorInfo = { componentStack: 'Mock stack' };

    errorBoundary.componentDidCatch(mockError, mockErrorInfo);

    expect(errorBoundary.state.hasError).toBe(true);
    expect(errorBoundary.state.error).toBe(mockError);
    expect(errorBoundary.state.errorInfo).toBe(mockErrorInfo);

    console.error = originalError;
  });

  it('handles getDerivedStateFromError correctly', () => {
    const mockError = new Error('Mock error');
    const result = ErrorBoundary.getDerivedStateFromError(mockError);

    expect(result).toEqual({
      hasError: true,
      error: null,
      errorInfo: null
    });
  });
});