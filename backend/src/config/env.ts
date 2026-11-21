import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

/** Everything coming from the process environment is validated once at startup. */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().startsWith("/").default("/api/v1"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().min(2).default("45m"),
  ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, "ENCRYPTION_KEY must be 64 hex characters (32 bytes)"),
  PASSPORT_HASH_KEY: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, "PASSPORT_HASH_KEY must be 64 hex characters (32 bytes)"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(12).max(16).default(12),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:3000"),
  // Leave empty for localhost/host-only cookies. Use ".example.com" when the
  // frontend and backend live on sibling subdomains of the same registrable domain.
  COOKIE_DOMAIN: z.string().optional().default(""),
  COOKIE_SAME_SITE: z.enum(["lax", "none", "strict"]).default("lax"),
  UPLOAD_DIR: z.string().min(1).default("uploads"),
  MAX_FILE_SIZE_MB: z.coerce.number().int().positive().max(100).default(10),
  ADMIN_EMAIL: z.string().email().default("admin@example.com"),
  ADMIN_USERNAME: z.string().min(1).default("admin"),
  ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD must be at least 8 characters"),
  ADMIN_FULL_NAME: z.string().min(1).default("Default Administrator"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`);
  throw new Error(`Invalid environment configuration:\n${details.join("\n")}`);
}

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === "production",
  corsOrigins: parsed.data.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
  uploadAbsoluteDir: path.resolve(process.cwd(), parsed.data.UPLOAD_DIR),
  maxFileSizeBytes: parsed.data.MAX_FILE_SIZE_MB * 1024 * 1024,
};

export type Env = typeof env;
