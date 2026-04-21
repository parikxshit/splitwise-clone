const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const { protect } = require('../middleware/auth.middleware');

router.use('/auth', authRoutes);

router.get('/protected', protect, (req, res) => {
  res.json({
    success: true,
    message: 'You are authorized!',
    data: { userId: req.user.userId }
  });
});

module.exports = router;
