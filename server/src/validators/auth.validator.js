const { z } = require('zod');
const { ValidationError } = require('../utils/errors');

const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z.string()
    .email('Please provide a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters'),
});

const loginSchema = z.object({
  email: z.string()
    .email('Please provide a valid email address'),
  password: z.string()
    .min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string()
    .min(1, 'Refresh token is required'),
});

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path[0],
        message: err.message,
      }));
      throw new ValidationError(errors); // ← pure throw
    }

    req.body = result.data;
    next();
  };
};

module.exports = { 
  registerSchema,
  loginSchema,
  refreshSchema,
  validate
};