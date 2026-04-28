const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { validate, registerSchema, loginSchema, refreshSchema } = require('../validators/auth.validator');
const { protect } = require('../middleware/auth.middleware');

// POST /api/auth/register
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

// POST /api/auth/refresh
router.post('/refresh', validate(refreshSchema), authController.refresh);

//POST /api/auth/logout
router.post('/logout', protect, authController.logout);

module.exports = router;
