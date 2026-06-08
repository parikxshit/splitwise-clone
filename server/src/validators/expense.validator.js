const { z } = require('zod')

const createExpenseSchema = z.object({
  description: z.string()
    .min(1, 'Description is required')
    .max(100, 'Description must be less than 100 characters'),
  amount: z.number()
    .positive('Amount must be greater than 0')
    .multipleOf(0.01, 'Amount can have at most 2 decimal places'),
  splitBetween: z.array(z.string().uuid('Invalid user ID'))
    .min(1, 'At least one user is required to split with'),
})

module.exports = { createExpenseSchema }