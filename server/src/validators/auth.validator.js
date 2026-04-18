const { z } = require('zod');
const { sendError } = require('../utils/response');
const { HTTP_STATUS } = require('../constants');


// Define a Zod schema for user registration
const registerSchema = z.object({
  name: z.string().min(2, 'Name is required').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long').max(100, 'Password cannot exceed 100 characters'),
});

// Middleware to validate request body against the schema
const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    console.log('Validation result:', result); // Debugging log
    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path[0],
        message: err.message,
      }));

      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Validation failed', errors);
    }

    req.body = result.data;
    next();
  };
};

module.exports = {
    registerSchema,
    validate,
};