import { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError, ZodTypeAny } from "zod";
import { AppError } from "../utils/AppError";

function flattenZodError(error: ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path.join(".") || "body";
    if (!result[field]) result[field] = issue.message;
  }
  return result;
}

function validateSource(
  schema: ZodTypeAny,
  source: "body" | "query" | "params",
): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      next(AppError.unprocessable("Validation failed", flattenZodError(result.error)));
      return;
    }
    // Replace body/params with the coerced, sanitised value. Express 4 exposes
    // `query` through a getter, so the validated query is stored separately.
    if (source === "query") {
      (req as unknown as Record<string, unknown>).validatedQuery = result.data;
    } else {
      (req as unknown as Record<string, unknown>)[source] = result.data;
    }
    next();
  };
}

export const validateBody = (schema: ZodTypeAny): RequestHandler => validateSource(schema, "body");
export const validateQuery = (schema: ZodTypeAny): RequestHandler => validateSource(schema, "query");
export const validateParams = (schema: ZodTypeAny): RequestHandler => validateSource(schema, "params");
