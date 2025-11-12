// api.js - API service for bug tracker

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Generic API request function
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} - Response data or throws error
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  console.log('API Request:', config.method || 'GET', url);

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    console.log('API Response:', response.status, data);

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get all bugs with optional filtering
 * @param {object} params - Query parameters
 * @returns {Promise} - Bugs data
 */
export const getBugs = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = `/bugs${queryString ? `?${queryString}` : ''}`;
  return apiRequest(endpoint);
};

/**
 * Get a single bug by ID
 * @param {string} id - Bug ID
 * @returns {Promise} - Bug data
 */
export const getBug = async (id) => {
  if (!id) throw new Error('Bug ID is required');
  return apiRequest(`/bugs/${id}`);
};

/**
 * Create a new bug
 * @param {object} bugData - Bug data
 * @returns {Promise} - Created bug data
 */
export const createBug = async (bugData) => {
  return apiRequest('/bugs', {
    method: 'POST',
    body: JSON.stringify(bugData)
  });
};

/**
 * Update an existing bug
 * @param {string} id - Bug ID
 * @param {object} bugData - Updated bug data
 * @returns {Promise} - Updated bug data
 */
export const updateBug = async (id, bugData) => {
  if (!id) throw new Error('Bug ID is required');
  return apiRequest(`/bugs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bugData)
  });
};

/**
 * Delete a bug
 * @param {string} id - Bug ID
 * @returns {Promise} - Success message
 */
export const deleteBug = async (id) => {
  if (!id) throw new Error('Bug ID is required');
  return apiRequest(`/bugs/${id}`, {
    method: 'DELETE'
  });
};

/**
 * Update bug status
 * @param {string} id - Bug ID
 * @param {string} status - New status
 * @returns {Promise} - Updated bug data
 */
export const updateBugStatus = async (id, status) => {
  if (!id) throw new Error('Bug ID is required');
  if (!status) throw new Error('Status is required');

  return apiRequest(`/bugs/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
};

// Export default object for easier importing
const apiService = {
  getBugs,
  getBug,
  createBug,
  updateBug,
  deleteBug,
  updateBugStatus
};

export default apiService;