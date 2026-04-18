const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../constants');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 2. Call service
    const user = await authService.register({ name, email, password });

    // 3. Send response
    return sendSuccess(res, HTTP_STATUS.CREATED, 'User registered successfully', user);

  } catch (error) {
    return sendError(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message || ERROR_MESSAGES.REGISTRATION_FAILED
    );
  }
};