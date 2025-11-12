// validation.js - Utility functions for data validation

/**
 * Validates bug data before creation or update
 * @param {Object} bugData - The bug data to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
function validateBugData(bugData) {
  const errors = [];

  // Title validation
  if (!bugData.title || typeof bugData.title !== 'string') {
    errors.push('Title is required and must be a string');
  } else if (bugData.title.trim().length === 0) {
    errors.push('Title cannot be empty');
  } else if (bugData.title.length > 100) {
    errors.push('Title cannot exceed 100 characters');
  }

  // Description validation
  if (!bugData.description || typeof bugData.description !== 'string') {
    errors.push('Description is required and must be a string');
  } else if (bugData.description.trim().length === 0) {
    errors.push('Description cannot be empty');
  } else if (bugData.description.length > 1000) {
    errors.push('Description cannot exceed 1000 characters');
  }

  // Status validation
  const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
  if (bugData.status !== undefined && !validStatuses.includes(bugData.status)) {
    errors.push('Status must be one of: open, in-progress, resolved, closed');
  }

  // Priority validation
  const validPriorities = ['low', 'medium', 'high', 'critical'];
  if (bugData.priority && !validPriorities.includes(bugData.priority)) {
    errors.push('Priority must be one of: low, medium, high, critical');
  }

  // Reporter validation
  if (!bugData.reporter || typeof bugData.reporter !== 'string') {
    errors.push('Reporter is required and must be a string');
  } else if (bugData.reporter.trim().length === 0) {
    errors.push('Reporter cannot be empty');
  }

  // Assignee validation (optional)
  if (bugData.assignee && typeof bugData.assignee !== 'string') {
    errors.push('Assignee must be a string');
  }

  // Tags validation (optional)
  if (bugData.tags) {
    if (!Array.isArray(bugData.tags)) {
      errors.push('Tags must be an array');
    } else {
      bugData.tags.forEach((tag, index) => {
        if (typeof tag !== 'string') {
          errors.push(`Tag at index ${index} must be a string`);
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitizes bug data by trimming strings and removing invalid fields
 * @param {Object} bugData - The bug data to sanitize
 * @returns {Object} - Sanitized bug data
 */
function sanitizeBugData(bugData) {
  const sanitized = { ...bugData };

  // Trim string fields
  ['title', 'description', 'reporter', 'assignee'].forEach(field => {
    if (sanitized[field] && typeof sanitized[field] === 'string') {
      sanitized[field] = sanitized[field].trim();
    }
  });

  // Sanitize tags array
  if (sanitized.tags && Array.isArray(sanitized.tags)) {
    sanitized.tags = sanitized.tags
      .filter(tag => typeof tag === 'string')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }

  return sanitized;
}

/**
 * Validates MongoDB ObjectId format
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId
 */
function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

module.exports = {
  validateBugData,
  sanitizeBugData,
  isValidObjectId
};