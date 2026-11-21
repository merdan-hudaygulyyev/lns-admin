import { NextFunction, Request, RequestHandler, Response } from "express";

/** Forwards rejected promises from async controllers to the central error handler. */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
