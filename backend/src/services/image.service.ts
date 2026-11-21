import fs from "fs/promises";
import path from "path";
import { env } from "../config/env";
import { removeImage, saveImage, type SupportedImageExt } from "../utils/file";
import { detectImageFormat } from "../utils/imageSignature";

/** Writes the already-validated upload buffer under /backend/uploads. */
export async function storeMemberImage(file: Express.Multer.File): Promise<string> {
  const format = detectImageFormat(file.buffer);
  if (!format) {
    throw new Error("Image signature was not validated before storage");
  }
  return saveImage(file.buffer, format.ext as SupportedImageExt);
}

export async function deleteMemberImage(publicPath: string | undefined): Promise<void> {
  await removeImage(publicPath);
}

export function imageUrl(publicPath: string): string {
  // Stored value is already a public URL path such as /uploads/uuid.png.
  return publicPath.startsWith("/") ? publicPath : `/${path.basename(publicPath)}`;
}
