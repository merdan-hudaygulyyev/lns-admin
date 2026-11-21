import app from "./app";
import { checkDatabaseConnection } from "./config/database";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { ensureUploadDirectory } from "./config/upload";

async function start(): Promise<void> {
  await ensureUploadDirectory();
  await checkDatabaseConnection();

  app.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}${env.API_PREFIX}`);
  });
}

start().catch((error: unknown) => {
  logger.error("Failed to start server", {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
