const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { validate, registerSchema } = require('../validators/auth.validator');

// POST /api/auth/register
router.post('/register', validate(registerSchema), authController.register);

module.exports = router;
