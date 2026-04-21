const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { validate, registerSchema, loginSchema, refreshSchema } = require('../validators/auth.validator');
const { refresh } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

//POST /api/auth/refersh
router.post('/refresh', validate(refreshSchema), authController.refresh);

module.exports = router;
