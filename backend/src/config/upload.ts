import fs from "fs/promises";
import { env } from "./env";
import { logger } from "./logger";

/** Creates the local upload directory before the server starts accepting files. */
export async function ensureUploadDirectory(): Promise<void> {
  await fs.mkdir(env.uploadAbsoluteDir, { recursive: true });
  logger.info("Upload directory ready", { path: env.uploadAbsoluteDir });
}
