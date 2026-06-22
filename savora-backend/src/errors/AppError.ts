export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    this.errors = errors;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, errors?: Record<string, string[]>) {
    super(message, 400, "BAD_REQUEST", errors);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(errors: Record<string, string[]>) {
    super("Validation failed", 400, "VALIDATION_ERROR", errors);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super(message, 500, "INTERNAL_SERVER_ERROR");
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}