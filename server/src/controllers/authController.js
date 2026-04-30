const authService = require('../services/authService');
const { sendSuccess } = require('../utils/response');
const { HTTP_STATUS, SUCCESS_MESSAGES } = require('../constants');
const logger = require('../utils/logger');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const user = await authService.register({ name, email, password });
  return sendSuccess(res, HTTP_STATUS.CREATED, SUCCESS_MESSAGES.USER_REGISTERED, user);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  return sendSuccess(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.LOGIN_SUCCESSFUL, result);
};

exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  const data = await authService.refresh({ refreshToken });
  return sendSuccess(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.TOKEN_REFRESHED, data);
};

exports.logout = async (req, res) => {
  logger.info(`User logged out: ${req.user}`);
  await authService.logout(req.user.userId);
  return sendSuccess(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.LOGOUT_SUCCESSFUL, null);
}