const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const groupRoutes = require('./groupRoutes');
const { protect } = require('../middleware/auth.middleware');

// Mount auth routes at /api/auth
router.use('/auth', authRoutes);

// All group routes are protected, so we apply the protect middleware to the entire groupRoutes
router.use('/groups', protect, groupRoutes);

router.get('/protected', protect, (req, res) => {
  res.json({
    success: true,
    message: 'You are authorized!',
    data: { userId: req.user.userId }
  });
});

module.exports = router;
