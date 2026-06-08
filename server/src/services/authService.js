const prisma = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');
const { ERROR_MESSAGES } = require('../constants');
const logger = require('../utils/logger');


const register = async ({ name, email, password }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new BadRequestError(ERROR_MESSAGES.USER_ALREADY_EXISTS);
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  logger.info(`New user registered: ${newUser.email}`);

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  };
};

const login = async ({ email, password }) => {

  // Find user by mail
  const user = await prisma.user.findUnique({
    where: { email },
  });
  // Check if user exists
  if (!user) {
    throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Compare password
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Generate JWT token
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });


  logger.info(`User logged in: EMAIL:${user.email} | ID:${user.id}`);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  }
};

const refresh = async ({ refreshToken }) => {
  const decoded = verifyRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) throw new UnauthorizedError(ERROR_MESSAGES.INVALID_TOKEN);

  if (user.refreshToken !== refreshToken) throw new UnauthorizedError(ERROR_MESSAGES.INVALID_TOKEN);

  const accessToken = generateAccessToken(user.id);

  logger.info(`Access token refreshed for: ${user.email}`);

  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    }
  };

};

const logout = async (userId) => {
  logger.info(`User logged out: ${userId}`);
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null }
  });
};


module.exports = {
  register,
  login,
  refresh,
  logout
};