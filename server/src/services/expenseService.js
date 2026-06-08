const prisma = require('../config/db')
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors')
const logger = require('../utils/logger')

const createExpense = async ({ groupId, description, amount, splitBetween, payerId }) => {
  // check group exists
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  })

  if (!group) throw new NotFoundError('Group not found')

  // check payer is a member
  const isPayerMember = group.members.some((m) => m.userId === payerId)
  if (!isPayerMember) throw new ForbiddenError('You are not a member of this group')

  // check all splitBetween users are members
  const memberIds = group.members.map((m) => m.userId)
  const invalidUsers = splitBetween.filter((userId) => !memberIds.includes(userId))
  if (invalidUsers.length > 0) throw new BadRequestError('Some users in splitBetween are not members of this group')

  // calculate equal split
  const splitAmount = Number((amount / splitBetween.length).toFixed(2))

  // create expense and splits in one transaction
  const expense = await prisma.$transaction(async (tx) => {
    const newExpense = await tx.expense.create({
      data: {
        description,
        amount,
        groupId,
        payerId,
        splits: {
          create: splitBetween.map((userId) => ({
            userId,
            amount: splitAmount,
          })),
        },
      },
      include: {
        payer: {
          select: { id: true, name: true, email: true },
        },
        splits: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    })

    return newExpense
  })

  logger.info(`Expense created: ${description} of ${amount} in group ${groupId}`)
  return expense
}

const getExpenses = async ({ groupId, userId }) => {
  // check group exists and user is member
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  })

  if (!group) throw new NotFoundError('Group not found')

  const isMember = group.members.some((m) => m.userId === userId)
  if (!isMember) throw new ForbiddenError('You are not a member of this group')

  const expenses = await prisma.expense.findMany({
    where: { groupId },
    include: {
      payer: {
        select: { id: true, name: true, email: true },
      },
      splits: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return expenses
}

const deleteExpense = async ({ expenseId, userId }) => {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      group: {
        include: { members: true },
      },
    },
  })

  if (!expense) throw new NotFoundError('Expense not found')

  // only payer or group creator can delete
  const isCreator = expense.group.createdBy === userId
  const isPayer = expense.payerId === userId

  if (!isCreator && !isPayer) {
    throw new ForbiddenError('Only the expense payer or group creator can delete this expense')
  }

  await prisma.expense.delete({
    where: { id: expenseId },
  })

  logger.info(`Expense deleted: ${expense.description} by userId: ${userId}`)
}

module.exports = {
  createExpense,
  getExpenses,
  deleteExpense,
}