const { z } = require('zod')
const { ValidationError } = require('../utils/errors');
const { createGroupSchema, addMemberSchema } = require('./group.validator')
const { registerSchema, loginSchema, refreshSchema } = require('./auth.validator')

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path[0],
        message: err.message,
      }))
      throw new ValidationError(errors)
    }

    req.body = result.data
    next()
  }
}

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  refreshSchema,
  createGroupSchema,
  addMemberSchema,
}