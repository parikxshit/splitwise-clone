const ERROR_MESSAGES = {
  MISSING_REQUIRED_FIELDS: 'Please provide all required fields (name, email, password)',
  USER_ALREADY_EXISTS: 'User with this email already exists',
  REGISTRATION_FAILED: 'Server error during registration',
  GENERIC_SERVER_ERROR: 'Internal Server Error',
  MISSING_API_KEY: 'Access Denied: Missing x-api-key header',
  INVALID_API_KEY: 'Access Denied: Invalid x-api-key',
};

module.exports = ERROR_MESSAGES;
