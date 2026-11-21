import fs from "fs/promises";
import path from "path";
import { pool } from "../config/database";
import { logger } from "../config/logger";

/** Runs every numbered schema file in order. `00_create_database.sql` is setup only. */
async function main(): Promise<void> {
  const sqlDir = path.resolve(process.cwd(), "sql");
  const files = (await fs.readdir(sqlDir))
    .filter((file) => /^\d{2}_.*\.sql$/.test(file) && !file.startsWith("00_"))
    .sort();

  for (const file of files) {
    const sql = await fs.readFile(path.join(sqlDir, file), "utf8");
    await pool.query(sql);
    logger.info("Applied schema file", { file });
  }

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
