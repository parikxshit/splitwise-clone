class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

class ValidationError extends AppError {
  constructor(errors) {
    super('Validation failed', 400);
    this.errors = errors;
  }
}

class BadRequestError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message) {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message) {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

class InternalError extends AppError {
  constructor(message) {
    super(message, 500);
  }
}

const handlePrismaError = (error) => {
  if (error.code === 'P2002') {
    const field = error.meta?.target?.[0] || 'field';
    return new BadRequestError(`${field} already exists`);
  }
  if (error.code === 'P2025') {
    return new NotFoundError('Record not found');
  }
  if (error.code === 'P2003') {
    return new BadRequestError('Related record not found');
  }
  return new InternalError('Database error occurred');
};

module.exports = {
  AppError,
  ValidationError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  InternalError,
  handlePrismaError,
};