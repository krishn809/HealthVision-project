import mongoose from "mongoose";

/**
 * Validate if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {number} maxLimit - Maximum allowed limit (default: 100)
 * @returns {object} - Validated pagination params
 */
export const validatePagination = (page, limit, maxLimit = 100) => {
  const validatedPage = Math.max(1, parseInt(page) || 1);
  const validatedLimit = Math.min(maxLimit, Math.max(1, parseInt(limit) || 20));
  const skip = (validatedPage - 1) * validatedLimit;

  return {
    page: validatedPage,
    limit: validatedLimit,
    skip,
  };
};

/**
 * Calculate pagination metadata
 * @param {number} totalCount - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} - Pagination metadata
 */
export const getPaginationMetadata = (totalCount, page, limit) => {
  const totalPages = Math.ceil(totalCount / limit);

  return {
    currentPage: page,
    totalPages,
    totalCount,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Validate date range
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {object|null} - Date range query object or null if invalid
 */
export const validateDateRange = (startDate, endDate) => {
  const dateQuery = {};

  if (startDate) {
    const start = new Date(startDate);
    if (!isNaN(start.getTime())) {
      dateQuery.$gte = start;
    }
  }

  if (endDate) {
    const end = new Date(endDate);
    if (!isNaN(end.getTime())) {
      dateQuery.$lte = end;
    }
  }

  return Object.keys(dateQuery).length > 0 ? dateQuery : null;
};

/**
 * Sanitize user input to prevent injection attacks
 * @param {string} input - User input string
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return "";

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .substring(0, 5000); // Limit length
};

/**
 * Validate enum value
 * @param {string} value - Value to validate
 * @param {Array} validValues - Array of valid values
 * @param {string} defaultValue - Default value if invalid
 * @returns {string} - Validated value
 */
export const validateEnum = (value, validValues, defaultValue = null) => {
  return validValues.includes(value) ? value : defaultValue;
};

/**
 * Create standardized error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {object} additionalData - Additional error data
 * @returns {object} - Error response object
 */
export const createErrorResponse = (
  message,
  statusCode = 500,
  additionalData = {},
) => {
  return {
    success: false,
    message,
    statusCode,
    ...additionalData,
  };
};

/**
 * Create standardized success response
 * @param {string} message - Success message
 * @param {object} data - Response data
 * @param {object} additionalData - Additional response data
 * @returns {object} - Success response object
 */
export const createSuccessResponse = (
  message,
  data = null,
  additionalData = {},
) => {
  const response = {
    success: true,
    message,
    ...additionalData,
  };

  if (data !== null) {
    response.data = data;
  }

  return response;
};
