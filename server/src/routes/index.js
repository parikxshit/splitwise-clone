const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const groupRoutes = require('./groupRoutes');
const { groupExpenseRouter, expenseRouter } = require('./expenseRoutes');
const { protect } = require('../middleware/auth.middleware');

// Mount auth routes at /api/auth
router.use('/auth', authRoutes);

// All group routes are protected, so we apply the protect middleware to the entire groupRoutes
router.use('/groups', protect, groupRoutes);

// Expense routes are also protected, so we apply the protect middleware to the entire expenseRoutes
router.use('/groups', protect, groupExpenseRouter);

// Expense routes that are not nested under groups (like delete) are mounted separately
router.use('/expenses', protect, expenseRouter)

router.get('/protected', protect, (req, res) => {
  res.json({
    success: true,
    message: 'You are authorized!',
    data: { userId: req.user.userId }
  });
});

module.exports = router;
