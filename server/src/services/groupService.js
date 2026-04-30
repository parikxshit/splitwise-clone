const prisma = require('../config/db')
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors')
const { ERROR_MESSAGES } = require('../constants')
const logger = require('../utils/logger')

const createGroup = async ({ name, description, userId }) => {
  const group = await prisma.group.create({
    data: {
      name,
      description,
      createdBy: userId,
      members: {
        create: {
          userId,
        },
      },
    },
    include: {
      members: true,
    },
  })

  logger.info(`Group created: ${group.name} by userId: ${userId}`)
  return group
}

const getMyGroups = async (userId) => {
  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          expenses: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return groups
}

const getGroupById = async ({ groupId, userId }) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      expenses: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!group) throw new NotFoundError('Group not found')

  const isMember = group.members.some((m) => m.userId === userId)
  if (!isMember) throw new ForbiddenError('You are not a member of this group')

  return group
}

const addMember = async ({ groupId, email, userId }) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  })

  if (!group) throw new NotFoundError('Group not found')

  if (group.createdBy !== userId) throw new ForbiddenError('Only the group creator can add members')

  const userToAdd = await prisma.user.findUnique({
    where: { email },
  })

  if (!userToAdd) throw new NotFoundError('User with this email not found')

  const alreadyMember = group.members.some((m) => m.userId === userToAdd.id)
  if (alreadyMember) throw new BadRequestError('User is already a member of this group')

  const member = await prisma.groupMember.create({
    data: {
      groupId,
      userId: userToAdd.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  logger.info(`User ${userToAdd.email} added to group ${group.name}`)
  return member
}

const deleteGroup = async ({ groupId, userId }) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
  })

  if (!group) throw new NotFoundError('Group not found')

  if (group.createdBy !== userId) throw new ForbiddenError('Only the group creator can delete this group')

  await prisma.group.delete({
    where: { id: groupId },
  })

  logger.info(`Group deleted: ${group.name} by userId: ${userId}`)
}

module.exports = {
  createGroup,
  getMyGroups,
  getGroupById,
  addMember,
  deleteGroup,
}