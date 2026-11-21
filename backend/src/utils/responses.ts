import { Response } from "express";
import type { PaginationMeta } from "../types";

export interface SuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: PaginationMeta,
): void {
  const body: SuccessEnvelope<T> = { success: true, data };
  if (meta) body.meta = meta;
  res.status(statusCode).json(body);
}
