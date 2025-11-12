import React, { useState } from 'react';
import PropTypes from 'prop-types';

const BugForm = ({ onSubmit, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'open',
    priority: initialData?.priority || 'medium',
    reporter: initialData?.reporter || '',
    assignee: initialData?.assignee || '',
    tags: initialData?.tags || []
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    if (!formData.reporter.trim()) {
      newErrors.reporter = 'Reporter is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log('Submitting bug form:', formData);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bug-form" data-testid="bug-form">
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className={errors.title ? 'error' : ''}
          placeholder="Enter bug title"
          disabled={isLoading}
          data-testid="bug-title-input"
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className={errors.description ? 'error' : ''}
          placeholder="Describe the bug in detail"
          rows="4"
          disabled={isLoading}
          data-testid="bug-description-input"
        />
        {errors.description && <span className="error-message">{errors.description}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            disabled={isLoading}
            data-testid="bug-status-select"
          >
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            disabled={isLoading}
            data-testid="bug-priority-select"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="reporter">Reporter *</label>
          <input
            type="text"
            id="reporter"
            name="reporter"
            value={formData.reporter}
            onChange={handleInputChange}
            className={errors.reporter ? 'error' : ''}
            placeholder="Your name"
            disabled={isLoading}
            data-testid="bug-reporter-input"
          />
          {errors.reporter && <span className="error-message">{errors.reporter}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="assignee">Assignee</label>
          <input
            type="text"
            id="assignee"
            name="assignee"
            value={formData.assignee}
            onChange={handleInputChange}
            placeholder="Assign to someone"
            disabled={isLoading}
            data-testid="bug-assignee-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags</label>
        <div className="tags-input-container">
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagKeyPress}
            placeholder="Add a tag and press Enter"
            disabled={isLoading}
            data-testid="bug-tags-input"
          />
          <button
            type="button"
            onClick={handleAddTag}
            disabled={isLoading || !tagInput.trim()}
            className="add-tag-btn"
            data-testid="add-tag-button"
          >
            Add Tag
          </button>
        </div>
        {formData.tags.length > 0 && (
          <div className="tags-list" data-testid="tags-list">
            {formData.tags.map((tag, index) => (
              <span key={index} className="tag" data-testid={`tag-${tag}`}>
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="remove-tag-btn"
                  disabled={isLoading}
                  data-testid={`remove-tag-${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="submit-btn"
        data-testid="bug-submit-button"
      >
        {isLoading ? 'Submitting...' : (initialData?._id ? 'Update Bug' : 'Create Bug')}
      </button>
    </form>
  );
};

BugForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  isLoading: PropTypes.bool
};

export default BugForm;