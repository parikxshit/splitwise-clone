const { z } = require('zod');

const createGroupSchema = z.object({
  name: z.string()
    .min(2, 'Group name must be at least 2 characters')
    .max(50, 'Group name must be less than 50 characters'),
  description: z.string()
    .max(200, 'Description must be less than 200 characters')
    .optional(),
})

const addMemberSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address'),
})

module.exports = {
  createGroupSchema,
  addMemberSchema,
}