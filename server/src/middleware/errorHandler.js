const { HTTP_STATUS, ERROR_MESSAGES } = require('../constants');

const errorHandler = (err, req, res, next) => {
  // Log the error for the developer
  console.error(`[Error]: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  const statusCode = res.statusCode === HTTP_STATUS.OK ? HTTP_STATUS.INTERNAL_SERVER_ERROR : res.statusCode;
  
  res.status(statusCode).json({
    message: err.message || ERROR_MESSAGES.GENERIC_SERVER_ERROR,
  });
};

module.exports = errorHandler;
