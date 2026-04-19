const prisma = require('../config/db');
const { hashPassword } = require('../utils/password');
const { BadRequestError } = require('../utils/errors');
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

module.exports = { register };