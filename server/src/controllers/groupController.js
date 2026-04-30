const groupService = require('../services/groupService')
const { sendSuccess } = require('../utils/response')
const { HTTP_STATUS, SUCCESS_MESSAGES } = require('../constants')

exports.createGroup = async (req, res) => {
  const { name, description } = req.body
  const group = await groupService.createGroup({ name, description, userId: req.user.userId })
  return sendSuccess(res, HTTP_STATUS.CREATED, SUCCESS_MESSAGES.GROUP_CREATED, group)
}

exports.getMyGroups = async (req, res) => {
  const groups = await groupService.getMyGroups(req.user.userId)
  return sendSuccess(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.GROUPS_FETCHED, groups)
}

exports.getGroupById = async (req, res) => {
  const group = await groupService.getGroupById({ groupId: req.params.id, userId: req.user.userId })
  return sendSuccess(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.GROUP_FETCHED, group)
}

exports.addMember = async (req, res) => {
  const { email } = req.body
  const member = await groupService.addMember({ groupId: req.params.id, email, userId: req.user.userId })
  return sendSuccess(res, HTTP_STATUS.CREATED, SUCCESS_MESSAGES.MEMBER_ADDED, member)
}

exports.deleteGroup = async (req, res) => {
  await groupService.deleteGroup({ groupId: req.params.id, userId: req.user.userId })
  return sendSuccess(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.GROUP_DELETED, null)
}