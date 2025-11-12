import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BugItem from './BugItem';

const BugList = ({ bugs, onEdit, onDelete, onStatusChange, isLoading, error }) => {
  const [filter, setFilter] = useState({
    status: '',
    priority: '',
    search: ''
  });

  const [filteredBugs, setFilteredBugs] = useState(bugs);

  useEffect(() => {
    let filtered = [...bugs];

    // Filter by status
    if (filter.status) {
      filtered = filtered.filter(bug => bug.status === filter.status);
    }

    // Filter by priority
    if (filter.priority) {
      filtered = filtered.filter(bug => bug.priority === filter.priority);
    }

    // Filter by search term
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(bug =>
        bug.title.toLowerCase().includes(searchTerm) ||
        bug.description.toLowerCase().includes(searchTerm) ||
        bug.reporter.toLowerCase().includes(searchTerm) ||
        (bug.assignee && bug.assignee.toLowerCase().includes(searchTerm)) ||
        (bug.tags && bug.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }

    console.log('Filtered bugs:', filtered.length, 'out of', bugs.length);
    setFilteredBugs(filtered);
  }, [bugs, filter]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilter({
      status: '',
      priority: '',
      search: ''
    });
  };

  if (error) {
    return (
      <div className="bug-list-error" data-testid="bug-list-error">
        <h3>Error Loading Bugs</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bug-list-container" data-testid="bug-list-container">
      <div className="bug-list-header">
        <h2>Bug Reports ({filteredBugs.length})</h2>

        <div className="filters" data-testid="bug-filters">
          <div className="filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select
              id="status-filter"
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
              data-testid="status-filter"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="priority-filter">Priority:</label>
            <select
              id="priority-filter"
              name="priority"
              value={filter.priority}
              onChange={handleFilterChange}
              data-testid="priority-filter"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="search-filter">Search:</label>
            <input
              type="text"
              id="search-filter"
              name="search"
              value={filter.search}
              onChange={handleFilterChange}
              placeholder="Search bugs..."
              data-testid="search-filter"
            />
          </div>

          {(filter.status || filter.priority || filter.search) && (
            <button
              onClick={clearFilters}
              className="btn btn-secondary clear-filters-btn"
              data-testid="clear-filters-button"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="loading" data-testid="bug-list-loading">
          <p>Loading bugs...</p>
        </div>
      ) : filteredBugs.length === 0 ? (
        <div className="empty-state" data-testid="bug-list-empty">
          {bugs.length === 0 ? (
            <div>
              <h3>No bugs reported yet</h3>
              <p>Be the first to report a bug!</p>
            </div>
          ) : (
            <div>
              <h3>No bugs match your filters</h3>
              <p>Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bug-list" data-testid="bug-list">
          {filteredBugs.map(bug => (
            <BugItem
              key={bug._id}
              bug={bug}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

BugList.propTypes = {
  bugs: PropTypes.arrayOf(
    PropTypes.shape({
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
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string
};

export default BugList;