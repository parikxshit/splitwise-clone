const { INVALID } = require("zod");

const ERROR_MESSAGES = {
  MISSING_REQUIRED_FIELDS: 'Please provide all required fields (name, email, password)',
  USER_ALREADY_EXISTS: 'User with this email already exists',
  REGISTRATION_FAILED: 'Server error during registration',
  GENERIC_SERVER_ERROR: 'Internal Server Error',
  INVALID_CREDENTIALS: 'Invalid email or password',
  NO_TOKEN: 'Access denied, no token provided',          // ← ADD
  INVALID_TOKEN: 'Access denied, invalid token', 
};

module.exports = ERROR_MESSAGES;
