import { promises as fs } from "fs";
import path from "path";
import { Request, Response } from "express";
import { env } from "../config/env";
import type { DownloadFileParams } from "../schemas/uploads.schema";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const download = asyncHandler(async (req: Request, res: Response) => {
  const { filename } = req.params as DownloadFileParams;
  if (path.basename(filename) !== filename) throw AppError.notFound("File not found");

  const filePath = path.join(env.uploadAbsoluteDir, filename);
  try {
    await fs.access(filePath);
  } catch {
    throw AppError.notFound("File not found");
  }

  res.download(filePath, filename);
});
