import { pool } from "../config/database";
import { env } from "../config/env";
import { logger } from "../config/logger";
import * as adminsRepository from "../repositories/admins.repository";
import { hashPassword } from "../services/auth.service";

/** Creates or updates the bootstrap admin using values from .env. */
async function main(): Promise<void> {
  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);
  const admin = await adminsRepository.upsertAdmin({
    email: env.ADMIN_EMAIL.toLowerCase(),
    username: env.ADMIN_USERNAME,
    passwordHash,
    fullName: env.ADMIN_FULL_NAME,
  });
  logger.info("Default admin seeded", { id: admin.id, email: admin.email, username: admin.username });
}

main()
  .catch((error: unknown) => {
    logger.error("Seed failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    process.exitCode = 1;
  })
  .finally(() => {
    void pool.end();
  });
