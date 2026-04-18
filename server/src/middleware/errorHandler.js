const { AppError } = require('../utils/errors');
const { sendError } = require('../utils/response');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../constants');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {

  // Log the error using winston
  logger.error(`${err.message}`);

  // Show stack trace only in development
  if (process.env.NODE_ENV !== 'production') {
    logger.debug(err.stack);
  }

  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message);
  }

  return sendError(
    res,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ERROR_MESSAGES.GENERIC_SERVER_ERROR
  );
};

module.exports = errorHandler;