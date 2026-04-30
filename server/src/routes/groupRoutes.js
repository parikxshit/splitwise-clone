const { Router } = require('express')
const { protect } = require('../middleware/auth.middleware')
const { createGroup, getMyGroups, getGroupById, addMember, deleteGroup } = require('../controllers/groupController')
const { validate, createGroupSchema, addMemberSchema } = require('../validators')

const router = Router()

// POST /api/groups - Create a new group
router.post('/',  validate(createGroupSchema), createGroup);

// GET /api/groups - Get all groups the user is a member of
router.get('/', getMyGroups)

// GET /api/groups/:id - Get group details by ID
router.get('/:id',  getGroupById)

// POST /api/groups/:id/members - Add a member to the group
router.post('/:id/members',  validate(addMemberSchema), addMember)

// DELETE /api/groups/:id - Delete a group
router.delete('/:id', deleteGroup)

module.exports = router