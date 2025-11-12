// validation.test.js - Unit tests for validation utilities

const { validateBugData, sanitizeBugData, isValidObjectId } = require('../../src/utils/validation');

describe('Validation Utilities', () => {
  describe('validateBugData', () => {
    it('should validate correct bug data', () => {
      const validData = {
        title: 'Test Bug',
        description: 'This is a test bug description',
        reporter: 'John Doe'
      };

      const result = validateBugData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing title', () => {
      const invalidData = {
        description: 'This is a test bug description',
        reporter: 'John Doe'
      };

      const result = validateBugData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required and must be a string');
    });

    it('should reject empty title', () => {
      const invalidData = {
        title: '   ',
        description: 'This is a test bug description',
        reporter: 'John Doe'
      };

      const result = validateBugData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title cannot be empty');
    });

    it('should reject title exceeding 100 characters', () => {
      const longTitle = 'a'.repeat(101);
      const invalidData = {
        title: longTitle,
        description: 'This is a test bug description',
        reporter: 'John Doe'
      };

      const result = validateBugData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title cannot exceed 100 characters');
    });

    it('should reject missing description', () => {
      const invalidData = {
        title: 'Test Bug',
        reporter: 'John Doe'
      };

      const result = validateBugData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Description is required and must be a string');
    });

    it('should reject description exceeding 1000 characters', () => {
      const longDescription = 'a'.repeat(1001);
      const invalidData = {
        title: 'Test Bug',
        description: longDescription,
        reporter: 'John Doe'
      };

      const result = validateBugData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Description cannot exceed 1000 characters');
    });

    it('should reject invalid status', () => {
      const invalidData = {
        title: 'Test Bug',
        description: 'This is a test bug description',
        status: 'invalid-status',
        reporter: 'John Doe'
      };

      const result = validateBugData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Status must be one of: open, in-progress, resolved, closed');
    });

    it('should reject invalid priority', () => {
      const invalidData = {
        title: 'Test Bug',
        description: 'This is a test bug description',
        priority: 'invalid-priority',
        reporter: 'John Doe'
      };

      const result = validateBugData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Priority must be one of: low, medium, high, critical');
    });

    it('should reject missing reporter', () => {
      const invalidData = {
        title: 'Test Bug',
        description: 'This is a test bug description'
      };

      const result = validateBugData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Reporter is required and must be a string');
    });

    it('should accept valid optional fields', () => {
      const validData = {
        title: 'Test Bug',
        description: 'This is a test bug description',
        status: 'open',
        priority: 'high',
        reporter: 'John Doe',
        assignee: 'Jane Smith',
        tags: ['frontend', 'urgent']
      };

      const result = validateBugData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-string assignee', () => {
      const invalidData = {
        title: 'Test Bug',
        description: 'This is a test bug description',
        reporter: 'John Doe',
        assignee: 123
      };

      const result = validateBugData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Assignee must be a string');
    });

    it('should reject non-array tags', () => {
      const invalidData = {
        title: 'Test Bug',
        description: 'This is a test bug description',
        reporter: 'John Doe',
        tags: 'not-an-array'
      };

      const result = validateBugData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Tags must be an array');
    });

    it('should reject non-string tag elements', () => {
      const invalidData = {
        title: 'Test Bug',
        description: 'This is a test bug description',
        reporter: 'John Doe',
        tags: ['valid-tag', 123, 'another-valid']
      };

      const result = validateBugData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Tag at index 1 must be a string');
    });
  });

  describe('sanitizeBugData', () => {
    it('should trim string fields', () => {
      const data = {
        title: '  Test Bug  ',
        description: '  Test Description  ',
        reporter: '  John Doe  ',
        assignee: '  Jane Smith  '
      };

      const result = sanitizeBugData(data);
      expect(result.title).toBe('Test Bug');
      expect(result.description).toBe('Test Description');
      expect(result.reporter).toBe('John Doe');
      expect(result.assignee).toBe('Jane Smith');
    });

    it('should sanitize tags array', () => {
      const data = {
        title: 'Test Bug',
        description: 'Test Description',
        reporter: 'John Doe',
        tags: ['  tag1  ', '', '  tag2  ', 'tag3']
      };

      const result = sanitizeBugData(data);
      expect(result.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should filter out empty tags', () => {
      const data = {
        title: 'Test Bug',
        description: 'Test Description',
        reporter: 'John Doe',
        tags: ['tag1', '', '   ', 'tag2']
      };

      const result = sanitizeBugData(data);
      expect(result.tags).toEqual(['tag1', 'tag2']);
    });
  });

  describe('isValidObjectId', () => {
    it('should validate correct ObjectId format', () => {
      expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
      expect(isValidObjectId('507f1f77bcf86cd799439012')).toBe(true);
    });

    it('should reject invalid ObjectId formats', () => {
      expect(isValidObjectId('invalid')).toBe(false);
      expect(isValidObjectId('507f1f77bcf86cd79943901')).toBe(false); // too short
      expect(isValidObjectId('507f1f77bcf86cd7994390111')).toBe(false); // too long
      expect(isValidObjectId('507f1f77bcf86cd79943901g')).toBe(false); // invalid character
    });
  });
});