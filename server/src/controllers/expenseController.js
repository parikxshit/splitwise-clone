const expenseService = require('../services/expenseService')
const { sendSuccess } = require('../utils/response')
const { HTTP_STATUS, SUCCESS_MESSAGES } = require('../constants')

exports.createExpense = async (req, res) => {
  const { description, amount, splitBetween } = req.body
  const expense = await expenseService.createExpense({
    groupId: req.params.id,
    description,
    amount,
    splitBetween,
    payerId: req.user.userId,
  })
  return sendSuccess(res, HTTP_STATUS.CREATED, SUCCESS_MESSAGES.EXPENSE_CREATED, expense)
}

exports.getExpenses = async (req, res) => {
  const expenses = await expenseService.getExpenses({
    groupId: req.params.id,
    userId: req.user.userId,
  })
  return sendSuccess(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.EXPENSES_FETCHED, expenses)
}

exports.deleteExpense = async (req, res) => {
  await expenseService.deleteExpense({
    expenseId: req.params.id,
    userId: req.user.userId,
  })
  return sendSuccess(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.EXPENSE_DELETED, null)
}