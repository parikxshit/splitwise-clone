const jwt = require('jsonwebtoken');
const logger = require('./logger');

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (userId) => {
  console.log(process.env.JWT_REFRESH_SECRET)
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

const verifyRefreshToken = (token) => {
  logger.info(process.env.JWT_REFRESH_SECRET, "refresh secret")
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
};
module.exports = {
  generateRefreshToken,
  verifyRefreshToken,
  generateAccessToken,
  verifyAccessToken,
};