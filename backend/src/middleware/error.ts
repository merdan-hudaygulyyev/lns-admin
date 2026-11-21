import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { logger } from "../config/logger";
import { AppError } from "../utils/AppError";

interface ErrorResponseBody {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

export function notFoundHandler(_req: Request, res: Response): void {
  const body: ErrorResponseBody = { success: false, message: "Endpoint not found" };
  res.status(404).json(body);
}

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let statusCode = 500;
  let message = "Internal server error";
  let errors: Record<string, string> | undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors;
  } else if (error instanceof ZodError) {
    statusCode = 422;
    message = "Validation failed";
    errors = Object.fromEntries(
      error.issues.map((issue) => [issue.path.join(".") || "body", issue.message]),
    );
  } else if (error instanceof multer.MulterError) {
    statusCode = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    message = error.code === "LIMIT_FILE_SIZE" ? "Image exceeds the maximum allowed size" : error.message;
    errors = { images: message };
  } else if (error instanceof SyntaxError && "body" in error) {
    statusCode = 400;
    message = "Malformed JSON body";
  } else if ((error as { status?: number }).status === 404) {
    // express.static with fallthrough:false reports missing files this way.
    statusCode = 404;
    message = "File not found";
  } else if ((error as { code?: string }).code === "23505") {
    statusCode = 409;
    message = "A unique value is already in use";
  }

  if (statusCode >= 500) {
    logger.error("Unhandled request error", {
      method: req.method,
      path: req.baseUrl + req.path,
      message: error instanceof Error ? error.message : String(error),
    });
  }

  const body: ErrorResponseBody = { success: false, message };
  if (errors) body.errors = errors;
  res.status(statusCode).json(body);
}
