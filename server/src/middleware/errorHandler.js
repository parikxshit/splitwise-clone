const { AppError, handlePrismaError } = require('../utils/errors');
const { sendError } = require('../utils/response');
const { ERROR_MESSAGES } = require('../constants');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}`);

  if (process.env.NODE_ENV !== 'production') {
    logger.debug(err.stack);
  }

  // ValidationError → already has errors array
  // BadRequestError, NotFoundError etc → wrap in array
  if (err instanceof AppError) {
    return sendError(
      res,
      err.statusCode,
      err.message,
      err.errors || [{ message: err.message }]  // ← always array
    );
  }

  // Prisma errors
  if (err.code?.startsWith('P')) {
    const prismaError = handlePrismaError(err);
    return sendError(
      res,
      prismaError.statusCode,
      prismaError.message,
      [{ message: prismaError.message }]  // ← always array
    );
  }

  // Unknown errors
  return sendError(
    res,
    500,
    ERROR_MESSAGES.GENERIC_SERVER_ERROR,
    [{ message: ERROR_MESSAGES.GENERIC_SERVER_ERROR }]  // ← always array
  );
};

module.exports = errorHandler;