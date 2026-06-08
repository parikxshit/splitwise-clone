const { Router } = require('express')
const { createExpense, getExpenses, deleteExpense } = require('../controllers/expenseController')
const { validate, createExpenseSchema } = require('../validators')

const groupExpenseRouter = Router()
const expenseRouter = Router()

// mounted under /groups
groupExpenseRouter.post('/:id/expenses', validate(createExpenseSchema), createExpense)
groupExpenseRouter.get('/:id/expenses', getExpenses)

// mounted under /expenses
expenseRouter.delete('/:id', deleteExpense)

module.exports = { groupExpenseRouter, expenseRouter }