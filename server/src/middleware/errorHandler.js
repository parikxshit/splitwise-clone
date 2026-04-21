const { AppError, handlePrismaError } = require('../utils/errors');
const { sendError } = require('../utils/response');
const { ERROR_MESSAGES } = require('../constants');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {

    // Operational errors → expected, just a warning
    if (err instanceof AppError) {
        logger.warn(`${err.name}: ${err.message}`);
        return sendError(
        res,
        err.statusCode,
        err.message,
        err.errors || [{ message: err.message }]
        );
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        logger.warn(`JWT Error: ${err.message}`);
        return sendError(res, 401, ERROR_MESSAGES.INVALID_TOKEN, [{ message: ERROR_MESSAGES.INVALID_TOKEN }]);
    }

    if (err.name === 'TokenExpiredError') {
        logger.warn(`JWT Expired: ${err.message}`);
        return sendError(res, 401, 'Token expired, please login again', [{ message: 'Token expired, please login again' }]);
    }

    // Prisma errors → log as warning too
    if (err.code?.startsWith('P')) {
        const prismaError = handlePrismaError(err);
        logger.warn(`PrismaError ${err.code}: ${err.message}`);
        return sendError(
        res,
        prismaError.statusCode,
        prismaError.message,
        [{ message: prismaError.message }]
        );
    }

    // Unknown errors → something actually broke
    // log as error WITH stack trace
    logger.error(`${err.name}: ${err.message}`);
    if (process.env.NODE_ENV !== 'production') {
        logger.debug(err.stack);
    }
    return sendError(
        res,
        500,
        ERROR_MESSAGES.GENERIC_SERVER_ERROR,
        [{ message: ERROR_MESSAGES.GENERIC_SERVER_ERROR }]
    );
};

module.exports = errorHandler;