const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { validate, registerSchema, loginSchema } = require('../validators/auth.validator');

// POST /api/auth/register
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;
