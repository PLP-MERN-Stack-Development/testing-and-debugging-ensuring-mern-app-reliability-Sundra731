// debug.js - Debugging utilities for the server

const util = require('util');

/**
 * Enhanced logging function with timestamps and levels
 * @param {string} level - Log level (info, warn, error, debug)
 * @param {string} message - Log message
 * @param {*} data - Additional data to log
 */
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  switch (level) {
    case 'error':
      console.error(logMessage, data ? util.inspect(data, { depth: 3 }) : '');
      break;
    case 'warn':
      console.warn(logMessage, data ? util.inspect(data, { depth: 3 }) : '');
      break;
    case 'debug':
      if (process.env.NODE_ENV === 'development') {
        console.debug(logMessage, data ? util.inspect(data, { depth: 3 }) : '');
      }
      break;
    default:
      console.log(logMessage, data ? util.inspect(data, { depth: 3 }) : '');
  }
}

/**
 * Debug middleware for logging requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
function debugMiddleware(req, res, next) {
  const start = Date.now();

  log('info', `Request: ${req.method} ${req.url}`, {
    headers: req.headers,
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined
  });

  // Log response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    log('info', `Response: ${res.statusCode} (${duration}ms)`, {
      contentLength: data ? data.length : 0
    });
    originalSend.call(this, data);
  };

  next();
}

/**
 * Performance monitoring function
 * @param {string} operation - Operation name
 * @param {Function} fn - Function to monitor
 * @returns {*} - Result of the function
 */
async function monitorPerformance(operation, fn) {
  const start = process.hrtime.bigint();
  try {
    const result = await fn();
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    log('debug', `Performance: ${operation} took ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000;
    log('error', `Performance: ${operation} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
}

/**
 * Memory usage logger
 */
function logMemoryUsage() {
  const usage = process.memoryUsage();
  log('debug', 'Memory Usage', {
    rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    external: `${(usage.external / 1024 / 1024).toFixed(2)} MB`
  });
}

/**
 * Database query debugger
 * @param {Object} query - Mongoose query object
 * @param {string} operation - Operation description
 */
function debugDatabaseQuery(query, operation) {
  if (process.env.NODE_ENV === 'development') {
    log('debug', `Database Query: ${operation}`, {
      collection: query.model.collection.name,
      conditions: query.getQuery(),
      options: query.getOptions()
    });
  }
}

/**
 * Error stack trace formatter
 * @param {Error} error - Error object
 * @returns {string} - Formatted stack trace
 */
function formatErrorStack(error) {
  if (!error.stack) return error.message;

  const lines = error.stack.split('\n');
  const formattedLines = lines.map((line, index) => {
    if (index === 0) {
      return `🔴 ${line}`;
    }
    // Highlight file paths
    if (line.includes('file://') || line.includes('.js:')) {
      return `📁 ${line.trim()}`;
    }
    return `   ${line.trim()}`;
  });

  return formattedLines.join('\n');
}

/**
 * Development-only debugging utilities
 */
const devTools = {
  /**
   * Inspect object deeply
   * @param {*} obj - Object to inspect
   * @param {string} label - Label for the inspection
   */
  inspect: (obj, label = 'Object Inspection') => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 ${label}:`);
      console.log(util.inspect(obj, { depth: 5, colors: true }));
    }
  },

  /**
   * Time function execution
   * @param {string} label - Timer label
   * @param {Function} fn - Function to time
   */
  time: async (label, fn) => {
    if (process.env.NODE_ENV === 'development') {
      console.time(`⏱️  ${label}`);
      try {
        const result = await fn();
        console.timeEnd(`⏱️  ${label}`);
        return result;
      } catch (error) {
        console.timeEnd(`⏱️  ${label}`);
        throw error;
      }
    }
    return fn();
  }
};

module.exports = {
  log,
  debugMiddleware,
  monitorPerformance,
  logMemoryUsage,
  debugDatabaseQuery,
  formatErrorStack,
  devTools
};