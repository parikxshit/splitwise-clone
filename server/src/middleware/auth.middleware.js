const { verifyAccessToken } = require('../utils/jwt');
const { UnauthorizedError } = require('../utils/errors');
const { ERROR_MESSAGES } = require('../constants');

const protect = (req, res, next) => {

    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError(ERROR_MESSAGES.NO_TOKEN);
    }

    const token = authHeader.split(' ')[1];

    const decoded = verifyAccessToken(token);
    req.user = { userId: decoded.userId };

    next();
};

module.exports = {
    protect
};