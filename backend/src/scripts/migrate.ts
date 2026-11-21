import fs from "fs/promises";
import path from "path";
import { pool } from "../config/database";
import { logger } from "../config/logger";

/** Executes the idempotent schema script. Create the database first (see sql/00_create_database.sql). */
async function main(): Promise<void> {
  const schemaPath = path.resolve(process.cwd(), "sql", "01_schema.sql");
  const sql = await fs.readFile(schemaPath, "utf8");
  await pool.query(sql);
  logger.info("Database schema is up to date");
}

main()
  .catch((error: unknown) => {
    logger.error("Migration failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    process.exitCode = 1;
  })
  .finally(() => {
    void pool.end();
  });
