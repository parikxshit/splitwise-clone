const { HTTP_STATUS, ERROR_MESSAGES } = require('../constants');

const requireApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  // We look for API_KEY in your .env file, with a fallback for local testing
  const validApiKey = process.env.API_KEY || 'default-dev-api-key';

  if (!apiKey) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: ERROR_MESSAGES.MISSING_API_KEY });
  }

  if (apiKey !== validApiKey) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({ message: ERROR_MESSAGES.INVALID_API_KEY });
  }

  next();
};

module.exports = requireApiKey;
