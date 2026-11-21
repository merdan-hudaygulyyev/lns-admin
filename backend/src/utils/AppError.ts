export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly errors?: Record<string, string>;

  constructor(
    statusCode: number,
    message: string,
    code = "APP_ERROR",
    errors?: Record<string, string>,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, errors?: Record<string, string>): AppError {
    return new AppError(400, message, "BAD_REQUEST", errors);
  }

  static unauthorized(message = "Authentication required"): AppError {
    return new AppError(401, message, "UNAUTHORIZED");
  }

  static forbidden(message = "You do not have access to this resource"): AppError {
    return new AppError(403, message, "FORBIDDEN");
  }

  static notFound(message = "Resource not found"): AppError {
    return new AppError(404, message, "NOT_FOUND");
  }

  static conflict(message: string, errors?: Record<string, string>): AppError {
    return new AppError(409, message, "CONFLICT", errors);
  }

  static unprocessable(message: string, errors: Record<string, string>): AppError {
    return new AppError(422, message, "VALIDATION_ERROR", errors);
  }
}
