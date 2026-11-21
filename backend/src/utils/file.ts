import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { env } from "../config/env";

export type SupportedImageExt =
  | "jpg"
  | "png"
  | "gif"
  | "webp"
  | "avif"
  | "bmp"
  | "tiff"
  | "svg"
  | "heic"
  | "ico";

export function publicPathToAbsolute(publicPath: string): string {
  return path.join(env.uploadAbsoluteDir, path.basename(publicPath));
}

export async function saveImage(
  buffer: Buffer,
  ext: SupportedImageExt,
): Promise<string> {
  const filename = `${randomUUID()}.${ext}`;
  await fs.writeFile(path.join(env.uploadAbsoluteDir, filename), buffer);
  return `/uploads/${filename}`;
}

export async function removeImage(publicPath: string | null | undefined): Promise<void> {
  if (!publicPath) return;
  try {
    await fs.unlink(publicPathToAbsolute(publicPath));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
