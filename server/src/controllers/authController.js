const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');
const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../constants');
const logger = require('../utils/logger');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await authService.register({ name, email, password });
    return sendSuccess(res, HTTP_STATUS.CREATED, SUCCESS_MESSAGES.USER_REGISTERED, user);
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    return sendError(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message || ERROR_MESSAGES.REGISTRATION_FAILED
    );
  }
};