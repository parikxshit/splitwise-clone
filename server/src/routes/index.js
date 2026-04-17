const express = require('express');
const router = express.Router();

const requireApiKey = require('../middleware/apiKey');
const authRoutes = require('./authRoutes');

// Enforce the API key on all routes inside this router
router.use(requireApiKey);

router.use('/auth', authRoutes);

module.exports = router;
