const authService = require('../services/authService');
const { sendSuccess } = require('../utils/response');
const { HTTP_STATUS, SUCCESS_MESSAGES } = require('../constants');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const user = await authService.register({ name, email, password });
  return sendSuccess(res, HTTP_STATUS.CREATED, SUCCESS_MESSAGES.USER_REGISTERED, user);
};