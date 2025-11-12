import React from 'react';
import PropTypes from 'prop-types';

const BugItem = ({ bug, onEdit, onDelete, onStatusChange }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'status-open';
      case 'in-progress': return 'status-in-progress';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      default: return 'status-default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'priority-low';
      case 'medium': return 'priority-medium';
      case 'high': return 'priority-high';
      case 'critical': return 'priority-critical';
      default: return 'priority-default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusChange = (newStatus) => {
    console.log('Changing bug status:', bug._id, 'from', bug.status, 'to', newStatus);
    onStatusChange(bug._id, newStatus);
  };

  const handleEdit = () => {
    console.log('Editing bug:', bug._id);
    onEdit(bug);
  };

  const handleDelete = () => {
    console.log('Deleting bug:', bug._id);
    if (window.confirm(`Are you sure you want to delete the bug "${bug.title}"?`)) {
      onDelete(bug._id);
    }
  };

  return (
    <div className="bug-item" data-testid={`bug-item-${bug._id}`}>
      <div className="bug-header">
        <h3 className="bug-title" data-testid="bug-title">{bug.title}</h3>
        <div className="bug-actions">
          <button
            onClick={handleEdit}
            className="btn btn-secondary btn-sm"
            data-testid="edit-button"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-danger btn-sm"
            data-testid="delete-button"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bug-meta">
        <span className={`status-badge ${getStatusColor(bug.status)}`} data-testid="bug-status">
          {bug.status.replace('-', ' ').toUpperCase()}
        </span>
        <span className={`priority-badge ${getPriorityColor(bug.priority)}`} data-testid="bug-priority">
          {bug.priority.toUpperCase()}
        </span>
        <span className="bug-id" data-testid="bug-id">#{bug._id.slice(-6)}</span>
      </div>

      <p className="bug-description" data-testid="bug-description">
        {bug.description.length > 150
          ? `${bug.description.substring(0, 150)}...`
          : bug.description
        }
      </p>

      <div className="bug-details">
        <div className="detail-row">
          <span className="label">Reporter:</span>
          <span className="value" data-testid="bug-reporter">{bug.reporter}</span>
        </div>
        {bug.assignee && (
          <div className="detail-row">
            <span className="label">Assignee:</span>
            <span className="value" data-testid="bug-assignee">{bug.assignee}</span>
          </div>
        )}
        <div className="detail-row">
          <span className="label">Created:</span>
          <span className="value" data-testid="bug-created-at">{formatDate(bug.createdAt)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Updated:</span>
          <span className="value" data-testid="bug-updated-at">{formatDate(bug.updatedAt)}</span>
        </div>
      </div>

      {bug.tags && bug.tags.length > 0 && (
        <div className="bug-tags" data-testid="bug-tags">
          {bug.tags.map((tag, index) => (
            <span key={index} className="tag" data-testid={`bug-tag-${tag}`}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="status-controls">
        <label htmlFor={`status-select-${bug._id}`}>Change Status:</label>
        <select
          id={`status-select-${bug._id}`}
          value={bug.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          data-testid="status-select"
        >
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>
    </div>
  );
};

BugItem.propTypes = {
  bug: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['open', 'in-progress', 'resolved', 'closed']).isRequired,
    priority: PropTypes.oneOf(['low', 'medium', 'high', 'critical']).isRequired,
    reporter: PropTypes.string.isRequired,
    assignee: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired
};

export default BugItem;